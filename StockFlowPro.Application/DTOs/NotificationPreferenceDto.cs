using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs;

/// <summary>
/// Data transfer object for notification preferences.
/// </summary>
public class NotificationPreferenceDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public NotificationType NotificationType { get; set; }
    public string NotificationTypeName { get; set; } = string.Empty;
    public NotificationChannel EnabledChannels { get; set; }
    public IEnumerable<string> EnabledChannelNames { get; set; } = new List<string>();
    public bool IsEnabled { get; set; }
    public NotificationPriority MinimumPriority { get; set; }
    public string MinimumPriorityName { get; set; } = string.Empty;
    public TimeSpan? QuietHoursStart { get; set; }
    public TimeSpan? QuietHoursEnd { get; set; }
    public bool RespectQuietHours { get; set; }
    public int? BatchingIntervalMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Data transfer object for updating notification preferences.
/// </summary>
public class UpdateNotificationPreferenceDto
{
    public NotificationType NotificationType { get; set; }
    public NotificationChannel EnabledChannels { get; set; }
    public bool IsEnabled { get; set; } = true;
    public NotificationPriority MinimumPriority { get; set; } = NotificationPriority.Low;
    public TimeSpan? QuietHoursStart { get; set; }
    public TimeSpan? QuietHoursEnd { get; set; }
    public bool RespectQuietHours { get; set; } = true;
    public int? BatchingIntervalMinutes { get; set; }
}

/// <summary>
/// Data transfer object for bulk preference updates.
/// </summary>
public class BulkPreferenceUpdateDto
{
    public IEnumerable<UpdateNotificationPreferenceDto> Preferences { get; set; } = new List<UpdateNotificationPreferenceDto>();
    public TimeSpan? GlobalQuietHoursStart { get; set; }
    public TimeSpan? GlobalQuietHoursEnd { get; set; }
    public bool? GlobalRespectQuietHours { get; set; }
    public int? GlobalBatchingIntervalMinutes { get; set; }
}

/// <summary>
/// Data transfer object for notification preference summary.
/// </summary>
public class NotificationPreferenceSummaryDto
{
    public Guid UserId { get; set; }
    public int TotalPreferences { get; set; }
    public int EnabledPreferences { get; set; }
    public int DisabledPreferences { get; set; }
    public bool HasQuietHours { get; set; }
    public bool HasBatching { get; set; }
    public IEnumerable<NotificationType> EnabledTypes { get; set; } = new List<NotificationType>();
    public IEnumerable<NotificationType> DisabledTypes { get; set; } = new List<NotificationType>();
    public NotificationChannel MostUsedChannels { get; set; }
    public DateTime? LastUpdated { get; set; }
}