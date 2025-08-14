using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Landing;

public class GetLandingFeaturesQuery : IRequest<IEnumerable<LandingFeatureDto>>
{
    public bool ActiveOnly { get; set; } = true;
}
