using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;

namespace StockFlowPro.Application.Features.Reports;

public class GetBasicReportHandler : IRequestHandler<GetBasicReportQuery, BasicReportDto>
{
    private readonly IMediator _mediator;

    public GetBasicReportHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<BasicReportDto> Handle(GetBasicReportQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - BASIC] Generating basic report: {request.ReportType}");

        var reportData = new Dictionary<string, object>();
        var reportName = request.ReportType.ToLower() switch
        {
            "inventory" => "Inventory Overview Report",
            "sales" => "Sales Overview Report",
            "products" => "Product Performance Report",
            "lowstock" => "Low Stock Report",
            "outofstock" => "Out of Stock Report",
            "topselling" => "Top Selling Products Report",
            "revenue" => "Revenue Analysis Report",
            _ => "Basic Report"
        };

        try
        {
            switch (request.ReportType.ToLower())
            {
                case "inventory":
                    var inventoryData = await _mediator.Send(new GetInventoryOverviewQuery(request.EndDate), cancellationToken);
                    reportData["inventory"] = inventoryData;
                    break;

                case "sales":
                    var salesData = await _mediator.Send(new GetSalesOverviewQuery(request.StartDate, request.EndDate), cancellationToken);
                    reportData["sales"] = salesData;
                    break;

                case "products":
                    var productData = await _mediator.Send(new GetProductPerformanceQuery(
                        request.StartDate, 
                        request.EndDate, 
                        request.Filters?.Limit,
                        request.Filters?.SortBy), cancellationToken);
                    reportData["products"] = productData;
                    break;

                case "lowstock":
                    var lowStockData = await _mediator.Send(new GetLowStockReportQuery(10), cancellationToken);
                    reportData["lowStock"] = lowStockData;
                    break;

                case "outofstock":
                    var outOfStockData = await _mediator.Send(new GetOutOfStockReportQuery(), cancellationToken);
                    reportData["outOfStock"] = outOfStockData;
                    break;

                case "topselling":
                    var topSellingData = await _mediator.Send(new GetTopSellingProductsQuery(
                        request.StartDate, 
                        request.EndDate, 
                        request.Filters?.Limit ?? 10), cancellationToken);
                    reportData["topSelling"] = topSellingData;
                    break;

                case "revenue":
                    var revenueData = await _mediator.Send(new GetRevenueByPeriodQuery(
                        request.StartDate ?? DateTime.UtcNow.AddMonths(-12),
                        request.EndDate ?? DateTime.UtcNow,
                        request.Filters?.GroupBy ?? "month"), cancellationToken);
                    reportData["revenue"] = revenueData;
                    break;

                default:
                    throw new ArgumentException($"Unknown report type: {request.ReportType}");
            }

            Console.WriteLine($"[REPORTS - BASIC] Report '{reportName}' generated successfully");

            return new BasicReportDto
            {
                ReportName = reportName,
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = "System", // TODO: Get from current user context
                Data = reportData
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[REPORTS - BASIC] Error generating report '{reportName}': {ex.Message}");
            throw;
        }
    }
}