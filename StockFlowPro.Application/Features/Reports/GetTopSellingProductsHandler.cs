using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;

namespace StockFlowPro.Application.Features.Reports;

public class GetTopSellingProductsHandler : IRequestHandler<GetTopSellingProductsQuery, IEnumerable<ProductPerformanceDto>>
{
    private readonly IMediator _mediator;

    public GetTopSellingProductsHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<IEnumerable<ProductPerformanceDto>> Handle(GetTopSellingProductsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - TOP SELLING] Generating top {request.Count} selling products report");

        var productPerformance = await _mediator.Send(new GetProductPerformanceQuery(
            request.StartDate,
            request.EndDate,
            request.Count,
            "totalrevenue"), cancellationToken);

        return productPerformance;
    }
}