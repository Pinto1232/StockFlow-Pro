namespace StockFlowPro.Application.DTOs;

public class EntitlementsDto
{
    // Feature flags
    public bool HasAdvancedReporting { get; set; }
    public bool HasApiAccess { get; set; }
    public bool HasPrioritySupport { get; set; }

    // Limits (null = unlimited)
    public int? MaxUsers { get; set; }
    public int? MaxProjects { get; set; }
    public int? MaxStorageGB { get; set; }

    // Plan basics (optional but useful to show in UI)
    public Guid PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public decimal Price { get; set; }
    public string BillingInterval { get; set; } = "Monthly";
    public bool IsTrial { get; set; }
    public DateTime? TrialEndDate { get; set; }
}
