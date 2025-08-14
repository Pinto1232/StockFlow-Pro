namespace StockFlowPro.Application.DTOs.Landing
{
    public class LandingContentDto
    {
        public List<LandingFeatureDto> Features { get; set; } = new();
        public List<LandingTestimonialDto> Testimonials { get; set; } = new();
        public List<LandingStatDto> Stats { get; set; } = new();
    }
}
