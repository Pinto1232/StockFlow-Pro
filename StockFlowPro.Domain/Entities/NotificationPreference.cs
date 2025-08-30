using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents user preferences for receiving notifications.
/// </summary>
public class NotificationPreference : IEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public NotificationType NotificationType { get; private set; }
    public NotificationChannel EnabledChannels { get; private set; }
    public bool IsEnabled { get; private set; }
    public NotificationPriority MinimumPriority { get; private set; }
    public TimeSpan? QuietHoursStart { get; private set; }
    public TimeSpan? QuietHoursEnd { get; private set; }
    public bool RespectQuietHours { get; private set; }
    public int? BatchingIntervalMinutes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation property
    public virtual User? User { get; private set; }

    private NotificationPreference() { }

    public NotificationPreference(
        Guid userId,
        NotificationType notificationType,
        NotificationChannel enabledChannels = NotificationChannel.InApp,
        bool isEnabled = true,
        NotificationPriority minimumPriority = NotificationPriority.Low)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        NotificationType = notificationType;
        EnabledChannels = enabledChannels;
        IsEnabled = isEnabled;
        MinimumPriority = minimumPriority;
        RespectQuietHours = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateChannels(NotificationChannel channels)
    {
        EnabledChannels = channels;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Enable()
    {
        IsEnabled = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMinimumPriority(NotificationPriority priority)
    {
        MinimumPriority = priority;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetQuietHours(TimeSpan start, TimeSpan end)
    {
        QuietHoursStart = start;
        QuietHoursEnd = end;
        RespectQuietHours = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DisableQuietHours()
    {
        RespectQuietHours = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBatching(int intervalMinutes)
    {
        BatchingIntervalMinutes = intervalMinutes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DisableBatching()
    {
        BatchingIntervalMinutes = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddChannel(NotificationChannel channel)
    {
        EnabledChannels |= channel;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveChannel(NotificationChannel channel)
    {
        EnabledChannels &= ~channel;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool HasChannel(NotificationChannel channel)
    {
        return (EnabledChannels & channel) == channel;
    }

    public bool IsInQuietHours()
    {
        if (!RespectQuietHours || !QuietHoursStart.HasValue || !QuietHoursEnd.HasValue)
        {
            return false;
        }

        var now = DateTime.Now.TimeOfDay;
        var start = QuietHoursStart.Value;
        var end = QuietHoursEnd.Value;

        // Handle quiet hours that span midnight
        if (start > end)
        {
            return now >= start || now <= end;
        }

        return now >= start && now <= end;
    }

    public bool ShouldReceiveNotification(NotificationPriority priority, NotificationChannel channel)
    {
        if (!IsEnabled)
        {
            return false;
        }

        if (priority < MinimumPriority)
        {
            return false;
        }

        if (!HasChannel(channel))
        {
            return false;
        }

        // Emergency notifications bypass quiet hours
        if (priority == NotificationPriority.Emergency)
        {
            return true;
        }

        if (IsInQuietHours() && priority < NotificationPriority.Critical)
        {
            return false;
        }

        return true;
    }
}