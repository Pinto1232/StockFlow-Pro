using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a refund transaction for a payment.
/// </summary>
public class PaymentRefund : IEntity
{
    public Guid Id { get; private set; }
    public Guid PaymentId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public string? Reason { get; private set; }
    public DateTime RefundDate { get; private set; }
    public string? ExternalRefundId { get; private set; }
    public string? StripeRefundId { get; private set; }
    public string? PayPalRefundId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public virtual Payment Payment { get; private set; } = null!;

    private PaymentRefund() { }

    public PaymentRefund(Guid paymentId, decimal amount, string currency, string? reason = null)
    {
        Id = Guid.NewGuid();
        PaymentId = paymentId;
        Amount = amount;
        Currency = currency;
        Reason = reason;
        RefundDate = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetExternalRefundId(string externalRefundId)
    {
        ExternalRefundId = externalRefundId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStripeRefundId(string stripeRefundId)
    {
        StripeRefundId = stripeRefundId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPayPalRefundId(string payPalRefundId)
    {
        PayPalRefundId = payPalRefundId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }
}