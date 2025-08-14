using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Landing;

public class GetLandingTestimonialsQuery : IRequest<IEnumerable<LandingTestimonialDto>>
{
    public bool ActiveOnly { get; set; } = true;
}
