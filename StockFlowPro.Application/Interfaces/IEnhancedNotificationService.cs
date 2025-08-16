using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Enhanced notification service with template support, persistence, and delivery tracking.
/// </summary>
public interface IEnhancedNotificationService
{
    #region Template-based Notifications

    /// <summary>
    /// Sends a notification using a template.
    /// </summary>
        System.Threading.Tasks.Task<Notification> SendFromTemplateAsync(
        string templateName,
        Dictionary<string, object> parameters,
        Guid? recipientId = null,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notifications to multiple recipients using a template.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> SendBulkFromTemplateAsync(
        string templateName,
        Dictionary<string, object> parameters,
        IEnumerable<Guid> recipientIds,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Direct Notifications

    /// <summary>
    /// Sends a direct notification without using a template.
    /// </summary>
        System.Threading.Tasks.Task<Notification> SendDirectAsync(
        string title,
        string message,
        NotificationType type,
        Guid? recipientId = null,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        bool isPersistent = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notifications to multiple recipients.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> SendBulkDirectAsync(
        string title,
        string message,
        NotificationType type,
        IEnumerable<Guid> recipientIds,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        bool isPersistent = true,
        CancellationToken cancellationToken = default);

    #endregion

    #region Role-based Notifications

    /// <summary>
    /// Sends a notification to all users with specific roles.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> SendToRolesAsync(
        string title,
        string message,
        NotificationType type,
        IEnumerable<UserRole> roles,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a template-based notification to all users with specific roles.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> SendTemplateToRolesAsync(
        string templateName,
        Dictionary<string, object> parameters,
        IEnumerable<UserRole> roles,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region System Notifications

    /// <summary>
    /// Sends a system-wide notification to all users.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> SendSystemNotificationAsync(
        string title,
        string message,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an emergency notification that bypasses user preferences.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> SendEmergencyNotificationAsync(
        string title,
        string message,
        IEnumerable<Guid>? specificUsers = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Notification Management

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
    Task MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks multiple notifications as read.
    /// </summary>
    Task MarkAsReadAsync(IEnumerable<Guid> notificationIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks all notifications for a user as read.
    /// </summary>
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a pending notification.
    /// </summary>
    Task CancelNotificationAsync(Guid notificationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retries failed notifications.
    /// </summary>
    Task RetryFailedNotificationsAsync(CancellationToken cancellationToken = default);

    #endregion

    #region Notification Queries

    /// <summary>
    /// Gets notifications for a specific user.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<Notification>> GetUserNotificationsAsync(
        Guid userId,
        int page = 1,
        int pageSize = 20,
        NotificationStatus? status = null,
        NotificationType? type = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unread notification count for a user.
    /// </summary>
        System.Threading.Tasks.Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notification statistics for a user.
    /// </summary>
        System.Threading.Tasks.Task<Dictionary<NotificationType, int>> GetNotificationStatsAsync(
        Guid userId,
        DateTime? fromDate = null,
        CancellationToken cancellationToken = default);

    #endregion

    #region Background Processing

    /// <summary>
    /// Processes pending notifications for delivery.
    /// </summary>
    Task ProcessPendingNotificationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Cleans up expired and old notifications.
    /// </summary>
    Task CleanupNotificationsAsync(CancellationToken cancellationToken = default);

    #endregion
}