namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the possible statuses for a payment transaction.
/// </summary>
public enum PaymentStatus
{
    /// <summary>
    /// Payment is pending processing.
    /// </summary>
    Pending = 1,
    
    /// <summary>
    /// Payment has been successfully processed.
    /// </summary>
    Completed = 2,
    
    /// <summary>
    /// Payment has failed.
    /// </summary>
    Failed = 3,
    
    /// <summary>
    /// Payment has been cancelled.
    /// </summary>
    Cancelled = 4,
    
    /// <summary>
    /// Payment has been refunded.
    /// </summary>
    Refunded = 5,
    
    /// <summary>
    /// Payment has been partially refunded.
    /// </summary>
    PartiallyRefunded = 6,
    
    /// <summary>
    /// Payment is being processed.
    /// </summary>
    Processing = 7,
    
    /// <summary>
    /// Payment requires additional action (e.g., 3D Secure authentication).
    /// </summary>
    RequiresAction = 8,
    
    /// <summary>
    /// Payment has been disputed/charged back.
    /// </summary>
    Disputed = 9
}