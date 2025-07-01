using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a saved payment method for a user.
/// </summary>
public class PaymentMethodEntity : IEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Enums.PaymentMethod Type { get; private set; }
    public string? Last4Digits { get; private set; }
    public string? Brand { get; private set; } // Visa, MasterCard, etc.
    public int? ExpiryMonth { get; private set; }
    public int? ExpiryYear { get; private set; }
    public string? HolderName { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // External payment provider IDs
    public string? StripePaymentMethodId { get; private set; }
    public string? PayPalPaymentMethodId { get; private set; }
    
    // Billing address
    public string? BillingAddress { get; private set; } // JSON string
    
    // Metadata
    public string? Metadata { get; private set; } // JSON string for extensibility

    // Navigation properties
    public virtual User User { get; private set; } = null!;

    private PaymentMethodEntity() { }

    public PaymentMethodEntity(
        Guid userId,
        Enums.PaymentMethod type,
        string? last4Digits = null,
        string? brand = null,
        int? expiryMonth = null,
        int? expiryYear = null,
        string? holderName = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Type = type;
        Last4Digits = last4Digits;
        Brand = brand;
        ExpiryMonth = expiryMonth;
        ExpiryYear = expiryYear;
        HolderName = holderName;
        IsActive = true;
        IsDefault = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateCardDetails(string? last4Digits, string? brand, int? expiryMonth, int? expiryYear, string? holderName)
    {
        Last4Digits = last4Digits;
        Brand = brand;
        ExpiryMonth = expiryMonth;
        ExpiryYear = expiryYear;
        HolderName = holderName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveAsDefault()
    {
        IsDefault = false;
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

    public void SetStripePaymentMethodId(string stripePaymentMethodId)
    {
        StripePaymentMethodId = stripePaymentMethodId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPayPalPaymentMethodId(string payPalPaymentMethodId)
    {
        PayPalPaymentMethodId = payPalPaymentMethodId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBillingAddress(string? billingAddress)
    {
        BillingAddress = billingAddress;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMetadata(string? metadata)
    {
        Metadata = metadata;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        if (!ExpiryMonth.HasValue || !ExpiryYear.HasValue)
           { return false;}

        var now = DateTime.UtcNow;
        var expiryDate = new DateTime(ExpiryYear.Value, ExpiryMonth.Value, 1).AddMonths(1).AddDays(-1);
        return expiryDate < now;
    }

    public string GetMaskedNumber()
    {
        return Last4Digits != null ? $"****-****-****-{Last4Digits}" : "****-****-****-****";
    }
}