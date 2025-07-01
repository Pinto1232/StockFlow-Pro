using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a subscription plan that defines pricing and features for users.
/// </summary>
public class SubscriptionPlan : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "USD";
    public BillingInterval BillingInterval { get; private set; }
    public int BillingIntervalCount { get; private set; } = 1;
    public bool IsActive { get; private set; }
    public bool IsPublic { get; private set; } = true;
    public int? TrialPeriodDays { get; private set; }
    public int? MaxUsers { get; private set; }
    public int? MaxProjects { get; private set; }
    public int? MaxStorageGB { get; private set; }
    public bool HasAdvancedReporting { get; private set; }
    public bool HasApiAccess { get; private set; }
    public bool HasPrioritySupport { get; private set; }
    public string? Features { get; private set; } // JSON string of additional features
    public string? Metadata { get; private set; } // JSON string for extensibility
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public int SortOrder { get; private set; }
    
    // External payment provider IDs
    public string? StripeProductId { get; private set; }
    public string? StripePriceId { get; private set; }
    public string? PayPalPlanId { get; private set; }

    // Navigation properties
    public virtual ICollection<Subscription> Subscriptions { get; private set; } = new List<Subscription>();
    public virtual ICollection<SubscriptionPlanFeature> PlanFeatures { get; private set; } = new List<SubscriptionPlanFeature>();

    private SubscriptionPlan() { }

    public SubscriptionPlan(
        string name,
        string description,
        decimal price,
        BillingInterval billingInterval,
        string currency = "USD",
        int billingIntervalCount = 1,
        int? trialPeriodDays = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        Price = price;
        Currency = currency;
        BillingInterval = billingInterval;
        BillingIntervalCount = billingIntervalCount;
        TrialPeriodDays = trialPeriodDays;
        IsActive = true;
        IsPublic = true;
        CreatedAt = DateTime.UtcNow;
        SortOrder = 0;
    }

    public void UpdatePricing(decimal price, string currency = "USD")
    {
        Price = price;
        Currency = currency;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string description)
    {
        Name = name;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateBilling(BillingInterval billingInterval, int billingIntervalCount = 1)
    {
        BillingInterval = billingInterval;
        BillingIntervalCount = billingIntervalCount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTrialPeriod(int? trialPeriodDays)
    {
        TrialPeriodDays = trialPeriodDays;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLimits(int? maxUsers = null, int? maxProjects = null, int? maxStorageGB = null)
    {
        MaxUsers = maxUsers;
        MaxProjects = maxProjects;
        MaxStorageGB = maxStorageGB;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFeatures(bool hasAdvancedReporting, bool hasApiAccess, bool hasPrioritySupport)
    {
        HasAdvancedReporting = hasAdvancedReporting;
        HasApiAccess = hasApiAccess;
        HasPrioritySupport = hasPrioritySupport;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFeatures(string? features)
    {
        Features = features;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMetadata(string? metadata)
    {
        Metadata = metadata;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetVisibility(bool isPublic)
    {
        IsPublic = isPublic;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStripeIds(string? productId, string? priceId)
    {
        StripeProductId = productId;
        StripePriceId = priceId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPayPalPlanId(string? planId)
    {
        PayPalPlanId = planId;
        UpdatedAt = DateTime.UtcNow;
    }

    public decimal GetMonthlyEquivalentPrice()
    {
        return BillingInterval switch
        {
            BillingInterval.Weekly => Price * 4.33m,
            BillingInterval.Monthly => Price,
            BillingInterval.Quarterly => Price / 3,
            BillingInterval.SemiAnnual => Price / 6,
            BillingInterval.Annual => Price / 12,
            BillingInterval.OneTime => Price,
            _ => Price
        };
    }

    public bool HasTrial() => TrialPeriodDays.HasValue && TrialPeriodDays > 0;
}