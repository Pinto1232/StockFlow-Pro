using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Landing;

public class GetLandingStatsQuery : IRequest<IEnumerable<LandingStatDto>>
{
    public bool ActiveOnly { get; set; } = true;
}
