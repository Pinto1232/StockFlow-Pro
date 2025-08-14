using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Landing;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Landing;

public class GetLandingTestimonialsHandler : IRequestHandler<GetLandingTestimonialsQuery, IEnumerable<LandingTestimonialDto>>
{
    private readonly ILandingTestimonialRepository _testimonialRepository;
    private readonly IMapper _mapper;

    public GetLandingTestimonialsHandler(ILandingTestimonialRepository testimonialRepository, IMapper mapper)
    {
        _testimonialRepository = testimonialRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LandingTestimonialDto>> Handle(GetLandingTestimonialsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var testimonials = request.ActiveOnly
            ? await _testimonialRepository.GetActiveTestimonialsByOrderAsync(cancellationToken)
            : await _testimonialRepository.GetAllByOrderAsync(cancellationToken);

        return _mapper.Map<IEnumerable<LandingTestimonialDto>>(testimonials);
    }
}
