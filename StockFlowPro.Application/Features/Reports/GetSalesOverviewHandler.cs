using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetSalesOverviewHandler : IRequestHandler<GetSalesOverviewQuery, SalesOverviewDto>
{
    private readonly IInvoiceRepository _invoiceRepository;

    public GetSalesOverviewHandler(IInvoiceRepository invoiceRepository)
    {
        _invoiceRepository = invoiceRepository;
    }

    public async Task<SalesOverviewDto> Handle(GetSalesOverviewQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine("[REPORTS - SALES OVERVIEW] Generating sales overview report");

        var startDate = request.StartDate ?? DateTime.UtcNow.AddMonths(-12);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        var totalInvoices = activeInvoices.Count;
        var totalRevenue = activeInvoices.Sum(i => i.Total);
        var averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        var totalItemsSold = activeInvoices.Sum(i => i.GetTotalItemCount());
        var firstSaleDate = activeInvoices.Any() ? activeInvoices.Min(i => i.CreatedDate) : (DateTime?)null;
        var lastSaleDate = activeInvoices.Any() ? activeInvoices.Max(i => i.CreatedDate) : (DateTime?)null;

        Console.WriteLine($"[REPORTS - SALES OVERVIEW] Report generated - Total Invoices: {totalInvoices}, Total Revenue: {totalRevenue:C}");

        return new SalesOverviewDto
        {
            TotalInvoices = totalInvoices,
            TotalRevenue = totalRevenue,
            AverageInvoiceValue = averageInvoiceValue,
            TotalItemsSold = totalItemsSold,
            FirstSaleDate = firstSaleDate,
            LastSaleDate = lastSaleDate
        };
    }
}