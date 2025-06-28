using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.DTOs.Reports;

namespace StockFlowPro.Application.Queries.Reports;

public record GetInventoryOverviewQuery(
    DateTime? AsOfDate = null
) : IRequest<InventoryOverviewDto>;

public record GetSalesOverviewQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null
) : IRequest<SalesOverviewDto>;

public record GetProductPerformanceQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int? TopCount = null,
    string? SortBy = null
) : IRequest<IEnumerable<ProductPerformanceDto>>;

public record GetBasicReportQuery(
    string ReportType,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    ReportFilterDto? Filters = null
) : IRequest<BasicReportDto>;

public record GetLowStockReportQuery(
    int Threshold = 10
) : IRequest<IEnumerable<ProductDto>>;

public record GetOutOfStockReportQuery() : IRequest<IEnumerable<ProductDto>>;

public record GetTopSellingProductsQuery(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int Count = 10
) : IRequest<IEnumerable<ProductPerformanceDto>>;

public record GetRevenueByPeriodQuery(
    DateTime StartDate,
    DateTime EndDate,
    string GroupBy = "day" // day, week, month, quarter, year
) : IRequest<IEnumerable<TrendDataPointDto>>;