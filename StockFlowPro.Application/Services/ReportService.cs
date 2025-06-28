using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Application.Queries.Reports;

namespace StockFlowPro.Application.Services;

public class ReportService : IReportService
{
    private readonly IMediator _mediator;

    public ReportService(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Basic Reports

    public async Task<BasicReportDto> GenerateBasicReportAsync(string reportType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null)
    {
        return await _mediator.Send(new GetBasicReportQuery(reportType, startDate, endDate, filters));
    }

    public async Task<InventoryOverviewDto> GetInventoryOverviewAsync(DateTime? asOfDate = null)
    {
        return await _mediator.Send(new GetInventoryOverviewQuery(asOfDate));
    }

    public async Task<SalesOverviewDto> GetSalesOverviewAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        return await _mediator.Send(new GetSalesOverviewQuery(startDate, endDate));
    }

    public async Task<IEnumerable<ProductPerformanceDto>> GetProductPerformanceAsync(DateTime? startDate = null, DateTime? endDate = null, int? topCount = null, string? sortBy = null)
    {
        return await _mediator.Send(new GetProductPerformanceQuery(startDate, endDate, topCount, sortBy));
    }

    #endregion

    #region Advanced Reports

    public async Task<AdvancedReportDto> GenerateAdvancedReportAsync(string reportType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null, Dictionary<string, object>? parameters = null)
    {
        return await _mediator.Send(new GetAdvancedReportQuery(reportType, startDate, endDate, filters, parameters));
    }

    public async Task<TrendAnalysisDto> GetTrendAnalysisAsync(DateTime startDate, DateTime endDate, string period = "month")
    {
        return await _mediator.Send(new GetTrendAnalysisQuery(startDate, endDate, period));
    }

    public async Task<ProfitabilityAnalysisDto> GetProfitabilityAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null, string groupBy = "product")
    {
        return await _mediator.Send(new GetProfitabilityAnalysisQuery(startDate, endDate, groupBy));
    }

    public async Task<InventoryAnalysisDto> GetInventoryAnalysisAsync(DateTime? asOfDate = null, int slowMovingDays = 90, decimal fastMovingThreshold = 0.8m)
    {
        return await _mediator.Send(new GetInventoryAnalysisQuery(asOfDate, slowMovingDays, fastMovingThreshold));
    }

    public async Task<CustomerAnalysisDto> GetCustomerAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null, int topCustomersCount = 10)
    {
        return await _mediator.Send(new GetCustomerAnalysisQuery(startDate, endDate, topCustomersCount));
    }

    public async Task<ForecastingDto> GetForecastingAsync(string forecastType = "sales", int forecastDays = 30, DateTime? startDate = null)
    {
        return await _mediator.Send(new GetForecastingQuery(forecastType, forecastDays, startDate));
    }

    #endregion

    #region Analytics

    public async Task<AnalyticsDashboardDto> GetAnalyticsDashboardAsync(DateTime? startDate = null, DateTime? endDate = null, string period = "month", List<string>? widgets = null)
    {
        return await _mediator.Send(new GetAnalyticsDashboardQuery(startDate, endDate, period, widgets));
    }

    public async Task<KpiMetricsDto> GetKpiMetricsAsync(DateTime? startDate = null, DateTime? endDate = null, DateTime? comparisonStartDate = null, DateTime? comparisonEndDate = null)
    {
        return await _mediator.Send(new GetKpiMetricsQuery(startDate, endDate, comparisonStartDate, comparisonEndDate));
    }

    public async Task<ChartDataDto> GetChartDataAsync(string chartType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null, Dictionary<string, object>? options = null)
    {
        return await _mediator.Send(new GetChartDataQuery(chartType, startDate, endDate, filters, options));
    }

    public async Task<IEnumerable<AlertDto>> GetAlertsAsync(string? severity = null, bool? isActionable = null, DateTime? since = null)
    {
        return await _mediator.Send(new GetAlertsQuery(severity, isActionable, since));
    }

    #endregion

    #region Export and Scheduling

    public async Task<byte[]> ExportReportAsync(string reportType, ExportOptionsDto exportOptions, ReportFilterDto? filters = null, Dictionary<string, object>? parameters = null)
    {
        return await _mediator.Send(new ExportReportQuery(reportType, exportOptions, filters, parameters));
    }

    public async Task<IEnumerable<ReportScheduleDto>> GetReportSchedulesAsync(bool? activeOnly = null, string? reportType = null)
    {
        return await _mediator.Send(new GetReportSchedulesQuery(activeOnly, reportType));
    }

    public Task<ReportScheduleDto> CreateReportScheduleAsync(ReportScheduleDto schedule)
    {
        // Implementation would involve creating a command for this
        throw new NotImplementedException("Report scheduling creation not yet implemented");
    }

    public Task<ReportScheduleDto> UpdateReportScheduleAsync(ReportScheduleDto schedule)
    {
        // Implementation would involve creating a command for this
        throw new NotImplementedException("Report scheduling update not yet implemented");
    }

    public Task DeleteReportScheduleAsync(Guid scheduleId)
    {
        // Implementation would involve creating a command for this
        throw new NotImplementedException("Report scheduling deletion not yet implemented");
    }

    #endregion

    #region Utilities

    public async Task<IEnumerable<BenchmarkDto>> GetBenchmarksAsync(List<string>? metrics = null, string industry = "retail", string period = "month")
    {
        return await _mediator.Send(new GetBenchmarksQuery(metrics, industry, period));
    }

    public async Task<IEnumerable<AnomalyDetectionDto>> GetAnomalyDetectionAsync(List<string>? metrics = null, DateTime? startDate = null, DateTime? endDate = null, decimal sensitivityThreshold = 2.0m)
    {
        return await _mediator.Send(new GetAnomalyDetectionQuery(metrics, startDate, endDate, sensitivityThreshold));
    }

    public async Task<Dictionary<string, object>> GetRealTimeMetricsAsync(List<string> metrics, TimeSpan? refreshInterval = null)
    {
        return await _mediator.Send(new GetRealTimeMetricsQuery(metrics, refreshInterval));
    }

    public async Task<PerformanceMetricsDto> GetPerformanceMetricsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        return await _mediator.Send(new GetPerformanceMetricsQuery(startDate, endDate));
    }

    #endregion
}