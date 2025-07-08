using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs;

/// <summary>
/// Data transfer object for subscription plan information
/// </summary>
public class SubscriptionPlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public BillingInterval BillingInterval { get; set; }
    public int BillingIntervalCount { get; set; } = 1;
    public bool IsActive { get; set; }
    public bool IsPublic { get; set; } = true;
    public int? TrialPeriodDays { get; set; }
    public int? MaxUsers { get; set; }
    public int? MaxProjects { get; set; }
    public int? MaxStorageGB { get; set; }
    public bool HasAdvancedReporting { get; set; }
    public bool HasApiAccess { get; set; }
    public bool HasPrioritySupport { get; set; }
    public string? Features { get; set; }
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int SortOrder { get; set; }
    public string? StripeProductId { get; set; }
    public string? StripePriceId { get; set; }
    public string? PayPalPlanId { get; set; }
    
    /// <summary>
    /// Gets the monthly equivalent price for comparison purposes
    /// </summary>
    public decimal MonthlyEquivalentPrice => BillingInterval switch
    {
        BillingInterval.Weekly => Price * 4.33m,
        BillingInterval.Monthly => Price,
        BillingInterval.Quarterly => Price / 3,
        BillingInterval.SemiAnnual => Price / 6,
        BillingInterval.Annual => Price / 12,
        BillingInterval.OneTime => Price,
        _ => Price
    };
    
    /// <summary>
    /// Indicates if this plan has a trial period
    /// </summary>
    public bool HasTrial => TrialPeriodDays.HasValue && TrialPeriodDays > 0;
}