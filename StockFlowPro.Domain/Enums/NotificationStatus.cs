namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the delivery status of notifications.
/// </summary>
public enum NotificationStatus
{
    /// <summary>
    /// Notification has been created but not yet sent
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Notification has been successfully sent
    /// </summary>
    Sent = 1,

    /// <summary>
    /// Notification has been delivered to the recipient
    /// </summary>
    Delivered = 2,

    /// <summary>
    /// Notification has been read by the recipient
    /// </summary>
    Read = 3,

    /// <summary>
    /// Notification delivery failed
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Notification was cancelled before sending
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Notification expired before being read
    /// </summary>
    Expired = 6
}