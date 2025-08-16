namespace StockFlowPro.Application.DTOs;

public class LandingContentDto
{
    public LandingHeroDto? Hero { get; set; }
    public IEnumerable<LandingFeatureDto> Features { get; set; } = new List<LandingFeatureDto>();
    public IEnumerable<LandingTestimonialDto> Testimonials { get; set; } = new List<LandingTestimonialDto>();
    public IEnumerable<LandingStatDto> Stats { get; set; } = new List<LandingStatDto>();
}
