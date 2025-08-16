using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service for managing user notification preferences.
/// </summary>
public interface INotificationPreferenceService
{
    /// <summary>
    /// Gets all notification preferences for a user.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<NotificationPreference>> GetUserPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific notification preference for a user and type.
    /// </summary>
        System.Threading.Tasks.Task<NotificationPreference?> GetPreferenceAsync(Guid userId, NotificationType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates or creates a notification preference.
    /// </summary>
        System.Threading.Tasks.Task<NotificationPreference> UpdatePreferenceAsync(
        Guid userId,
        NotificationType type,
        NotificationChannel enabledChannels,
        bool isEnabled = true,
        NotificationPriority minimumPriority = NotificationPriority.Low,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sets quiet hours for a user's notification preferences.
    /// </summary>
    Task SetQuietHoursAsync(
        Guid userId,
        TimeSpan startTime,
        TimeSpan endTime,
        IEnumerable<NotificationType>? specificTypes = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Disables quiet hours for a user.
    /// </summary>
    Task DisableQuietHoursAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sets notification batching for a user.
    /// </summary>
    Task SetBatchingAsync(
        Guid userId,
        int intervalMinutes,
        IEnumerable<NotificationType>? specificTypes = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Disables notification batching for a user.
    /// </summary>
    Task DisableBatchingAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Enables a notification type for a user.
    /// </summary>
    Task EnableNotificationTypeAsync(
        Guid userId,
        NotificationType type,
        NotificationChannel channels = NotificationChannel.InApp,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Disables a notification type for a user.
    /// </summary>
    Task DisableNotificationTypeAsync(Guid userId, NotificationType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a notification channel to a user's preferences.
    /// </summary>
    Task AddChannelAsync(Guid userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a notification channel from a user's preferences.
    /// </summary>
    Task RemoveChannelAsync(Guid userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates default notification preferences for a new user.
    /// </summary>
    Task CreateDefaultPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Resets user preferences to default values.
    /// </summary>
    Task ResetToDefaultsAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user should receive a notification based on their preferences.
    /// </summary>
        System.Threading.Tasks.Task<bool> ShouldReceiveNotificationAsync(
        Guid userId,
        NotificationType type,
        NotificationPriority priority,
        NotificationChannel channel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the effective notification channels for a user and notification type.
    /// </summary>
        System.Threading.Tasks.Task<NotificationChannel> GetEffectiveChannelsAsync(
        Guid userId,
        NotificationType type,
        NotificationPriority priority,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Exports user notification preferences.
    /// </summary>
        System.Threading.Tasks.Task<Dictionary<string, object>> ExportPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Imports user notification preferences.
    /// </summary>
    Task ImportPreferencesAsync(Guid userId, Dictionary<string, object> preferences, CancellationToken cancellationToken = default);
}