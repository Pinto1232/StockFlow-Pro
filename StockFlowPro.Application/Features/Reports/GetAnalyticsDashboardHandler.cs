using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;

namespace StockFlowPro.Application.Features.Reports;

public class GetAnalyticsDashboardHandler : IRequestHandler<GetAnalyticsDashboardQuery, AnalyticsDashboardDto>
{
    private readonly IMediator _mediator;

    public GetAnalyticsDashboardHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<AnalyticsDashboardDto> Handle(GetAnalyticsDashboardQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - ANALYTICS DASHBOARD] Generating dashboard for period: {request.Period}");

        var startDate = request.StartDate ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = request.EndDate ?? DateTime.UtcNow;
        var comparisonStartDate = startDate.AddMonths(-1);
        var comparisonEndDate = startDate.AddDays(-1);

        // Get KPI metrics with comparison
        var kpiMetrics = await _mediator.Send(new GetKpiMetricsQuery(
            startDate, endDate, comparisonStartDate, comparisonEndDate), cancellationToken);

        // Generate charts
        var charts = new List<ChartDataDto>();
        
        if (request.Widgets == null || request.Widgets.Contains("revenue"))
        {
            var revenueChart = await _mediator.Send(new GetChartDataQuery(
                "line", startDate, endDate, 
                new ReportFilterDto { GroupBy = request.Period }), cancellationToken);
            charts.Add(revenueChart);
        }

        if (request.Widgets == null || request.Widgets.Contains("products"))
        {
            var productChart = await _mediator.Send(new GetChartDataQuery(
                "bar", startDate, endDate,
                new ReportFilterDto { Limit = 10, SortBy = "revenue" }), cancellationToken);
            charts.Add(productChart);
        }

        if (request.Widgets == null || request.Widgets.Contains("inventory"))
        {
            var inventoryChart = await _mediator.Send(new GetChartDataQuery(
                "doughnut", startDate, endDate), cancellationToken);
            charts.Add(inventoryChart);
        }

        // Get alerts
        var alerts = await _mediator.Send(new GetAlertsQuery(
            null, true, DateTime.UtcNow.AddDays(-7)), cancellationToken);

        // Performance metrics
        var performance = new PerformanceMetricsDto
        {
            QueryExecutionTime = TimeSpan.FromMilliseconds(500), // Simulated
            TotalRecordsProcessed = 1000, // Simulated
            LastUpdated = DateTime.UtcNow,
            DataFreshness = "Real-time",
            DataSources = new List<string> { "Products", "Invoices", "Users" }
        };

        Console.WriteLine("[REPORTS - ANALYTICS DASHBOARD] Dashboard generated successfully");

        return new AnalyticsDashboardDto
        {
            GeneratedAt = DateTime.UtcNow,
            Period = request.Period,
            KpiMetrics = kpiMetrics,
            Charts = charts,
            Alerts = alerts.ToList(),
            Performance = performance
        };
    }
}