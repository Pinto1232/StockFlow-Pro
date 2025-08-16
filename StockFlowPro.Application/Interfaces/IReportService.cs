using StockFlowPro.Application.DTOs.Reports;

namespace StockFlowPro.Application.Interfaces;

public interface IReportService
{
    // Basic Reports
        System.Threading.Tasks.Task<BasicReportDto> GenerateBasicReportAsync(string reportType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null);
        System.Threading.Tasks.Task<InventoryOverviewDto> GetInventoryOverviewAsync(DateTime? asOfDate = null);
        System.Threading.Tasks.Task<SalesOverviewDto> GetSalesOverviewAsync(DateTime? startDate = null, DateTime? endDate = null);
        System.Threading.Tasks.Task<IEnumerable<ProductPerformanceDto>> GetProductPerformanceAsync(DateTime? startDate = null, DateTime? endDate = null, int? topCount = null, string? sortBy = null);

    // Advanced Reports
        System.Threading.Tasks.Task<AdvancedReportDto> GenerateAdvancedReportAsync(string reportType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null, Dictionary<string, object>? parameters = null);
        System.Threading.Tasks.Task<TrendAnalysisDto> GetTrendAnalysisAsync(DateTime startDate, DateTime endDate, string period = "month");
        System.Threading.Tasks.Task<ProfitabilityAnalysisDto> GetProfitabilityAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null, string groupBy = "product");
        System.Threading.Tasks.Task<InventoryAnalysisDto> GetInventoryAnalysisAsync(DateTime? asOfDate = null, int slowMovingDays = 90, decimal fastMovingThreshold = 0.8m);
        System.Threading.Tasks.Task<CustomerAnalysisDto> GetCustomerAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null, int topCustomersCount = 10);
        System.Threading.Tasks.Task<ForecastingDto> GetForecastingAsync(string forecastType = "sales", int forecastDays = 30, DateTime? startDate = null);

    // Analytics
        System.Threading.Tasks.Task<AnalyticsDashboardDto> GetAnalyticsDashboardAsync(DateTime? startDate = null, DateTime? endDate = null, string period = "month", List<string>? widgets = null);
        System.Threading.Tasks.Task<KpiMetricsDto> GetKpiMetricsAsync(DateTime? startDate = null, DateTime? endDate = null, DateTime? comparisonStartDate = null, DateTime? comparisonEndDate = null);
        System.Threading.Tasks.Task<ChartDataDto> GetChartDataAsync(string chartType, DateTime? startDate = null, DateTime? endDate = null, ReportFilterDto? filters = null, Dictionary<string, object>? options = null);
        System.Threading.Tasks.Task<IEnumerable<AlertDto>> GetAlertsAsync(string? severity = null, bool? isActionable = null, DateTime? since = null);

    // Export and Scheduling
        System.Threading.Tasks.Task<byte[]> ExportReportAsync(string reportType, ExportOptionsDto exportOptions, ReportFilterDto? filters = null, Dictionary<string, object>? parameters = null);
        System.Threading.Tasks.Task<IEnumerable<ReportScheduleDto>> GetReportSchedulesAsync(bool? activeOnly = null, string? reportType = null);
        System.Threading.Tasks.Task<ReportScheduleDto> CreateReportScheduleAsync(ReportScheduleDto schedule);
        System.Threading.Tasks.Task<ReportScheduleDto> UpdateReportScheduleAsync(ReportScheduleDto schedule);
    Task DeleteReportScheduleAsync(Guid scheduleId);

    // Utilities
        System.Threading.Tasks.Task<IEnumerable<BenchmarkDto>> GetBenchmarksAsync(List<string>? metrics = null, string industry = "retail", string period = "month");
        System.Threading.Tasks.Task<IEnumerable<AnomalyDetectionDto>> GetAnomalyDetectionAsync(List<string>? metrics = null, DateTime? startDate = null, DateTime? endDate = null, decimal sensitivityThreshold = 2.0m);
        System.Threading.Tasks.Task<Dictionary<string, object>> GetRealTimeMetricsAsync(List<string> metrics, TimeSpan? refreshInterval = null);
        System.Threading.Tasks.Task<PerformanceMetricsDto> GetPerformanceMetricsAsync(DateTime? startDate = null, DateTime? endDate = null);
}