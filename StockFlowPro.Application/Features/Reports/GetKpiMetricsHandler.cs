using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetKpiMetricsHandler : IRequestHandler<GetKpiMetricsQuery, KpiMetricsDto>
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IProductRepository _productRepository;

    public GetKpiMetricsHandler(IInvoiceRepository invoiceRepository, IProductRepository productRepository)
    {
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
    }

    public async Task<KpiMetricsDto> Handle(GetKpiMetricsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine("[REPORTS - KPI METRICS] Generating KPI metrics");

        var startDate = request.StartDate ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        // Current period data
        var currentInvoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var currentActiveInvoices = currentInvoices.Where(i => i.IsActive).ToList();

        // Comparison period data (if provided)
        List<Domain.Entities.Invoice> comparisonActiveInvoices = new();
        if (request.ComparisonStartDate.HasValue && request.ComparisonEndDate.HasValue)
        {
            var comparisonInvoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(
                request.ComparisonStartDate.Value, request.ComparisonEndDate.Value, cancellationToken);
            comparisonActiveInvoices = comparisonInvoices.Where(i => i.IsActive).ToList();
        }

        // Products data
        var products = await _productRepository.GetAllAsync(cancellationToken);

        // Calculate current metrics
        var totalRevenue = currentActiveInvoices.Sum(i => i.Total);
        var totalOrders = currentActiveInvoices.Count;
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        var inventoryValue = products.Sum(p => p.GetTotalValue());
        var activeProducts = products.Count(p => p.IsActive);
        var lowStockAlerts = products.Count(p => p.IsLowStock());
        var outOfStockProducts = products.Count(p => !p.IsInStock());

        // Calculate comparison metrics and growth rates
        var revenueGrowth = CalculateGrowthRate(
            comparisonActiveInvoices.Sum(i => i.Total), 
            totalRevenue);
        
        var orderGrowth = CalculateGrowthRate(
            comparisonActiveInvoices.Count, 
            totalOrders);

        var comparisonAov = comparisonActiveInvoices.Count > 0 
            ? comparisonActiveInvoices.Sum(i => i.Total) / comparisonActiveInvoices.Count 
            : 0;
        var aovGrowth = CalculateGrowthRate(comparisonAov, averageOrderValue);

        // Calculate inventory turnover (simplified)
        var totalCost = CalculateTotalCost(currentActiveInvoices, products);
        var inventoryTurnover = inventoryValue > 0 ? totalCost / inventoryValue : 0;

        // Calculate gross profit margin
        var grossProfitMargin = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue : 0;

        Console.WriteLine($"[REPORTS - KPI METRICS] Metrics calculated - Revenue: {totalRevenue:C}, Orders: {totalOrders}, AOV: {averageOrderValue:C}");

        return new KpiMetricsDto
        {
            TotalRevenue = totalRevenue,
            RevenueGrowth = revenueGrowth,
            TotalOrders = totalOrders,
            OrderGrowth = orderGrowth,
            AverageOrderValue = averageOrderValue,
            AovGrowth = aovGrowth,
            InventoryValue = inventoryValue,
            InventoryTurnover = inventoryTurnover,
            GrossProfitMargin = grossProfitMargin,
            ActiveProducts = activeProducts,
            LowStockAlerts = lowStockAlerts,
            OutOfStockProducts = outOfStockProducts
        };
    }

    private decimal CalculateGrowthRate(decimal previousValue, decimal currentValue)
    {
        if (previousValue == 0) return currentValue > 0 ? 1 : 0;
        return (currentValue - previousValue) / previousValue;
    }

    private decimal CalculateTotalCost(List<Domain.Entities.Invoice> invoices, IEnumerable<Domain.Entities.Product> products)
    {
        var productCostLookup = products.ToDictionary(p => p.Id, p => p.CostPerItem);
        
        return invoices
            .SelectMany(i => i.Items)
            .Sum(item => productCostLookup.GetValueOrDefault(item.ProductId, 0) * item.Quantity);
    }
}