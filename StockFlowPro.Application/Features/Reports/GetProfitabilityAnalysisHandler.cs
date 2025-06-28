using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetProfitabilityAnalysisHandler : IRequestHandler<GetProfitabilityAnalysisQuery, ProfitabilityAnalysisDto>
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IProductRepository _productRepository;

    public GetProfitabilityAnalysisHandler(IInvoiceRepository invoiceRepository, IProductRepository productRepository)
    {
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
    }

    public async Task<ProfitabilityAnalysisDto> Handle(GetProfitabilityAnalysisQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - PROFITABILITY] Generating profitability analysis grouped by: {request.GroupBy}");

        var startDate = request.StartDate ?? DateTime.UtcNow.AddMonths(-12);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();
        var products = await _productRepository.GetAllAsync(cancellationToken);

        var totalRevenue = activeInvoices.Sum(i => i.Total);
        var totalCost = CalculateTotalCost(activeInvoices, products);
        var grossProfit = totalRevenue - totalCost;
        var grossProfitMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

        var productProfitability = CalculateProductProfitability(activeInvoices, products);
        var periodProfitability = CalculatePeriodProfitability(activeInvoices, products, request.GroupBy ?? "month");

        Console.WriteLine($"[REPORTS - PROFITABILITY] Analysis completed - Total Revenue: {totalRevenue:C}, Gross Profit: {grossProfit:C}, Margin: {grossProfitMargin:P2}");

        return new ProfitabilityAnalysisDto
        {
            TotalRevenue = totalRevenue,
            TotalCost = totalCost,
            GrossProfit = grossProfit,
            GrossProfitMargin = grossProfitMargin,
            ProductProfitability = productProfitability,
            PeriodProfitability = periodProfitability
        };
    }

    private decimal CalculateTotalCost(List<Domain.Entities.Invoice> invoices, IEnumerable<Domain.Entities.Product> products)
    {
        var productCostLookup = products.ToDictionary(p => p.Id, p => p.CostPerItem);
        
        return invoices
            .SelectMany(i => i.Items)
            .Sum(item => productCostLookup.GetValueOrDefault(item.ProductId, 0) * item.Quantity);
    }

    private List<ProductProfitabilityDto> CalculateProductProfitability(
        List<Domain.Entities.Invoice> invoices, 
        IEnumerable<Domain.Entities.Product> products)
    {
        var productCostLookup = products.ToDictionary(p => p.Id, p => p.CostPerItem);
        var productNameLookup = products.ToDictionary(p => p.Id, p => p.Name);

        var productSales = invoices
            .SelectMany(i => i.Items)
            .GroupBy(item => item.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                Revenue = g.Sum(item => item.GetLineTotal()),
                Cost = g.Sum(item => productCostLookup.GetValueOrDefault(item.ProductId, 0) * item.Quantity),
                UnitsSold = g.Sum(item => item.Quantity)
            })
            .ToList();

        return productSales.Select(ps => new ProductProfitabilityDto
        {
            ProductId = ps.ProductId,
            ProductName = productNameLookup.GetValueOrDefault(ps.ProductId, "Unknown Product"),
            Revenue = ps.Revenue,
            Cost = ps.Cost,
            Profit = ps.Revenue - ps.Cost,
            ProfitMargin = ps.Revenue > 0 ? (ps.Revenue - ps.Cost) / ps.Revenue : 0,
            UnitsSold = ps.UnitsSold,
            ProfitPerUnit = ps.UnitsSold > 0 ? (ps.Revenue - ps.Cost) / ps.UnitsSold : 0
        })
        .OrderByDescending(p => p.Profit)
        .ToList();
    }

    private List<PeriodProfitabilityDto> CalculatePeriodProfitability(
        List<Domain.Entities.Invoice> invoices, 
        IEnumerable<Domain.Entities.Product> products,
        string groupBy)
    {
        var productCostLookup = products.ToDictionary(p => p.Id, p => p.CostPerItem);

        var periodGroups = groupBy.ToLower() switch
        {
            "day" => invoices.GroupBy(i => i.CreatedDate.Date),
            "week" => invoices.GroupBy(i => GetWeekStart(i.CreatedDate)),
            "month" => invoices.GroupBy(i => new DateTime(i.CreatedDate.Year, i.CreatedDate.Month, 1)),
            "quarter" => invoices.GroupBy(i => GetQuarterStart(i.CreatedDate)),
            "year" => invoices.GroupBy(i => new DateTime(i.CreatedDate.Year, 1, 1)),
            _ => invoices.GroupBy(i => new DateTime(i.CreatedDate.Year, i.CreatedDate.Month, 1))
        };

        return periodGroups
            .Select(g =>
            {
                var revenue = g.Sum(i => i.Total);
                var cost = g.SelectMany(i => i.Items)
                           .Sum(item => productCostLookup.GetValueOrDefault(item.ProductId, 0) * item.Quantity);
                var profit = revenue - cost;

                return new PeriodProfitabilityDto
                {
                    Period = g.Key,
                    Revenue = revenue,
                    Cost = cost,
                    Profit = profit,
                    ProfitMargin = revenue > 0 ? profit / revenue : 0
                };
            })
            .OrderBy(p => p.Period)
            .ToList();
    }

    private DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-1 * diff).Date;
    }

    private DateTime GetQuarterStart(DateTime date)
    {
        var quarter = (date.Month - 1) / 3 + 1;
        return new DateTime(date.Year, (quarter - 1) * 3 + 1, 1);
    }
}