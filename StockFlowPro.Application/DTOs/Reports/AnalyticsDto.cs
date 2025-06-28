namespace StockFlowPro.Application.DTOs.Reports;

public class AnalyticsDashboardDto
{
    public DateTime GeneratedAt { get; set; }
    public string Period { get; set; } = string.Empty;
    public KpiMetricsDto KpiMetrics { get; set; } = new();
    public List<ChartDataDto> Charts { get; set; } = new();
    public List<AlertDto> Alerts { get; set; } = new();
    public PerformanceMetricsDto Performance { get; set; } = new();
}

public class KpiMetricsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal RevenueGrowth { get; set; }
    public int TotalOrders { get; set; }
    public decimal OrderGrowth { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal AovGrowth { get; set; }
    public decimal InventoryValue { get; set; }
    public decimal InventoryTurnover { get; set; }
    public decimal GrossProfitMargin { get; set; }
    public int ActiveProducts { get; set; }
    public int LowStockAlerts { get; set; }
    public int OutOfStockProducts { get; set; }
}

public class ChartDataDto
{
    public string ChartType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public List<string> Labels { get; set; } = new();
    public List<ChartDatasetDto> Datasets { get; set; } = new();
    public Dictionary<string, object> Options { get; set; } = new();
}

public class ChartDatasetDto
{
    public string Label { get; set; } = string.Empty;
    public List<decimal> Data { get; set; } = new();
    public string BackgroundColor { get; set; } = string.Empty;
    public string BorderColor { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class AlertDto
{
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public bool IsActionable { get; set; }
    public string RecommendedAction { get; set; } = string.Empty;
}

public class PerformanceMetricsDto
{
    public TimeSpan QueryExecutionTime { get; set; }
    public int TotalRecordsProcessed { get; set; }
    public DateTime LastUpdated { get; set; }
    public string DataFreshness { get; set; } = string.Empty;
    public List<string> DataSources { get; set; } = new();
}

public class ReportFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<Guid>? ProductIds { get; set; }
    public List<Guid>? UserIds { get; set; }
    public bool? ActiveOnly { get; set; }
    public string? GroupBy { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
    public int? Limit { get; set; }
    public int? Offset { get; set; }
}

public class ExportOptionsDto
{
    public string Format { get; set; } = "PDF"; // PDF, Excel, CSV, JSON
    public bool IncludeCharts { get; set; } = true;
    public bool IncludeRawData { get; set; } = false;
    public string Template { get; set; } = "Standard";
    public Dictionary<string, object> CustomOptions { get; set; } = new();
}

public class ReportScheduleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty;
    public List<string> Recipients { get; set; } = new();
    public ReportFilterDto Filters { get; set; } = new();
    public ExportOptionsDto ExportOptions { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime? LastRun { get; set; }
    public DateTime? NextRun { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class BenchmarkDto
{
    public string MetricName { get; set; } = string.Empty;
    public decimal CurrentValue { get; set; }
    public decimal BenchmarkValue { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercentage { get; set; }
    public string PerformanceRating { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
}

public class AnomalyDetectionDto
{
    public DateTime DetectedAt { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public decimal ExpectedValue { get; set; }
    public decimal ActualValue { get; set; }
    public decimal DeviationScore { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> PossibleCauses { get; set; } = new();
    public List<string> RecommendedActions { get; set; } = new();
}