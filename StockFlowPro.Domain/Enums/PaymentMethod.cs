namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the available payment methods.
/// </summary>
public enum PaymentMethod
{
    /// <summary>
    /// Credit card payment.
    /// </summary>
    CreditCard = 1,
    
    /// <summary>
    /// Debit card payment.
    /// </summary>
    DebitCard = 2,
    
    /// <summary>
    /// PayPal payment.
    /// </summary>
    PayPal = 3,
    
    /// <summary>
    /// Bank transfer/ACH payment.
    /// </summary>
    BankTransfer = 4,
    
    /// <summary>
    /// Apple Pay payment.
    /// </summary>
    ApplePay = 5,
    
    /// <summary>
    /// Google Pay payment.
    /// </summary>
    GooglePay = 6,
    
    /// <summary>
    /// Stripe payment.
    /// </summary>
    Stripe = 7,
    
    /// <summary>
    /// Wire transfer payment.
    /// </summary>
    WireTransfer = 8,
    
    /// <summary>
    /// Cryptocurrency payment.
    /// </summary>
    Cryptocurrency = 9,
    
    /// <summary>
    /// Other payment method.
    /// </summary>
    Other = 10
}