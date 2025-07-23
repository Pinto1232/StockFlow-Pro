namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the types of notifications that can be sent in the system.
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// General informational notifications
    /// </summary>
    Info = 0,

    /// <summary>
    /// Success notifications for completed actions
    /// </summary>
    Success = 1,

    /// <summary>
    /// Warning notifications for potential issues
    /// </summary>
    Warning = 2,

    /// <summary>
    /// Error notifications for failures or critical issues
    /// </summary>
    Error = 3,

    /// <summary>
    /// Stock level alerts (low stock, out of stock)
    /// </summary>
    StockAlert = 4,

    /// <summary>
    /// Invoice-related notifications
    /// </summary>
    Invoice = 5,

    /// <summary>
    /// Payment-related notifications
    /// </summary>
    Payment = 6,

    /// <summary>
    /// User account notifications (login, security, etc.)
    /// </summary>
    Account = 7,

    /// <summary>
    /// System maintenance and updates
    /// </summary>
    System = 8,

    /// <summary>
    /// Role and permission changes
    /// </summary>
    Security = 9,

    /// <summary>
    /// Subscription and billing notifications
    /// </summary>
    Subscription = 10,

    /// <summary>
    /// Product-related notifications
    /// </summary>
    Product = 11,

    /// <summary>
    /// Report generation and availability
    /// </summary>
    Report = 12
}