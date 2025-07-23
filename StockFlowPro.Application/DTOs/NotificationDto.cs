using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs;

/// <summary>
/// Data transfer object for notifications.
/// </summary>
public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; }
    public NotificationStatus Status { get; set; }
    public NotificationChannel Channels { get; set; }
    public Guid? RecipientId { get; set; }
    public string? RecipientName { get; set; }
    public Guid? SenderId { get; set; }
    public string? SenderName { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public string? ActionUrl { get; set; }
    public string? TemplateId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int DeliveryAttempts { get; set; }
    public string? LastError { get; set; }
    public bool IsPersistent { get; set; }
    public bool IsDismissible { get; set; }
    public bool IsExpired { get; set; }
    public bool CanRetry { get; set; }
}

/// <summary>
/// Data transfer object for creating notifications.
/// </summary>
public class CreateNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public NotificationChannel Channels { get; set; } = NotificationChannel.InApp;
    public Guid? RecipientId { get; set; }
    public Guid? SenderId { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public string? ActionUrl { get; set; }
    public bool IsPersistent { get; set; } = true;
    public bool IsDismissible { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// Data transfer object for template-based notifications.
/// </summary>
public class CreateTemplateNotificationDto
{
    public string TemplateName { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
    public Guid? RecipientId { get; set; }
    public Guid? SenderId { get; set; }
    public NotificationPriority? Priority { get; set; }
    public NotificationChannel? Channels { get; set; }
}

/// <summary>
/// Data transfer object for bulk notifications.
/// </summary>
public class BulkNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public NotificationChannel Channels { get; set; } = NotificationChannel.InApp;
    public IEnumerable<Guid> RecipientIds { get; set; } = new List<Guid>();
    public Guid? SenderId { get; set; }
    public bool IsPersistent { get; set; } = true;
}

/// <summary>
/// Data transfer object for role-based notifications.
/// </summary>
public class RoleNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public NotificationChannel Channels { get; set; } = NotificationChannel.InApp;
    public IEnumerable<UserRole> Roles { get; set; } = new List<UserRole>();
    public Guid? SenderId { get; set; }
}

/// <summary>
/// Data transfer object for notification statistics.
/// </summary>
public class NotificationStatsDto
{
    public int TotalNotifications { get; set; }
    public int UnreadNotifications { get; set; }
    public int ReadNotifications { get; set; }
    public Dictionary<NotificationType, int> NotificationsByType { get; set; } = new();
    public Dictionary<NotificationPriority, int> NotificationsByPriority { get; set; } = new();
    public Dictionary<NotificationStatus, int> NotificationsByStatus { get; set; } = new();
    public DateTime? LastNotificationDate { get; set; }
    public DateTime? LastReadDate { get; set; }
}