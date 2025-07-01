using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a feature that can be associated with subscription plans.
/// </summary>
public class PlanFeature : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string FeatureKey { get; private set; } = string.Empty; // Unique identifier for the feature
    public string? DefaultValue { get; private set; }
    public string FeatureType { get; private set; } = "boolean"; // boolean, numeric, text, json
    public bool IsActive { get; private set; }
    public int SortOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public virtual ICollection<SubscriptionPlanFeature> SubscriptionPlanFeatures { get; private set; } = new List<SubscriptionPlanFeature>();

    private PlanFeature() { }

    public PlanFeature(string name, string description, string featureKey, string featureType = "boolean")
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        FeatureKey = featureKey;
        FeatureType = featureType;
        IsActive = true;
        SortOrder = 0;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string description)
    {
        Name = name;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDefaultValue(string? defaultValue)
    {
        DefaultValue = defaultValue;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
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
}