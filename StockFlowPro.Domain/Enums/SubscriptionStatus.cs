namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the possible statuses for a subscription.
/// </summary>
public enum SubscriptionStatus
{
    /// <summary>
    /// Subscription is active and in good standing.
    /// </summary>
    Active = 1,
    
    /// <summary>
    /// Subscription is temporarily suspended (e.g., payment failed but within grace period).
    /// </summary>
    Suspended = 2,
    
    /// <summary>
    /// Subscription has been cancelled but may still be active until the end of the billing period.
    /// </summary>
    Cancelled = 3,
    
    /// <summary>
    /// Subscription has expired and is no longer active.
    /// </summary>
    Expired = 4,
    
    /// <summary>
    /// Subscription is in trial period.
    /// </summary>
    Trial = 5,
    
    /// <summary>
    /// Subscription is past due (payment failed and outside grace period).
    /// </summary>
    PastDue = 6,
    
    /// <summary>
    /// Subscription is pending activation (e.g., waiting for payment confirmation).
    /// </summary>
    Pending = 7
}