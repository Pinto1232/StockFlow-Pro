using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetTrendAnalysisHandler : IRequestHandler<GetTrendAnalysisQuery, TrendAnalysisDto>
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IProductRepository _productRepository;

    public GetTrendAnalysisHandler(IInvoiceRepository invoiceRepository, IProductRepository productRepository)
    {
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
    }

    public async Task<TrendAnalysisDto> Handle(GetTrendAnalysisQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - TREND ANALYSIS] Generating trend analysis for period: {request.Period}");

        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();
        var products = await _productRepository.GetAllAsync(cancellationToken);

        var salesTrend = new List<TrendDataPointDto>();
        var revenueTrend = new List<TrendDataPointDto>();
        var inventoryTrend = new List<TrendDataPointDto>();

        // Group data by period
        var groupedData = GroupDataByPeriod(activeInvoices, request.Period, request.StartDate, request.EndDate);

        foreach (var group in groupedData.OrderBy(g => g.Key))
        {
            var periodInvoices = group.Value;
            var salesCount = periodInvoices.Count;
            var revenue = periodInvoices.Sum(i => i.Total);
            var inventoryValue = products.Sum(p => p.GetTotalValue()); // Simplified - would need historical data

            salesTrend.Add(new TrendDataPointDto
            {
                Date = group.Key,
                Value = salesCount,
                Label = FormatPeriodLabel(group.Key, request.Period)
            });

            revenueTrend.Add(new TrendDataPointDto
            {
                Date = group.Key,
                Value = revenue,
                Label = FormatPeriodLabel(group.Key, request.Period)
            });

            inventoryTrend.Add(new TrendDataPointDto
            {
                Date = group.Key,
                Value = inventoryValue,
                Label = FormatPeriodLabel(group.Key, request.Period)
            });
        }

        // Calculate growth rates
        var salesGrowthRate = CalculateGrowthRate(salesTrend);
        var revenueGrowthRate = CalculateGrowthRate(revenueTrend);
        var trendDirection = DetermineTrendDirection(revenueGrowthRate);

        Console.WriteLine($"[REPORTS - TREND ANALYSIS] Analysis completed - Sales Growth: {salesGrowthRate:P2}, Revenue Growth: {revenueGrowthRate:P2}");

        return new TrendAnalysisDto
        {
            Period = request.Period,
            SalesTrend = salesTrend,
            RevenueTrend = revenueTrend,
            InventoryTrend = inventoryTrend,
            SalesGrowthRate = salesGrowthRate,
            RevenueGrowthRate = revenueGrowthRate,
            TrendDirection = trendDirection
        };
    }

    private Dictionary<DateTime, List<Domain.Entities.Invoice>> GroupDataByPeriod(
        List<Domain.Entities.Invoice> invoices, 
        string period, 
        DateTime startDate, 
        DateTime endDate)
    {
        return period.ToLower() switch
        {
            "day" => invoices.GroupBy(i => i.CreatedDate.Date)
                           .ToDictionary(g => g.Key, g => g.ToList()),
            "week" => invoices.GroupBy(i => GetWeekStart(i.CreatedDate))
                            .ToDictionary(g => g.Key, g => g.ToList()),
            "month" => invoices.GroupBy(i => new DateTime(i.CreatedDate.Year, i.CreatedDate.Month, 1))
                             .ToDictionary(g => g.Key, g => g.ToList()),
            "quarter" => invoices.GroupBy(i => GetQuarterStart(i.CreatedDate))
                               .ToDictionary(g => g.Key, g => g.ToList()),
            "year" => invoices.GroupBy(i => new DateTime(i.CreatedDate.Year, 1, 1))
                            .ToDictionary(g => g.Key, g => g.ToList()),
            _ => invoices.GroupBy(i => new DateTime(i.CreatedDate.Year, i.CreatedDate.Month, 1))
                       .ToDictionary(g => g.Key, g => g.ToList())
        };
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

    private string FormatPeriodLabel(DateTime date, string period)
    {
        return period.ToLower() switch
        {
            "day" => date.ToString("MMM dd, yyyy"),
            "week" => $"Week of {date:MMM dd, yyyy}",
            "month" => date.ToString("MMM yyyy"),
            "quarter" => $"Q{(date.Month - 1) / 3 + 1} {date.Year}",
            "year" => date.ToString("yyyy"),
            _ => date.ToString("MMM yyyy")
        };
    }

    private decimal CalculateGrowthRate(List<TrendDataPointDto> trendData)
    {
        if (trendData.Count < 2) return 0;

        var firstValue = trendData.First().Value;
        var lastValue = trendData.Last().Value;

        if (firstValue == 0) return lastValue > 0 ? 1 : 0;

        return (lastValue - firstValue) / firstValue;
    }

    private string DetermineTrendDirection(decimal growthRate)
    {
        return growthRate switch
        {
            > 0.1m => "Strong Upward",
            > 0.05m => "Upward",
            > -0.05m => "Stable",
            > -0.1m => "Downward",
            _ => "Strong Downward"
        };
    }
}