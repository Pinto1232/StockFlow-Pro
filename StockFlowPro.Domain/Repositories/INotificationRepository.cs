using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for managing notifications.
/// </summary>
public interface INotificationRepository : IRepository<Notification>
{
    /// <summary>
    /// Gets notifications for a specific user.
    /// </summary>
    Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unread notifications for a specific user.
    /// </summary>
    Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notifications by status.
    /// </summary>
    Task<IEnumerable<Notification>> GetByStatusAsync(NotificationStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notifications by type.
    /// </summary>
    Task<IEnumerable<Notification>> GetByTypeAsync(NotificationType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notifications by priority.
    /// </summary>
    Task<IEnumerable<Notification>> GetByPriorityAsync(NotificationPriority priority, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expired notifications.
    /// </summary>
    Task<IEnumerable<Notification>> GetExpiredAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets failed notifications that can be retried.
    /// </summary>
    Task<IEnumerable<Notification>> GetRetryableFailedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notifications created within a date range.
    /// </summary>
    Task<IEnumerable<Notification>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notifications related to a specific entity.
    /// </summary>
    Task<IEnumerable<Notification>> GetByRelatedEntityAsync(Guid entityId, string entityType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of unread notifications for a user.
    /// </summary>
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks multiple notifications as read.
    /// </summary>
    Task MarkAsReadAsync(IEnumerable<Guid> notificationIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks all notifications for a user as read.
    /// </summary>
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes old notifications based on retention policy.
    /// </summary>
    Task DeleteOldNotificationsAsync(DateTime cutoffDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notification statistics for a user.
    /// </summary>
    Task<Dictionary<NotificationType, int>> GetNotificationStatsAsync(Guid userId, DateTime? fromDate = null, CancellationToken cancellationToken = default);
}