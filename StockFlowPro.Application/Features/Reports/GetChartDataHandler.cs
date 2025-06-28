using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetChartDataHandler : IRequestHandler<GetChartDataQuery, ChartDataDto>
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IProductRepository _productRepository;

    public GetChartDataHandler(IInvoiceRepository invoiceRepository, IProductRepository productRepository)
    {
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
    }

    public async Task<ChartDataDto> Handle(GetChartDataQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - CHART DATA] Generating chart data for type: {request.ChartType}");

        var startDate = request.StartDate ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        return request.ChartType.ToLower() switch
        {
            "line" => await GenerateLineChart(startDate, endDate, request.Filters, cancellationToken),
            "bar" => await GenerateBarChart(startDate, endDate, request.Filters, cancellationToken),
            "doughnut" or "pie" => await GenerateDoughnutChart(startDate, endDate, request.Filters, cancellationToken),
            "area" => await GenerateAreaChart(startDate, endDate, request.Filters, cancellationToken),
            _ => throw new ArgumentException($"Unsupported chart type: {request.ChartType}")
        };
    }

    private async Task<ChartDataDto> GenerateLineChart(DateTime startDate, DateTime endDate, ReportFilterDto? filters, CancellationToken cancellationToken)
    {
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        var groupBy = filters?.GroupBy ?? "day";
        var groupedData = GroupInvoicesByPeriod(activeInvoices, groupBy);

        var labels = new List<string>();
        var revenueData = new List<decimal>();
        var ordersData = new List<decimal>();

        foreach (var group in groupedData.OrderBy(g => g.Key))
        {
            labels.Add(FormatPeriodLabel(group.Key, groupBy));
            revenueData.Add(group.Value.Sum(i => i.Total));
            ordersData.Add(group.Value.Count);
        }

        return new ChartDataDto
        {
            ChartType = "line",
            Title = "Revenue and Orders Trend",
            Labels = labels,
            Datasets = new List<ChartDatasetDto>
            {
                new()
                {
                    Label = "Revenue",
                    Data = revenueData,
                    BorderColor = "#3B82F6",
                    BackgroundColor = "rgba(59, 130, 246, 0.1)",
                    Type = "line"
                },
                new()
                {
                    Label = "Orders",
                    Data = ordersData,
                    BorderColor = "#10B981",
                    BackgroundColor = "rgba(16, 185, 129, 0.1)",
                    Type = "line"
                }
            }
        };
    }

    private async Task<ChartDataDto> GenerateBarChart(DateTime startDate, DateTime endDate, ReportFilterDto? filters, CancellationToken cancellationToken)
    {
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var products = await _productRepository.GetAllAsync(cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        var productSales = activeInvoices
            .SelectMany(i => i.Items)
            .GroupBy(item => item.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                ProductName = products.FirstOrDefault(p => p.Id == g.Key)?.Name ?? "Unknown",
                Revenue = g.Sum(item => item.GetLineTotal()),
                Quantity = g.Sum(item => item.Quantity)
            })
            .OrderByDescending(p => p.Revenue)
            .Take(filters?.Limit ?? 10)
            .ToList();

        var labels = productSales.Select(p => p.ProductName).ToList();
        var revenueData = productSales.Select(p => p.Revenue).ToList();
        var quantityData = productSales.Select(p => (decimal)p.Quantity).ToList();

        return new ChartDataDto
        {
            ChartType = "bar",
            Title = "Top Products by Revenue",
            Labels = labels,
            Datasets = new List<ChartDatasetDto>
            {
                new()
                {
                    Label = "Revenue",
                    Data = revenueData,
                    BackgroundColor = "#3B82F6",
                    BorderColor = "#1D4ED8",
                    Type = "bar"
                }
            }
        };
    }

    private async Task<ChartDataDto> GenerateDoughnutChart(DateTime startDate, DateTime endDate, ReportFilterDto? filters, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetAllAsync(cancellationToken);

        var stockLevels = new[]
        {
            new { Label = "In Stock", Count = products.Count(p => p.IsInStock() && !p.IsLowStock()), Color = "#10B981" },
            new { Label = "Low Stock", Count = products.Count(p => p.IsLowStock()), Color = "#F59E0B" },
            new { Label = "Out of Stock", Count = products.Count(p => !p.IsInStock()), Color = "#EF4444" }
        };

        return new ChartDataDto
        {
            ChartType = "doughnut",
            Title = "Inventory Status Distribution",
            Labels = stockLevels.Select(s => s.Label).ToList(),
            Datasets = new List<ChartDatasetDto>
            {
                new()
                {
                    Label = "Products",
                    Data = stockLevels.Select(s => (decimal)s.Count).ToList(),
                    BackgroundColor = string.Join(",", stockLevels.Select(s => s.Color)),
                    Type = "doughnut"
                }
            }
        };
    }

    private async Task<ChartDataDto> GenerateAreaChart(DateTime startDate, DateTime endDate, ReportFilterDto? filters, CancellationToken cancellationToken)
    {
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        var groupBy = filters?.GroupBy ?? "day";
        var groupedData = GroupInvoicesByPeriod(activeInvoices, groupBy);

        var labels = new List<string>();
        var cumulativeRevenue = new List<decimal>();
        var runningTotal = 0m;

        foreach (var group in groupedData.OrderBy(g => g.Key))
        {
            labels.Add(FormatPeriodLabel(group.Key, groupBy));
            runningTotal += group.Value.Sum(i => i.Total);
            cumulativeRevenue.Add(runningTotal);
        }

        return new ChartDataDto
        {
            ChartType = "area",
            Title = "Cumulative Revenue",
            Labels = labels,
            Datasets = new List<ChartDatasetDto>
            {
                new()
                {
                    Label = "Cumulative Revenue",
                    Data = cumulativeRevenue,
                    BorderColor = "#8B5CF6",
                    BackgroundColor = "rgba(139, 92, 246, 0.2)",
                    Type = "area"
                }
            }
        };
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
            _ => invoices.GroupBy(i => i.CreatedDate.Date)
                       .ToDictionary(g => g.Key, g => g.ToList())
        };
    }

    private DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-1 * diff).Date;
    }

    private string FormatPeriodLabel(DateTime date, string period)
    {
        return period.ToLower() switch
        {
            "day" => date.ToString("MMM dd"),
            "week" => $"Week {date:MMM dd}",
            "month" => date.ToString("MMM yyyy"),
            _ => date.ToString("MMM dd")
        };
    }
}