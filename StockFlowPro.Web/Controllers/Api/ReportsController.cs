using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    #region Basic Reports

    /// <summary>
    /// Get inventory overview report
    /// </summary>
    [HttpGet("inventory/overview")]
    public async Task<ActionResult<InventoryOverviewDto>> GetInventoryOverview([FromQuery] DateTime? asOfDate = null)
    {
        try
        {
            var report = await _reportService.GetInventoryOverviewAsync(asOfDate);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating inventory overview report");
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    /// <summary>
    /// Get sales overview report
    /// </summary>
    [HttpGet("sales/overview")]
    public async Task<ActionResult<SalesOverviewDto>> GetSalesOverview(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var report = await _reportService.GetSalesOverviewAsync(startDate, endDate);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating sales overview report");
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    /// <summary>
    /// Get product performance report
    /// </summary>
    [HttpGet("products/performance")]
    public async Task<ActionResult<IEnumerable<ProductPerformanceDto>>> GetProductPerformance(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? topCount = null,
        [FromQuery] string? sortBy = null)
    {
        try
        {
            var report = await _reportService.GetProductPerformanceAsync(startDate, endDate, topCount, sortBy);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating product performance report");
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    /// <summary>
    /// Generate basic report by type
    /// </summary>
    [HttpPost("basic/{reportType}")]
    public async Task<ActionResult<BasicReportDto>> GenerateBasicReport(
        string reportType,
        [FromBody] ReportRequestDto request)
    {
        try
        {
            var report = await _reportService.GenerateBasicReportAsync(
                reportType, 
                request.StartDate, 
                request.EndDate, 
                request.Filters);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid report type: {ReportType}", reportType);
            return BadRequest($"Invalid report type: {reportType}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating basic report: {ReportType}", reportType);
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    #endregion

    #region Advanced Reports

    /// <summary>
    /// Get trend analysis report
    /// </summary>
    [HttpGet("trends")]
    public async Task<ActionResult<TrendAnalysisDto>> GetTrendAnalysis(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string period = "month")
    {
        try
        {
            var report = await _reportService.GetTrendAnalysisAsync(startDate, endDate, period);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating trend analysis report");
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    /// <summary>
    /// Get profitability analysis report
    /// </summary>
    [HttpGet("profitability")]
    public async Task<ActionResult<ProfitabilityAnalysisDto>> GetProfitabilityAnalysis(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string groupBy = "product")
    {
        try
        {
            var report = await _reportService.GetProfitabilityAnalysisAsync(startDate, endDate, groupBy);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating profitability analysis report");
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    /// <summary>
    /// Generate advanced report by type
    /// </summary>
    [HttpPost("advanced/{reportType}")]
    public async Task<ActionResult<AdvancedReportDto>> GenerateAdvancedReport(
        string reportType,
        [FromBody] AdvancedReportRequestDto request)
    {
        try
        {
            var report = await _reportService.GenerateAdvancedReportAsync(
                reportType,
                request.StartDate,
                request.EndDate,
                request.Filters,
                request.Parameters);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid advanced report type: {ReportType}", reportType);
            return BadRequest($"Invalid report type: {reportType}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating advanced report: {ReportType}", reportType);
            return StatusCode(500, "An error occurred while generating the report");
        }
    }

    #endregion

    #region Analytics Dashboard

    /// <summary>
    /// Get analytics dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<AnalyticsDashboardDto>> GetAnalyticsDashboard(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string period = "month",
        [FromQuery] string[]? widgets = null)
    {
        try
        {
            var report = await _reportService.GetAnalyticsDashboardAsync(
                startDate, 
                endDate, 
                period, 
                widgets?.ToList());
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating analytics dashboard");
            return StatusCode(500, "An error occurred while generating the dashboard");
        }
    }

    /// <summary>
    /// Get KPI metrics
    /// </summary>
    [HttpGet("kpi")]
    public async Task<ActionResult<KpiMetricsDto>> GetKpiMetrics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] DateTime? comparisonStartDate = null,
        [FromQuery] DateTime? comparisonEndDate = null)
    {
        try
        {
            var metrics = await _reportService.GetKpiMetricsAsync(
                startDate, 
                endDate, 
                comparisonStartDate, 
                comparisonEndDate);
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating KPI metrics");
            return StatusCode(500, "An error occurred while generating KPI metrics");
        }
    }

    /// <summary>
    /// Get chart data
    /// </summary>
    [HttpGet("charts/{chartType}")]
    public async Task<ActionResult<ChartDataDto>> GetChartData(
        string chartType,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? groupBy = null,
        [FromQuery] int? limit = null)
    {
        try
        {
            var filters = new ReportFilterDto
            {
                GroupBy = groupBy,
                Limit = limit
            };

            var chartData = await _reportService.GetChartDataAsync(chartType, startDate, endDate, filters);
            return Ok(chartData);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid chart type: {ChartType}", chartType);
            return BadRequest($"Invalid chart type: {chartType}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating chart data: {ChartType}", chartType);
            return StatusCode(500, "An error occurred while generating chart data");
        }
    }

    /// <summary>
    /// Get system alerts
    /// </summary>
    [HttpGet("alerts")]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetAlerts(
        [FromQuery] string? severity = null,
        [FromQuery] bool? isActionable = null,
        [FromQuery] DateTime? since = null)
    {
        try
        {
            var alerts = await _reportService.GetAlertsAsync(severity, isActionable, since);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts");
            return StatusCode(500, "An error occurred while retrieving alerts");
        }
    }

    #endregion

    #region Export

    /// <summary>
    /// Export report
    /// </summary>
    [HttpPost("export/{reportType}")]
    public async Task<ActionResult> ExportReport(
        string reportType,
        [FromBody] ExportRequestDto request)
    {
        try
        {
            var reportData = await _reportService.ExportReportAsync(
                reportType,
                request.ExportOptions,
                request.Filters,
                request.Parameters);

            var contentType = request.ExportOptions.Format.ToLower() switch
            {
                "pdf" => "application/pdf",
                "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "csv" => "text/csv",
                "json" => "application/json",
                _ => "application/octet-stream"
            };

            var fileName = $"{reportType}_report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{request.ExportOptions.Format.ToLower()}";

            return File(reportData, contentType, fileName);
        }
        catch (NotImplementedException)
        {
            return StatusCode(501, "Export functionality is not yet implemented");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting report: {ReportType}", reportType);
            return StatusCode(500, "An error occurred while exporting the report");
        }
    }

    #endregion

    #region Report Types

    /// <summary>
    /// Get available report types
    /// </summary>
    [HttpGet("types")]
    public ActionResult<object> GetReportTypes()
    {
        var reportTypes = new
        {
            Basic = new[]
            {
                new { Type = "inventory", Name = "Inventory Overview", Description = "Current inventory status and metrics" },
                new { Type = "sales", Name = "Sales Overview", Description = "Sales performance and statistics" },
                new { Type = "products", Name = "Product Performance", Description = "Individual product sales and performance" },
                new { Type = "lowstock", Name = "Low Stock Report", Description = "Products with low inventory levels" },
                new { Type = "outofstock", Name = "Out of Stock Report", Description = "Products currently out of stock" },
                new { Type = "topselling", Name = "Top Selling Products", Description = "Best performing products by sales" },
                new { Type = "revenue", Name = "Revenue Analysis", Description = "Revenue trends over time" }
            },
            Advanced = new[]
            {
                new { Type = "trends", Name = "Trend Analysis", Description = "Sales and revenue trends with growth analysis" },
                new { Type = "profitability", Name = "Profitability Analysis", Description = "Profit margins and cost analysis" },
                new { Type = "inventory-analysis", Name = "Inventory Analysis", Description = "Detailed inventory turnover and optimization" },
                new { Type = "customer-analysis", Name = "Customer Analysis", Description = "Customer behavior and segmentation" },
                new { Type = "forecasting", Name = "Forecasting", Description = "Predictive analytics for sales and demand" },
                new { Type = "abc-analysis", Name = "ABC Analysis", Description = "Product categorization by importance" },
                new { Type = "seasonality", Name = "Seasonality Analysis", Description = "Seasonal patterns in sales data" }
            },
            Charts = new[]
            {
                new { Type = "line", Name = "Line Chart", Description = "Time series data visualization" },
                new { Type = "bar", Name = "Bar Chart", Description = "Categorical data comparison" },
                new { Type = "doughnut", Name = "Doughnut Chart", Description = "Proportional data visualization" },
                new { Type = "area", Name = "Area Chart", Description = "Cumulative data visualization" }
            }
        };

        return Ok(reportTypes);
    }

    #endregion
}

// Request DTOs
public class ReportRequestDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ReportFilterDto? Filters { get; set; }
}

public class AdvancedReportRequestDto : ReportRequestDto
{
    public Dictionary<string, object>? Parameters { get; set; }
}

public class ExportRequestDto
{
    public ExportOptionsDto ExportOptions { get; set; } = new();
    public ReportFilterDto? Filters { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
}