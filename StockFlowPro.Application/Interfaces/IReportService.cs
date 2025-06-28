using StockFlowPro.Application.DTOs.Reports;

namespace StockFlowPro.Application.Interfaces;

public interface IReportService
{
    // Basic Reports
    Task<BasicReportDto> GenerateBasicReportAsync(string reportType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null);
    Task<InventoryOverviewDto> GetInventoryOverviewAsync(DateTime? asOfDate = null);
    Task<SalesOverviewDto> GetSalesOverviewAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<IEnumerable<ProductPerformanceDto>> GetProductPerformanceAsync(DateTime? startDate = null, DateTime? endDate = null, int? topCount = null, string? sortBy = null);

    // Advanced Reports
    Task<AdvancedReportDto> GenerateAdvancedReportAsync(string reportType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null, Dictionary<string, object>? parameters = null);
    Task<TrendAnalysisDto> GetTrendAnalysisAsync(DateTime startDate, DateTime endDate, string period = "month");
    Task<ProfitabilityAnalysisDto> GetProfitabilityAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null, string groupBy = "product");
    Task<InventoryAnalysisDto> GetInventoryAnalysisAsync(DateTime? asOfDate = null, int slowMovingDays = 90, decimal fastMovingThreshold = 0.8m);
    Task<CustomerAnalysisDto> GetCustomerAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null, int topCustomersCount = 10);
    Task<ForecastingDto> GetForecastingAsync(string forecastType = "sales", int forecastDays = 30, DateTime? startDate = null);

    // Analytics
    Task<AnalyticsDashboardDto> GetAnalyticsDashboardAsync(DateTime? startDate = null, DateTime? endDate = null, string period = "month", List<string>? widgets = null);
    Task<KpiMetricsDto> GetKpiMetricsAsync(DateTime? startDate = null, DateTime? endDate = null, DateTime? comparisonStartDate = null, DateTime? comparisonEndDate = null);
    Task<ChartDataDto> GetChartDataAsync(string chartType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null, Dictionary<string, object>? options = null);
    Task<IEnumerable<AlertDto>> GetAlertsAsync(string? severity = null, bool? isActionable = null, DateTime? since = null);

    // Export and Scheduling
    Task<byte[]> ExportReportAsync(string reportType, ExportOptionsDto exportOptions, ReportFilterDto? filters = null, Dictionary<string, object>? parameters = null);
    Task<IEnumerable<ReportScheduleDto>> GetReportSchedulesAsync(bool? activeOnly = null, string? reportType = null);
    Task<ReportScheduleDto> CreateReportScheduleAsync(ReportScheduleDto schedule);
    Task<ReportScheduleDto> UpdateReportScheduleAsync(ReportScheduleDto schedule);
    Task DeleteReportScheduleAsync(Guid scheduleId);

    // Utilities
    Task<IEnumerable<BenchmarkDto>> GetBenchmarksAsync(List<string>? metrics = null, string industry = "retail", string period = "month");
    Task<IEnumerable<AnomalyDetectionDto>> GetAnomalyDetectionAsync(List<string>? metrics = null, DateTime? startDate = null, DateTime? endDate = null, decimal sensitivityThreshold = 2.0m);
    Task<Dictionary<string, object>> GetRealTimeMetricsAsync(List<string> metrics, TimeSpan? refreshInterval = null);
    Task<PerformanceMetricsDto> GetPerformanceMetricsAsync(DateTime? startDate = null, DateTime? endDate = null);
}