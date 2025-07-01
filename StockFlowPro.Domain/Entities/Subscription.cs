using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a user's subscription to a specific plan.
/// </summary>
public class Subscription : IEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid SubscriptionPlanId { get; private set; }
    public SubscriptionStatus Status { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public DateTime? TrialEndDate { get; private set; }
    public DateTime CurrentPeriodStart { get; private set; }
    public DateTime CurrentPeriodEnd { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public DateTime? CancelAtPeriodEnd { get; private set; }
    public string? CancellationReason { get; private set; }
    public decimal CurrentPrice { get; private set; }
    public string Currency { get; private set; } = "USD";
    public int Quantity { get; private set; } = 1;
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // Payment provider specific fields
    public string? StripeSubscriptionId { get; private set; }
    public string? StripeCustomerId { get; private set; }
    public string? PayPalSubscriptionId { get; private set; }
    public string? PayPalPayerId { get; private set; }
    
    // Billing and payment tracking
    public DateTime? NextBillingDate { get; private set; }
    public int? GracePeriodDays { get; private set; }
    public DateTime? GracePeriodEndDate { get; private set; }
    public int FailedPaymentAttempts { get; private set; }
    public DateTime? LastPaymentAttemptDate { get; private set; }
    
    // Metadata and notes
    public string? Notes { get; private set; }
    public string? Metadata { get; private set; } // JSON string for extensibility

    // Navigation properties
    public virtual User User { get; private set; } = null!;
    public virtual SubscriptionPlan SubscriptionPlan { get; private set; } = null!;
    public virtual ICollection<Payment> Payments { get; private set; } = new List<Payment>();
    public virtual ICollection<SubscriptionHistory> SubscriptionHistories { get; private set; } = new List<SubscriptionHistory>();

    private Subscription() { }

    public Subscription(
        Guid userId,
        Guid subscriptionPlanId,
        DateTime startDate,
        decimal currentPrice,
        string currency = "USD",
        DateTime? trialEndDate = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        SubscriptionPlanId = subscriptionPlanId;
        Status = trialEndDate.HasValue ? SubscriptionStatus.Trial : SubscriptionStatus.Active;
        StartDate = startDate;
        TrialEndDate = trialEndDate;
        CurrentPeriodStart = startDate;
        CurrentPrice = currentPrice;
        Currency = currency;
        Quantity = 1;
        CreatedAt = DateTime.UtcNow;
        FailedPaymentAttempts = 0;
        
        // Calculate current period end based on billing interval
        CurrentPeriodEnd = CalculateNextBillingDate(startDate);
        NextBillingDate = trialEndDate ?? CurrentPeriodEnd;
    }

    public void UpdateStatus(SubscriptionStatus status, string? reason = null)
    {
        var previousStatus = Status;
        Status = status;
        
        if (status == SubscriptionStatus.Cancelled && CancelledAt == null)
        {
            CancelledAt = DateTime.UtcNow;
            CancellationReason = reason;
        }
        
        UpdatedAt = DateTime.UtcNow;
        
        // Create history record
        AddHistoryRecord(previousStatus, status, reason);
    }

    public void Cancel(bool cancelAtPeriodEnd = true, string? reason = null)
    {
        if (cancelAtPeriodEnd)
        {
            CancelAtPeriodEnd = CurrentPeriodEnd;
            CancellationReason = reason;
            // Keep status as Active until period ends
        }
        else
        {
            UpdateStatus(SubscriptionStatus.Cancelled, reason);
            EndDate = DateTime.UtcNow;
        }
        
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reactivate()
    {
        Status = SubscriptionStatus.Active;
        CancelledAt = null;
        CancelAtPeriodEnd = null;
        CancellationReason = null;
        EndDate = null;
        FailedPaymentAttempts = 0;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePricing(decimal newPrice, string currency = "USD")
    {
        CurrentPrice = newPrice;
        Currency = currency;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
           { throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));}
            
        Quantity = quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RenewPeriod()
    {
        CurrentPeriodStart = CurrentPeriodEnd;
        CurrentPeriodEnd = CalculateNextBillingDate(CurrentPeriodStart);
        NextBillingDate = CurrentPeriodEnd;
        FailedPaymentAttempts = 0;
        GracePeriodEndDate = null;
        
        if (Status == SubscriptionStatus.PastDue || Status == SubscriptionStatus.Suspended)
        {
            Status = SubscriptionStatus.Active;
        }
        
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordFailedPayment()
    {
        FailedPaymentAttempts++;
        LastPaymentAttemptDate = DateTime.UtcNow;
        
        if (FailedPaymentAttempts >= 3)
        {
            Status = SubscriptionStatus.PastDue;
            SetGracePeriod(7); // 7 days grace period
        }
        else
        {
            Status = SubscriptionStatus.Suspended;
        }
        
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetGracePeriod(int days)
    {
        GracePeriodDays = days;
        GracePeriodEndDate = DateTime.UtcNow.AddDays(days);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStripeIds(string? subscriptionId, string? customerId)
    {
        StripeSubscriptionId = subscriptionId;
        StripeCustomerId = customerId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPayPalIds(string? subscriptionId, string? payerId)
    {
        PayPalSubscriptionId = subscriptionId;
        PayPalPayerId = payerId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMetadata(string? metadata)
    {
        Metadata = metadata;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsActive() => Status == SubscriptionStatus.Active || Status == SubscriptionStatus.Trial;
    
    public bool IsInTrial() => Status == SubscriptionStatus.Trial && TrialEndDate.HasValue && TrialEndDate > DateTime.UtcNow;
    
    public bool IsExpired() => Status == SubscriptionStatus.Expired || (EndDate.HasValue && EndDate <= DateTime.UtcNow);
    
    public bool IsCancelled() => Status == SubscriptionStatus.Cancelled;
    
    public bool WillCancelAtPeriodEnd() => CancelAtPeriodEnd.HasValue && CancelAtPeriodEnd > DateTime.UtcNow;
    
    public bool IsInGracePeriod() => GracePeriodEndDate.HasValue && GracePeriodEndDate > DateTime.UtcNow;
    
    public int DaysUntilExpiry()
    {
        var expiryDate = EndDate ?? CurrentPeriodEnd;
        return Math.Max(0, (int)(expiryDate - DateTime.UtcNow).TotalDays);
    }

    public decimal GetTotalAmount() => CurrentPrice * Quantity;

    private DateTime CalculateNextBillingDate(DateTime fromDate)
    {
        // This would need to be implemented based on the subscription plan's billing interval
        // For now, defaulting to monthly
        return fromDate.AddMonths(1);
    }

    private void AddHistoryRecord(SubscriptionStatus fromStatus, SubscriptionStatus toStatus, string? reason)
    {
        var history = new SubscriptionHistory(Id, fromStatus, toStatus, reason);
        SubscriptionHistories.Add(history);
    }
}