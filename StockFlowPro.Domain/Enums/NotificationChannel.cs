namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the delivery channels for notifications.
/// </summary>
[Flags]
public enum NotificationChannel
{
    /// <summary>
    /// No delivery channel specified
    /// </summary>
    None = 0,

    /// <summary>
    /// In-app real-time notifications via SignalR
    /// </summary>
    InApp = 1,

    /// <summary>
    /// Email notifications
    /// </summary>
    Email = 2,

    /// <summary>
    /// SMS notifications
    /// </summary>
    SMS = 4,

    /// <summary>
    /// Push notifications (for mobile apps)
    /// </summary>
    Push = 8,

    /// <summary>
    /// Browser notifications
    /// </summary>
    Browser = 16,

    /// <summary>
    /// Webhook notifications for external systems
    /// </summary>
    Webhook = 32,

    /// <summary>
    /// All available channels
    /// </summary>
    All = InApp | Email | SMS | Push | Browser | Webhook
}