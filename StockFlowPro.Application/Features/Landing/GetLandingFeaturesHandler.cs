using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Landing;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Landing;

public class GetLandingFeaturesHandler : IRequestHandler<GetLandingFeaturesQuery, IEnumerable<LandingFeatureDto>>
{
    private readonly ILandingFeatureRepository _featureRepository;
    private readonly IMapper _mapper;

    public GetLandingFeaturesHandler(ILandingFeatureRepository featureRepository, IMapper mapper)
    {
        _featureRepository = featureRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LandingFeatureDto>> Handle(GetLandingFeaturesQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var features = request.ActiveOnly
            ? await _featureRepository.GetActiveFeaturesByOrderAsync(cancellationToken)
            : await _featureRepository.GetAllByOrderAsync(cancellationToken);

        return _mapper.Map<IEnumerable<LandingFeatureDto>>(features);
    }
}
