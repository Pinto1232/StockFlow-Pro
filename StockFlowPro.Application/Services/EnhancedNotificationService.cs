using Microsoft.Extensions.Logging;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Enhanced notification service with template support, persistence, and delivery tracking.
/// </summary>
public class EnhancedNotificationService : IEnhancedNotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly INotificationPreferenceRepository _preferenceRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _realTimeNotificationService;
    private readonly ILogger<EnhancedNotificationService> _logger;

    public EnhancedNotificationService(
        INotificationRepository notificationRepository,
        INotificationTemplateRepository templateRepository,
        INotificationPreferenceRepository preferenceRepository,
        IUserRepository userRepository,
        INotificationService realTimeNotificationService,
        ILogger<EnhancedNotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _templateRepository = templateRepository;
        _preferenceRepository = preferenceRepository;
        _userRepository = userRepository;
        _realTimeNotificationService = realTimeNotificationService;
        _logger = logger;
    }

    #region Template-based Notifications

    public async Task<Notification> SendFromTemplateAsync(
        string templateName,
        Dictionary<string, object> parameters,
        Guid? recipientId = null,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null,
        CancellationToken cancellationToken = default)
    {
        var template = await _templateRepository.GetByNameAsync(templateName, cancellationToken);
        if (template == null)
        {
            throw new InvalidOperationException($"Notification template '{templateName}' not found.");
        }

        if (!template.IsActive)
        {
            throw new InvalidOperationException($"Notification template '{templateName}' is not active.");
        }

        var notification = template.GenerateNotification(parameters, recipientId, senderId, priority, channels);

        // Check user preferences if recipient is specified
        if (recipientId.HasValue)
        {
            var effectiveChannels = await GetEffectiveChannelsForUserAsync(
                recipientId.Value,
                notification.Type,
                notification.Priority,
                notification.Channels,
                cancellationToken);

            if (effectiveChannels == NotificationChannel.None)
            {
                _logger.LogInformation("Notification blocked by user preferences for user {UserId}", recipientId);
                notification.MarkAsCancelled();
            }
            else
            {
                notification.UpdateChannels(effectiveChannels);
            }
        }

        // Save to database if persistent
        if (notification.IsPersistent)
        {
            await _notificationRepository.AddAsync(notification, cancellationToken);
        }

        // Send real-time notification if not cancelled
        if (notification.Status != NotificationStatus.Cancelled)
        {
            await DeliverNotificationAsync(notification, cancellationToken);
        }

        _logger.LogInformation("Template notification sent: {TemplateName} to user {RecipientId}", 
            templateName, recipientId);

        return notification;
    }

    public async Task<IEnumerable<Notification>> SendBulkFromTemplateAsync(
        string templateName,
        Dictionary<string, object> parameters,
        IEnumerable<Guid> recipientIds,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null,
        CancellationToken cancellationToken = default)
    {
        var notifications = new List<Notification>();

        foreach (var recipientId in recipientIds)
        {
            try
            {
                var notification = await SendFromTemplateAsync(
                    templateName, parameters, recipientId, senderId, priority, channels, cancellationToken);
                notifications.Add(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send template notification to user {RecipientId}", recipientId);
            }
        }

        return notifications;
    }

    #endregion

    #region Direct Notifications

    public async Task<Notification> SendDirectAsync(
        string title,
        string message,
        NotificationType type,
        Guid? recipientId = null,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        bool isPersistent = true,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification(title, message, type, recipientId, senderId, priority, channels, isPersistent);

        // Check user preferences if recipient is specified
        if (recipientId.HasValue)
        {
            var effectiveChannels = await GetEffectiveChannelsForUserAsync(
                recipientId.Value, type, priority, channels, cancellationToken);

            if (effectiveChannels == NotificationChannel.None)
            {
                _logger.LogInformation("Notification blocked by user preferences for user {UserId}", recipientId);
                notification.MarkAsCancelled();
            }
            else
            {
                notification.UpdateChannels(effectiveChannels);
            }
        }

        // Save to database if persistent
        if (isPersistent)
        {
            await _notificationRepository.AddAsync(notification, cancellationToken);
        }

        // Send real-time notification if not cancelled
        if (notification.Status != NotificationStatus.Cancelled)
        {
            await DeliverNotificationAsync(notification, cancellationToken);
        }

        _logger.LogInformation("Direct notification sent: {Title} to user {RecipientId}", title, recipientId);

        return notification;
    }

    public async Task<IEnumerable<Notification>> SendBulkDirectAsync(
        string title,
        string message,
        NotificationType type,
        IEnumerable<Guid> recipientIds,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        bool isPersistent = true,
        CancellationToken cancellationToken = default)
    {
        var notifications = new List<Notification>();

        foreach (var recipientId in recipientIds)
        {
            try
            {
                var notification = await SendDirectAsync(
                    title, message, type, recipientId, senderId, priority, channels, isPersistent, cancellationToken);
                notifications.Add(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send direct notification to user {RecipientId}", recipientId);
            }
        }

        return notifications;
    }

    #endregion

    #region Role-based Notifications

    public async Task<IEnumerable<Notification>> SendToRolesAsync(
        string title,
        string message,
        NotificationType type,
        IEnumerable<UserRole> roles,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        CancellationToken cancellationToken = default)
    {
        var users = await GetUsersByRolesAsync(roles, cancellationToken);
        var userIds = users.Select(u => u.Id);

        return await SendBulkDirectAsync(title, message, type, userIds, senderId, priority, channels, true, cancellationToken);
    }

    public async Task<IEnumerable<Notification>> SendTemplateToRolesAsync(
        string templateName,
        Dictionary<string, object> parameters,
        IEnumerable<UserRole> roles,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null,
        CancellationToken cancellationToken = default)
    {
        var users = await GetUsersByRolesAsync(roles, cancellationToken);
        var userIds = users.Select(u => u.Id);

        return await SendBulkFromTemplateAsync(templateName, parameters, userIds, senderId, priority, channels, cancellationToken);
    }

    #endregion

    #region System Notifications

    public async Task<IEnumerable<Notification>> SendSystemNotificationAsync(
        string title,
        string message,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        CancellationToken cancellationToken = default)
    {
        var allUsers = await _userRepository.GetAllAsync(cancellationToken);
        var userIds = allUsers.Where(u => u.IsActive).Select(u => u.Id);

        return await SendBulkDirectAsync(title, message, NotificationType.System, userIds, null, priority, channels, true, cancellationToken);
    }

    public async Task<IEnumerable<Notification>> SendEmergencyNotificationAsync(
        string title,
        string message,
        IEnumerable<Guid>? specificUsers = null,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<Guid> userIds;

        if (specificUsers != null)
        {
            userIds = specificUsers;
        }
        else
        {
            var allUsers = await _userRepository.GetAllAsync(cancellationToken);
            userIds = allUsers.Where(u => u.IsActive).Select(u => u.Id);
        }

        // Emergency notifications bypass user preferences and use all channels
        return await SendBulkDirectAsync(
            title, 
            message, 
            NotificationType.System, 
            userIds, 
            null, 
            NotificationPriority.Emergency, 
            NotificationChannel.All, 
            true, 
            cancellationToken);
    }

    #endregion

    #region Notification Management

    public async Task MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId, cancellationToken);
        if (notification != null)
        {
            notification.MarkAsRead();
            await _notificationRepository.UpdateAsync(notification, cancellationToken);
            _logger.LogDebug("Notification {NotificationId} marked as read", notificationId);
        }
    }

    public async Task MarkAsReadAsync(IEnumerable<Guid> notificationIds, CancellationToken cancellationToken = default)
    {
        await _notificationRepository.MarkAsReadAsync(notificationIds, cancellationToken);
        _logger.LogDebug("Marked {Count} notifications as read", notificationIds.Count());
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId, cancellationToken);
        _logger.LogDebug("Marked all notifications as read for user {UserId}", userId);
    }

    public async Task CancelNotificationAsync(Guid notificationId, CancellationToken cancellationToken = default)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId, cancellationToken);
        if (notification != null && notification.Status == NotificationStatus.Pending)
        {
            notification.MarkAsCancelled();
            await _notificationRepository.UpdateAsync(notification, cancellationToken);
            _logger.LogInformation("Notification {NotificationId} cancelled", notificationId);
        }
    }

    public async Task RetryFailedNotificationsAsync(CancellationToken cancellationToken = default)
    {
        var failedNotifications = await _notificationRepository.GetRetryableFailedAsync(cancellationToken);

        foreach (var notification in failedNotifications)
        {
            try
            {
                await DeliverNotificationAsync(notification, cancellationToken);
                _logger.LogInformation("Retried failed notification {NotificationId}", notification.Id);
            }
            catch (Exception ex)
            {
                notification.MarkAsFailed($"Retry failed: {ex.Message}");
                await _notificationRepository.UpdateAsync(notification, cancellationToken);
                _logger.LogError(ex, "Failed to retry notification {NotificationId}", notification.Id);
            }
        }
    }

    #endregion

    #region Notification Queries

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(
        Guid userId,
        int page = 1,
        int pageSize = 20,
        NotificationStatus? status = null,
        NotificationType? type = null,
        CancellationToken cancellationToken = default)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(userId, cancellationToken);

        if (status.HasValue)
        {
            notifications = notifications.Where(n => n.Status == status.Value);
        }

        if (type.HasValue)
        {
            notifications = notifications.Where(n => n.Type == type.Value);
        }

        return notifications
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId, cancellationToken);
    }

    public async Task<Dictionary<NotificationType, int>> GetNotificationStatsAsync(
        Guid userId,
        DateTime? fromDate = null,
        CancellationToken cancellationToken = default)
    {
        return await _notificationRepository.GetNotificationStatsAsync(userId, fromDate, cancellationToken);
    }

    #endregion

    #region Background Processing

    public async Task ProcessPendingNotificationsAsync(CancellationToken cancellationToken = default)
    {
        var pendingNotifications = await _notificationRepository.GetByStatusAsync(NotificationStatus.Pending, cancellationToken);

        foreach (var notification in pendingNotifications)
        {
            try
            {
                if (notification.IsExpired())
                {
                    notification.MarkAsExpired();
                    await _notificationRepository.UpdateAsync(notification, cancellationToken);
                    continue;
                }

                await DeliverNotificationAsync(notification, cancellationToken);
            }
            catch (Exception ex)
            {
                notification.MarkAsFailed(ex.Message);
                await _notificationRepository.UpdateAsync(notification, cancellationToken);
                _logger.LogError(ex, "Failed to process pending notification {NotificationId}", notification.Id);
            }
        }
    }

    public async Task CleanupNotificationsAsync(CancellationToken cancellationToken = default)
    {
        // Mark expired notifications
        var expiredNotifications = await _notificationRepository.GetExpiredAsync(cancellationToken);
        foreach (var notification in expiredNotifications)
        {
            notification.MarkAsExpired();
            await _notificationRepository.UpdateAsync(notification, cancellationToken);
        }

        // Delete old notifications (older than 90 days)
        var cutoffDate = DateTime.UtcNow.AddDays(-90);
        await _notificationRepository.DeleteOldNotificationsAsync(cutoffDate, cancellationToken);

        _logger.LogInformation("Notification cleanup completed. Expired: {ExpiredCount}", expiredNotifications.Count());
    }

    #endregion

    #region Private Helper Methods

    private async Task<NotificationChannel> GetEffectiveChannelsForUserAsync(
        Guid userId,
        NotificationType type,
        NotificationPriority priority,
        NotificationChannel requestedChannels,
        CancellationToken cancellationToken)
    {
        // Emergency notifications bypass user preferences
        if (priority == NotificationPriority.Emergency)
        {
            return requestedChannels;
        }

        var preference = await _preferenceRepository.GetByUserAndTypeAsync(userId, type, cancellationToken);
        if (preference == null)
        {
            // No preference found, use default behavior
            return requestedChannels;
        }

        if (!preference.ShouldReceiveNotification(priority, NotificationChannel.InApp))
        {
            return NotificationChannel.None;
        }

        // Return intersection of requested channels and user's enabled channels
        return requestedChannels & preference.EnabledChannels;
    }

    private async Task DeliverNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        try
        {
            notification.IncrementDeliveryAttempts();

            // Deliver via real-time service (SignalR)
            if (notification.HasChannel(NotificationChannel.InApp))
            {
                if (notification.RecipientId.HasValue)
                {
                    await _realTimeNotificationService.SendUserNotificationAsync(
                        notification.RecipientId.Value.ToString(),
                        notification.Message,
                        notification.Type.ToString().ToLower());
                }
                else
                {
                    await _realTimeNotificationService.SendToAllAsync("UserNotification", new
                    {
                        Title = notification.Title,
                        Message = notification.Message,
                        Type = notification.Type.ToString().ToLower(),
                        Priority = notification.Priority.ToString().ToLower(),
                        Timestamp = DateTime.UtcNow
                    });
                }
            }

            // TODO: Implement other delivery channels (Email, SMS, Push, etc.)
            // This would involve additional services for each channel

            notification.MarkAsDelivered();
            
            if (notification.IsPersistent)
            {
                await _notificationRepository.UpdateAsync(notification, cancellationToken);
            }

            _logger.LogDebug("Notification {NotificationId} delivered successfully", notification.Id);
        }
        catch (Exception ex)
        {
            notification.MarkAsFailed(ex.Message);
            
            if (notification.IsPersistent)
            {
                await _notificationRepository.UpdateAsync(notification, cancellationToken);
            }

            _logger.LogError(ex, "Failed to deliver notification {NotificationId}", notification.Id);
            throw;
        }
    }

    private async Task<IEnumerable<User>> GetUsersByRolesAsync(IEnumerable<UserRole> roles, CancellationToken cancellationToken)
    {
        var allUsers = await _userRepository.GetAllAsync(cancellationToken);
        return allUsers.Where(u => u.IsActive && roles.Contains(u.Role));
    }

    #endregion
}