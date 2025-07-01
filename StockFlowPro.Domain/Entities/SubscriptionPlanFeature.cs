using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents the relationship between subscription plans and their features with specific values.
/// </summary>
public class SubscriptionPlanFeature : IEntity
{
    public Guid Id { get; private set; }
    public Guid SubscriptionPlanId { get; private set; }
    public Guid PlanFeatureId { get; private set; }
    public string? Value { get; private set; }
    public bool IsEnabled { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public virtual SubscriptionPlan SubscriptionPlan { get; private set; } = null!;
    public virtual PlanFeature PlanFeature { get; private set; } = null!;

    private SubscriptionPlanFeature() { }

    public SubscriptionPlanFeature(Guid subscriptionPlanId, Guid planFeatureId, string? value = null, bool isEnabled = true)
    {
        Id = Guid.NewGuid();
        SubscriptionPlanId = subscriptionPlanId;
        PlanFeatureId = planFeatureId;
        Value = value;
        IsEnabled = isEnabled;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateValue(string? value)
    {
        Value = value;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Enable()
    {
        IsEnabled = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }
}