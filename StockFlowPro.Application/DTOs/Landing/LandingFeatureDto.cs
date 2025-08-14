namespace StockFlowPro.Application.DTOs.Landing
{
    public class LandingFeatureDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public string ColorFrom { get; set; } = string.Empty;
        public string ColorTo { get; set; } = string.Empty;
        public List<string> Features { get; set; } = new();
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
