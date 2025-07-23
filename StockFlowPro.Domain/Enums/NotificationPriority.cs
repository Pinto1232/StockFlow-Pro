namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the priority levels for notifications.
/// </summary>
public enum NotificationPriority
{
    /// <summary>
    /// Low priority notifications (can be batched or delayed)
    /// </summary>
    Low = 0,

    /// <summary>
    /// Normal priority notifications (standard delivery)
    /// </summary>
    Normal = 1,

    /// <summary>
    /// High priority notifications (immediate delivery preferred)
    /// </summary>
    High = 2,

    /// <summary>
    /// Critical notifications (must be delivered immediately)
    /// </summary>
    Critical = 3,

    /// <summary>
    /// Emergency notifications (highest priority, bypass user preferences)
    /// </summary>
    Emergency = 4
}