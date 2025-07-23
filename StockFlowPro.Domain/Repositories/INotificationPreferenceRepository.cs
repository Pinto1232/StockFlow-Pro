using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for managing notification preferences.
/// </summary>
public interface INotificationPreferenceRepository : IRepository<NotificationPreference>
{
    /// <summary>
    /// Gets all notification preferences for a specific user.
    /// </summary>
    Task<IEnumerable<NotificationPreference>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific notification preference for a user and notification type.
    /// </summary>
    Task<NotificationPreference?> GetByUserAndTypeAsync(Guid userId, NotificationType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets users who have enabled a specific notification type and channel.
    /// </summary>
    Task<IEnumerable<Guid>> GetUsersWithEnabledNotificationAsync(NotificationType type, NotificationChannel channel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates default notification preferences for a new user.
    /// </summary>
    Task CreateDefaultPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates or creates a notification preference.
    /// </summary>
    Task UpsertPreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes all preferences for a user.
    /// </summary>
    Task DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}