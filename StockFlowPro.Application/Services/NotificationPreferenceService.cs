using Microsoft.Extensions.Logging;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service for managing user notification preferences.
/// </summary>
public class NotificationPreferenceService : INotificationPreferenceService
{
    private readonly INotificationPreferenceRepository _preferenceRepository;
    private readonly ILogger<NotificationPreferenceService> _logger;

    public NotificationPreferenceService(
        INotificationPreferenceRepository preferenceRepository,
        ILogger<NotificationPreferenceService> logger)
    {
        _preferenceRepository = preferenceRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationPreference>> GetUserPreferencesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var preferences = await _preferenceRepository.GetByUserIdAsync(userId, cancellationToken);
        
        // If no preferences exist, create default ones
        if (!preferences.Any())
        {
            await CreateDefaultPreferencesAsync(userId, cancellationToken);
            preferences = await _preferenceRepository.GetByUserIdAsync(userId, cancellationToken);
        }

        return preferences;
    }

    public async Task<NotificationPreference?> GetPreferenceAsync(Guid userId, NotificationType type, CancellationToken cancellationToken = default)
    {
        var preference = await _preferenceRepository.GetByUserAndTypeAsync(userId, type, cancellationToken);
        
        // If preference doesn't exist, create a default one
        if (preference == null)
        {
            preference = new NotificationPreference(userId, type);
            await _preferenceRepository.AddAsync(preference, cancellationToken);
            _logger.LogDebug("Created default preference for user {UserId} and type {Type}", userId, type);
        }

        return preference;
    }

    public async Task<NotificationPreference> UpdatePreferenceAsync(
        Guid userId,
        NotificationType type,
        NotificationChannel enabledChannels,
        bool isEnabled = true,
        NotificationPriority minimumPriority = NotificationPriority.Low,
        CancellationToken cancellationToken = default)
    {
        var preference = await _preferenceRepository.GetByUserAndTypeAsync(userId, type, cancellationToken);

        if (preference == null)
        {
            preference = new NotificationPreference(userId, type, enabledChannels, isEnabled, minimumPriority);
            await _preferenceRepository.AddAsync(preference, cancellationToken);
        }
        else
        {
            preference.UpdateChannels(enabledChannels);
            if (isEnabled)
                {preference.Enable();}
            else
                {preference.Disable();}
            preference.SetMinimumPriority(minimumPriority);
            
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogDebug("Updated preference for user {UserId} and type {Type}", userId, type);
        return preference;
    }

    public async Task SetQuietHoursAsync(
        Guid userId,
        TimeSpan startTime,
        TimeSpan endTime,
        IEnumerable<NotificationType>? specificTypes = null,
        CancellationToken cancellationToken = default)
    {
        var preferences = await GetUserPreferencesAsync(userId, cancellationToken);

        var typesToUpdate = specificTypes?.ToList() ?? Enum.GetValues<NotificationType>().ToList();

        foreach (var type in typesToUpdate)
        {
            var preference = preferences.FirstOrDefault(p => p.NotificationType == type);
            if (preference != null)
            {
                preference.SetQuietHours(startTime, endTime);
                await _preferenceRepository.UpdateAsync(preference, cancellationToken);
            }
        }

        _logger.LogInformation("Set quiet hours for user {UserId}: {StartTime} to {EndTime}", userId, startTime, endTime);
    }

    public async Task DisableQuietHoursAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var preferences = await GetUserPreferencesAsync(userId, cancellationToken);

        foreach (var preference in preferences)
        {
            preference.DisableQuietHours();
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogInformation("Disabled quiet hours for user {UserId}", userId);
    }

    public async Task SetBatchingAsync(
        Guid userId,
        int intervalMinutes,
        IEnumerable<NotificationType>? specificTypes = null,
        CancellationToken cancellationToken = default)
    {
        var preferences = await GetUserPreferencesAsync(userId, cancellationToken);

        var typesToUpdate = specificTypes?.ToList() ?? Enum.GetValues<NotificationType>().ToList();

        foreach (var type in typesToUpdate)
        {
            var preference = preferences.FirstOrDefault(p => p.NotificationType == type);
            if (preference != null)
            {
                preference.SetBatching(intervalMinutes);
                await _preferenceRepository.UpdateAsync(preference, cancellationToken);
            }
        }

        _logger.LogInformation("Set batching interval for user {UserId}: {IntervalMinutes} minutes", userId, intervalMinutes);
    }

    public async Task DisableBatchingAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var preferences = await GetUserPreferencesAsync(userId, cancellationToken);

        foreach (var preference in preferences)
        {
            preference.DisableBatching();
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogInformation("Disabled batching for user {UserId}", userId);
    }

    public async Task EnableNotificationTypeAsync(
        Guid userId,
        NotificationType type,
        NotificationChannel channels = NotificationChannel.InApp,
        CancellationToken cancellationToken = default)
    {
        var preference = await GetPreferenceAsync(userId, type, cancellationToken);
        if (preference != null)
        {
            preference.Enable();
            preference.UpdateChannels(channels);
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogDebug("Enabled notification type {Type} for user {UserId}", type, userId);
    }

    public async Task DisableNotificationTypeAsync(Guid userId, NotificationType type, CancellationToken cancellationToken = default)
    {
        var preference = await GetPreferenceAsync(userId, type, cancellationToken);
        if (preference != null)
        {
            preference.Disable();
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogDebug("Disabled notification type {Type} for user {UserId}", type, userId);
    }

    public async Task AddChannelAsync(Guid userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken = default)
    {
        var preference = await GetPreferenceAsync(userId, type, cancellationToken);
        if (preference != null)
        {
            preference.AddChannel(channel);
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogDebug("Added channel {Channel} for user {UserId} and type {Type}", channel, userId, type);
    }

    public async Task RemoveChannelAsync(Guid userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken = default)
    {
        var preference = await GetPreferenceAsync(userId, type, cancellationToken);
        if (preference != null)
        {
            preference.RemoveChannel(channel);
            await _preferenceRepository.UpdateAsync(preference, cancellationToken);
        }

        _logger.LogDebug("Removed channel {Channel} for user {UserId} and type {Type}", channel, userId, type);
    }

    public async Task CreateDefaultPreferencesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _preferenceRepository.CreateDefaultPreferencesAsync(userId, cancellationToken);
        _logger.LogInformation("Created default notification preferences for user {UserId}", userId);
    }

    public async Task ResetToDefaultsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Delete existing preferences
        await _preferenceRepository.DeleteByUserIdAsync(userId, cancellationToken);
        
        // Create new default preferences
        await CreateDefaultPreferencesAsync(userId, cancellationToken);
        
        _logger.LogInformation("Reset notification preferences to defaults for user {UserId}", userId);
    }

    public async Task<bool> ShouldReceiveNotificationAsync(
        Guid userId,
        NotificationType type,
        NotificationPriority priority,
        NotificationChannel channel,
        CancellationToken cancellationToken = default)
    {
        // Emergency notifications always go through
        if (priority == NotificationPriority.Emergency)
        {
            return true;
        }

        var preference = await _preferenceRepository.GetByUserAndTypeAsync(userId, type, cancellationToken);
        
        // If no preference exists, use default behavior (allow normal and above)
        if (preference == null)
        {
            return priority >= NotificationPriority.Normal;
        }

        return preference.ShouldReceiveNotification(priority, channel);
    }

    public async Task<NotificationChannel> GetEffectiveChannelsAsync(
        Guid userId,
        NotificationType type,
        NotificationPriority priority,
        CancellationToken cancellationToken = default)
    {
        // Emergency notifications use all channels
        if (priority == NotificationPriority.Emergency)
        {
            return NotificationChannel.All;
        }

        var preference = await _preferenceRepository.GetByUserAndTypeAsync(userId, type, cancellationToken);
        
        // If no preference exists, use default (InApp only)
        if (preference == null)
        {
            return NotificationChannel.InApp;
        }

        if (!preference.ShouldReceiveNotification(priority, NotificationChannel.InApp))
        {
            return NotificationChannel.None;
        }

        return preference.EnabledChannels;
    }

    public async Task<Dictionary<string, object>> ExportPreferencesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var preferences = await GetUserPreferencesAsync(userId, cancellationToken);
        
        var export = new Dictionary<string, object>
        {
            ["UserId"] = userId,
            ["ExportedAt"] = DateTime.UtcNow,
            ["Preferences"] = preferences.Select(p => new
            {
                Type = p.NotificationType.ToString(),
                EnabledChannels = p.EnabledChannels.ToString(),
                IsEnabled = p.IsEnabled,
                MinimumPriority = p.MinimumPriority.ToString(),
                QuietHoursStart = p.QuietHoursStart?.ToString(),
                QuietHoursEnd = p.QuietHoursEnd?.ToString(),
                RespectQuietHours = p.RespectQuietHours,
                BatchingIntervalMinutes = p.BatchingIntervalMinutes
            }).ToList()
        };

        return export;
    }

    public async Task ImportPreferencesAsync(Guid userId, Dictionary<string, object> preferences, CancellationToken cancellationToken = default)
    {
        // This is a simplified implementation - in a real scenario, you'd want more robust validation
        if (preferences.TryGetValue("Preferences", out var preferencesObj) && preferencesObj is IEnumerable<object> preferencesList)
        {
            foreach (var prefObj in preferencesList)
            {
                if (prefObj is Dictionary<string, object> prefDict)
                {
                    if (Enum.TryParse<NotificationType>(prefDict["Type"]?.ToString(), out var type) &&
                        Enum.TryParse<NotificationChannel>(prefDict["EnabledChannels"]?.ToString(), out var channels) &&
                        bool.TryParse(prefDict["IsEnabled"]?.ToString(), out var isEnabled) &&
                        Enum.TryParse<NotificationPriority>(prefDict["MinimumPriority"]?.ToString(), out var minPriority))
                    {
                        await UpdatePreferenceAsync(userId, type, channels, isEnabled, minPriority, cancellationToken);
                    }
                }
            }
        }

        _logger.LogInformation("Imported notification preferences for user {UserId}", userId);
    }
}