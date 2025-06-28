using MediatR;
using StockFlowPro.Application.DTOs.Reports;

namespace StockFlowPro.Application.Queries.Reports;

public record GetAnalyticsDashboardQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string Period = "month",
    List<string>? Widgets = null
) : IRequest<AnalyticsDashboardDto>;

public record GetKpiMetricsQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    DateTime? ComparisonStartDate = null,
    DateTime? ComparisonEndDate = null
) : IRequest<KpiMetricsDto>;

public record GetChartDataQuery(
    string ChartType,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    ReportFilterDto? Filters = null,
    Dictionary<string, object>? Options = null
) : IRequest<ChartDataDto>;

public record GetAlertsQuery(
    string? Severity = null,
    bool? IsActionable = null,
    DateTime? Since = null
) : IRequest<IEnumerable<AlertDto>>;

public record GetBenchmarksQuery(
    List<string>? Metrics = null,
    string Industry = "retail",
    string Period = "month"
) : IRequest<IEnumerable<BenchmarkDto>>;

public record GetAnomalyDetectionQuery(
    List<string>? Metrics = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    decimal SensitivityThreshold = 2.0m
) : IRequest<IEnumerable<AnomalyDetectionDto>>;

public record GetReportSchedulesQuery(
    bool? ActiveOnly = null,
    string? ReportType = null
) : IRequest<IEnumerable<ReportScheduleDto>>;

public record ExportReportQuery(
    string ReportType,
    ExportOptionsDto ExportOptions,
    ReportFilterDto? Filters = null,
    Dictionary<string, object>? Parameters = null
) : IRequest<byte[]>;

public record GetRealTimeMetricsQuery(
    List<string> Metrics,
    TimeSpan? RefreshInterval = null
) : IRequest<Dictionary<string, object>>;

public record GetPerformanceMetricsQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null
) : IRequest<PerformanceMetricsDto>;