using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a payment transaction for a subscription.
/// </summary>
public class Payment : IEntity
{
    public Guid Id { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public Guid UserId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public PaymentStatus Status { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public DateTime PaymentDate { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? TransactionId { get; private set; }
    public string? ExternalTransactionId { get; private set; }
    public string? PaymentIntentId { get; private set; }
    public string? FailureReason { get; private set; }
    public string? FailureCode { get; private set; }
    public decimal? RefundedAmount { get; private set; }
    public DateTime? RefundedAt { get; private set; }
    public string? RefundReason { get; private set; }
    public string? Description { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // Payment provider specific fields
    public string? StripeChargeId { get; private set; }
    public string? StripePaymentIntentId { get; private set; }
    public string? PayPalTransactionId { get; private set; }
    public string? PayPalPaymentId { get; private set; }
    
    // Billing period this payment covers
    public DateTime? BillingPeriodStart { get; private set; }
    public DateTime? BillingPeriodEnd { get; private set; }
    
    // Additional payment details
    public string? PaymentMethodDetails { get; private set; } // JSON string with card details, etc.
    public string? BillingAddress { get; private set; } // JSON string
    public string? Metadata { get; private set; } // JSON string for extensibility
    
    // Retry and attempt tracking
    public int AttemptCount { get; private set; } = 1;
    public DateTime? NextRetryAt { get; private set; }
    public string? RetryReason { get; private set; }

    // Navigation properties
    public virtual Subscription Subscription { get; private set; } = null!;
    public virtual User User { get; private set; } = null!;
    public virtual ICollection<PaymentRefund> PaymentRefunds { get; private set; } = new List<PaymentRefund>();

    private Payment() { }

    public Payment(
        Guid subscriptionId,
        Guid userId,
        decimal amount,
        string currency,
        PaymentMethod paymentMethod,
        string? description = null)
    {
        Id = Guid.NewGuid();
        SubscriptionId = subscriptionId;
        UserId = userId;
        Amount = amount;
        Currency = currency;
        PaymentMethod = paymentMethod;
        Status = PaymentStatus.Pending;
        PaymentDate = DateTime.UtcNow;
        Description = description;
        CreatedAt = DateTime.UtcNow;
        TransactionId = GenerateTransactionId();
    }

    public void MarkAsCompleted(string? externalTransactionId = null, DateTime? processedAt = null)
    {
        Status = PaymentStatus.Completed;
        ExternalTransactionId = externalTransactionId;
        ProcessedAt = processedAt ?? DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string? failureReason = null, string? failureCode = null)
    {
        Status = PaymentStatus.Failed;
        FailureReason = failureReason;
        FailureCode = failureCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsProcessing()
    {
        Status = PaymentStatus.Processing;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsCancelled()
    {
        Status = PaymentStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RequireAction(string? reason = null)
    {
        Status = PaymentStatus.RequiresAction;
        FailureReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsDisputed()
    {
        Status = PaymentStatus.Disputed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ProcessRefund(decimal refundAmount, string? reason = null)
    {
        if (refundAmount <= 0)
            {throw new ArgumentException("Refund amount must be greater than zero", nameof(refundAmount));}
            
        if (refundAmount > Amount)
            {throw new ArgumentException("Refund amount cannot exceed payment amount", nameof(refundAmount));}

        var currentRefunded = RefundedAmount ?? 0;
        if (currentRefunded + refundAmount > Amount)
            {throw new ArgumentException("Total refund amount cannot exceed payment amount", nameof(refundAmount));}

        RefundedAmount = currentRefunded + refundAmount;
        RefundedAt = DateTime.UtcNow;
        RefundReason = reason;
        
        Status = RefundedAmount >= Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
        UpdatedAt = DateTime.UtcNow;

        // Create refund record
        var refund = new PaymentRefund(Id, refundAmount, Currency, reason);
        PaymentRefunds.Add(refund);
    }

    public void SetStripeIds(string? chargeId, string? paymentIntentId)
    {
        StripeChargeId = chargeId;
        StripePaymentIntentId = paymentIntentId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPayPalIds(string? transactionId, string? paymentId)
    {
        PayPalTransactionId = transactionId;
        PayPalPaymentId = paymentId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBillingPeriod(DateTime start, DateTime end)
    {
        BillingPeriodStart = start;
        BillingPeriodEnd = end;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaymentMethodDetails(string? details)
    {
        PaymentMethodDetails = details;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBillingAddress(string? address)
    {
        BillingAddress = address;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMetadata(string? metadata)
    {
        Metadata = metadata;
        UpdatedAt = DateTime.UtcNow;
    }

    public void IncrementAttemptCount()
    {
        AttemptCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ScheduleRetry(DateTime nextRetryAt, string? reason = null)
    {
        NextRetryAt = nextRetryAt;
        RetryReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsSuccessful() => Status == PaymentStatus.Completed;
    
    public bool IsFailed() => Status == PaymentStatus.Failed;
    
    public bool IsPending() => Status == PaymentStatus.Pending || Status == PaymentStatus.Processing;
    
    public bool IsRefunded() => Status == PaymentStatus.Refunded || Status == PaymentStatus.PartiallyRefunded;
    
    public bool CanBeRefunded() => Status == PaymentStatus.Completed && (RefundedAmount ?? 0) < Amount;
    
    public decimal GetRefundableAmount() => Amount - (RefundedAmount ?? 0);
    
    public bool IsRetryable() => Status == PaymentStatus.Failed && AttemptCount < 3;

    private string GenerateTransactionId()
    {
        return $"TXN_{DateTime.UtcNow:yyyyMMdd}_{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }
}