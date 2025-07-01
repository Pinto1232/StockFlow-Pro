using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a historical record of subscription status changes.
/// </summary>
public class SubscriptionHistory : IEntity
{
    public Guid Id { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public SubscriptionStatus FromStatus { get; private set; }
    public SubscriptionStatus ToStatus { get; private set; }
    public string? Reason { get; private set; }
    public DateTime ChangedAt { get; private set; }
    public string? ChangedBy { get; private set; } // User ID or system identifier
    public string? Notes { get; private set; }
    public string? Metadata { get; private set; } // JSON string for additional data
    public DateTime CreatedAt { get; private set; }

    // Navigation properties
    public virtual Subscription Subscription { get; private set; } = null!;

    private SubscriptionHistory() { }

    public SubscriptionHistory(
        Guid subscriptionId,
        SubscriptionStatus fromStatus,
        SubscriptionStatus toStatus,
        string? reason = null,
        string? changedBy = null)
    {
        Id = Guid.NewGuid();
        SubscriptionId = subscriptionId;
        FromStatus = fromStatus;
        ToStatus = toStatus;
        Reason = reason;
        ChangedBy = changedBy;
        ChangedAt = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void SetMetadata(string? metadata)
    {
        Metadata = metadata;
    }
}