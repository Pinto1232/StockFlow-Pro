using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetAlertsHandler : IRequestHandler<GetAlertsQuery, IEnumerable<AlertDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IInvoiceRepository _invoiceRepository;

    public GetAlertsHandler(IProductRepository productRepository, IInvoiceRepository invoiceRepository)
    {
        _productRepository = productRepository;
        _invoiceRepository = invoiceRepository;
    }

    public async Task<IEnumerable<AlertDto>> Handle(GetAlertsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine("[REPORTS - ALERTS] Generating system alerts");

        var alerts = new List<AlertDto>();
        var since = request.Since ?? DateTime.UtcNow.AddDays(-30);

        // Get inventory alerts
        var inventoryAlerts = await GenerateInventoryAlerts(cancellationToken);
        alerts.AddRange(inventoryAlerts);

        // Get sales alerts
        var salesAlerts = await GenerateSalesAlerts(since, cancellationToken);
        alerts.AddRange(salesAlerts);

        // Get performance alerts
        var performanceAlerts = await GeneratePerformanceAlerts(since, cancellationToken);
        alerts.AddRange(performanceAlerts);

        // Filter by severity if specified
        if (!string.IsNullOrEmpty(request.Severity))
        {
            alerts = alerts.Where(a => a.Severity.Equals(request.Severity, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        // Filter by actionable if specified
        if (request.IsActionable.HasValue)
        {
            alerts = alerts.Where(a => a.IsActionable == request.IsActionable.Value).ToList();
        }

        Console.WriteLine($"[REPORTS - ALERTS] Generated {alerts.Count} alerts");

        return alerts.OrderByDescending(a => a.CreatedAt);
    }

    private async Task<List<AlertDto>> GenerateInventoryAlerts(CancellationToken cancellationToken)
    {
        var alerts = new List<AlertDto>();
        var products = await _productRepository.GetAllAsync(cancellationToken);

        // Out of stock alerts
        var outOfStockProducts = products.Where(p => !p.IsInStock() && p.IsActive).ToList();
        if (outOfStockProducts.Any())
        {
            alerts.Add(new AlertDto
            {
                Type = "Inventory",
                Severity = "High",
                Title = "Products Out of Stock",
                Message = $"{outOfStockProducts.Count} active products are currently out of stock",
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object> { { "ProductCount", outOfStockProducts.Count } },
                IsActionable = true,
                RecommendedAction = "Reorder stock for out-of-stock products"
            });
        }

        // Low stock alerts
        var lowStockProducts = products.Where(p => p.IsLowStock() && p.IsInStock() && p.IsActive).ToList();
        if (lowStockProducts.Any())
        {
            alerts.Add(new AlertDto
            {
                Type = "Inventory",
                Severity = "Medium",
                Title = "Low Stock Warning",
                Message = $"{lowStockProducts.Count} products have low stock levels",
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object> { { "ProductCount", lowStockProducts.Count } },
                IsActionable = true,
                RecommendedAction = "Review and reorder low stock products"
            });
        }

        // High value inventory alert
        var highValueProducts = products.Where(p => p.GetTotalValue() > 10000).ToList();
        if (highValueProducts.Any())
        {
            alerts.Add(new AlertDto
            {
                Type = "Inventory",
                Severity = "Info",
                Title = "High Value Inventory",
                Message = $"{highValueProducts.Count} products have high inventory value",
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object> 
                { 
                    { "ProductCount", highValueProducts.Count },
                    { "TotalValue", highValueProducts.Sum(p => p.GetTotalValue()) }
                },
                IsActionable = false,
                RecommendedAction = "Monitor high-value inventory for optimization opportunities"
            });
        }

        return alerts;
    }

    private async Task<List<AlertDto>> GenerateSalesAlerts(DateTime since, CancellationToken cancellationToken)
    {
        var alerts = new List<AlertDto>();
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(since, DateTime.UtcNow, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        // No sales alert
        if (!activeInvoices.Any())
        {
            alerts.Add(new AlertDto
            {
                Type = "Sales",
                Severity = "High",
                Title = "No Sales Activity",
                Message = $"No sales recorded since {since:MMM dd, yyyy}",
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object> { { "DaysSinceLastSale", (DateTime.UtcNow - since).Days } },
                IsActionable = true,
                RecommendedAction = "Review sales processes and marketing strategies"
            });
        }
        else
        {
            // Low sales volume alert
            var averageDailySales = activeInvoices.Count / Math.Max(1, (DateTime.UtcNow - since).Days);
            if (averageDailySales < 1)
            {
                alerts.Add(new AlertDto
                {
                    Type = "Sales",
                    Severity = "Medium",
                    Title = "Low Sales Volume",
                    Message = $"Average daily sales ({averageDailySales:F1}) is below expected levels",
                    CreatedAt = DateTime.UtcNow,
                    Data = new Dictionary<string, object> { { "AverageDailySales", averageDailySales } },
                    IsActionable = true,
                    RecommendedAction = "Analyze sales trends and implement improvement strategies"
                });
            }

            // Large order alert
            var largeOrders = activeInvoices.Where(i => i.Total > 1000).ToList();
            if (largeOrders.Any())
            {
                alerts.Add(new AlertDto
                {
                    Type = "Sales",
                    Severity = "Info",
                    Title = "Large Orders Detected",
                    Message = $"{largeOrders.Count} orders exceed $1,000 in value",
                    CreatedAt = DateTime.UtcNow,
                    Data = new Dictionary<string, object> 
                    { 
                        { "LargeOrderCount", largeOrders.Count },
                        { "TotalValue", largeOrders.Sum(o => o.Total) }
                    },
                    IsActionable = false,
                    RecommendedAction = "Ensure adequate inventory for high-value customers"
                });
            }
        }

        return alerts;
    }

    private async Task<List<AlertDto>> GeneratePerformanceAlerts(DateTime since, CancellationToken cancellationToken)
    {
        var alerts = new List<AlertDto>();
        var products = await _productRepository.GetAllAsync(cancellationToken);
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(since, DateTime.UtcNow, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        // Inactive products alert
        var inactiveProducts = products.Where(p => !p.IsActive).ToList();
        if (inactiveProducts.Any())
        {
            alerts.Add(new AlertDto
            {
                Type = "Performance",
                Severity = "Low",
                Title = "Inactive Products",
                Message = $"{inactiveProducts.Count} products are marked as inactive",
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object> { { "InactiveProductCount", inactiveProducts.Count } },
                IsActionable = true,
                RecommendedAction = "Review inactive products for potential reactivation or removal"
            });
        }

        // Products with no sales
        var productSales = activeInvoices.SelectMany(i => i.Items).GroupBy(item => item.ProductId).ToList();
        var productsWithNoSales = products.Where(p => !productSales.Any(ps => ps.Key == p.Id)).ToList();
        
        if (productsWithNoSales.Any())
        {
            alerts.Add(new AlertDto
            {
                Type = "Performance",
                Severity = "Medium",
                Title = "Products with No Sales",
                Message = $"{productsWithNoSales.Count} products have no sales in the selected period",
                CreatedAt = DateTime.UtcNow,
                Data = new Dictionary<string, object> { { "ProductCount", productsWithNoSales.Count } },
                IsActionable = true,
                RecommendedAction = "Analyze slow-moving products and consider promotional strategies"
            });
        }

        return alerts;
    }
}