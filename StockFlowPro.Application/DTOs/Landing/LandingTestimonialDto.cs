namespace StockFlowPro.Application.DTOs.Landing
{
    public class LandingTestimonialDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Quote { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
