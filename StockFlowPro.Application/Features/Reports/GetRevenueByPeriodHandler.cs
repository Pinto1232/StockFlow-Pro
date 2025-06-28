using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetRevenueByPeriodHandler : IRequestHandler<GetRevenueByPeriodQuery, IEnumerable<TrendDataPointDto>>
{
    private readonly IInvoiceRepository _invoiceRepository;

    public GetRevenueByPeriodHandler(IInvoiceRepository invoiceRepository)
    {
        _invoiceRepository = invoiceRepository;
    }

    public async Task<IEnumerable<TrendDataPointDto>> Handle(GetRevenueByPeriodQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - REVENUE BY PERIOD] Generating revenue report grouped by: {request.GroupBy}");

        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        var groupedData = GroupInvoicesByPeriod(activeInvoices, request.GroupBy);

        var revenueData = groupedData
            .Select(g => new TrendDataPointDto
            {
                Date = g.Key,
                Value = g.Value.Sum(i => i.Total),
                Label = FormatPeriodLabel(g.Key, request.GroupBy)
            })
            .OrderBy(d => d.Date)
            .ToList();

        Console.WriteLine($"[REPORTS - REVENUE BY PERIOD] Generated {revenueData.Count} data points");

        return revenueData;
    }

    private Dictionary<DateTime, List<Domain.Entities.Invoice>> GroupInvoicesByPeriod(
        List<Domain.Entities.Invoice> invoices, 
        string groupBy)
    {
        return groupBy.ToLower() switch
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
}