namespace StockFlowPro.Application.DTOs.Landing
{
    public class LandingStatDto
    {
        public int Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
