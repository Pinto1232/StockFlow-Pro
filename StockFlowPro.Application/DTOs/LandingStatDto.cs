namespace StockFlowPro.Application.DTOs;

public class LandingStatDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string IconName { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
