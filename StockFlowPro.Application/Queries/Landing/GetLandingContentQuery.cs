using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Landing;

public class GetLandingContentQuery : IRequest<LandingContentDto>
{
    public bool ActiveOnly { get; set; } = true;
}
