using MediatR;
using StockFlowPro.Application.DTOs.Reports;

namespace StockFlowPro.Application.Queries.Reports;

public record GetTrendAnalysisQuery(
    DateTime StartDate,
    DateTime EndDate,
    string Period = "month" // day, week, month, quarter, year
) : IRequest<TrendAnalysisDto>;

public record GetProfitabilityAnalysisQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string GroupBy = "product" // product, period, category
) : IRequest<ProfitabilityAnalysisDto>;

public record GetInventoryAnalysisQuery(
    DateTime? AsOfDate = null,
    int SlowMovingDays = 90,
    decimal FastMovingThreshold = 0.8m
) : IRequest<InventoryAnalysisDto>;

public record GetCustomerAnalysisQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int TopCustomersCount = 10
) : IRequest<CustomerAnalysisDto>;

public record GetForecastingQuery(
    string ForecastType = "sales", // sales, revenue, demand
    int ForecastDays = 30,
    DateTime? StartDate = null
) : IRequest<ForecastingDto>;

public record GetAdvancedReportQuery(
    string ReportType,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    ReportFilterDto? Filters = null,
    Dictionary<string, object>? Parameters = null
) : IRequest<AdvancedReportDto>;

public record GetABCAnalysisQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string AnalysisType = "revenue" // revenue, quantity, profit
) : IRequest<IEnumerable<ProductPerformanceDto>>;

public record GetSeasonalityAnalysisQuery(
    DateTime StartDate,
    DateTime EndDate,
    string Period = "month"
) : IRequest<TrendAnalysisDto>;

public record GetCohortAnalysisQuery(
    DateTime StartDate,
    DateTime EndDate,
    string CohortType = "monthly"
) : IRequest<CustomerAnalysisDto>;

public record GetRFMAnalysisQuery(
    DateTime? AsOfDate = null,
    int RecencyDays = 365,
    int FrequencyThreshold = 5,
    decimal MonetaryThreshold = 1000m
) : IRequest<CustomerAnalysisDto>;