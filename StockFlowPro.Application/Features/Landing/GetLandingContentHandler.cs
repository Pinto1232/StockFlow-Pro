using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Landing;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Landing;

public class GetLandingContentHandler : IRequestHandler<GetLandingContentQuery, LandingContentDto>
{
    private readonly ILandingFeatureRepository _featureRepository;
    private readonly ILandingTestimonialRepository _testimonialRepository;
    private readonly ILandingStatRepository _statRepository;
    private readonly IMapper _mapper;

    public GetLandingContentHandler(
        ILandingFeatureRepository featureRepository,
        ILandingTestimonialRepository testimonialRepository,
        ILandingStatRepository statRepository,
        IMapper mapper)
    {
        _featureRepository = featureRepository;
        _testimonialRepository = testimonialRepository;
        _statRepository = statRepository;
        _mapper = mapper;
    }

    public async Task<LandingContentDto> Handle(GetLandingContentQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        // Execute operations sequentially to avoid DbContext threading issues
        var features = request.ActiveOnly
            ? await _featureRepository.GetActiveFeaturesByOrderAsync(cancellationToken)
            : await _featureRepository.GetAllByOrderAsync(cancellationToken);

        var testimonials = request.ActiveOnly
            ? await _testimonialRepository.GetActiveTestimonialsByOrderAsync(cancellationToken)
            : await _testimonialRepository.GetAllByOrderAsync(cancellationToken);

        var stats = request.ActiveOnly
            ? await _statRepository.GetActiveStatsByOrderAsync(cancellationToken)
            : await _statRepository.GetAllByOrderAsync(cancellationToken);

        return new LandingContentDto
        {
            Features = _mapper.Map<IEnumerable<LandingFeatureDto>>(features),
            Testimonials = _mapper.Map<IEnumerable<LandingTestimonialDto>>(testimonials),
            Stats = _mapper.Map<IEnumerable<LandingStatDto>>(stats)
        };
    }
}
