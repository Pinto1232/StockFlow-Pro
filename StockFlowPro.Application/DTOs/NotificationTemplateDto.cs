using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs;

/// <summary>
/// Data transfer object for notification templates.
/// </summary>
public class NotificationTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TitleTemplate { get; set; } = string.Empty;
    public string MessageTemplate { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority DefaultPriority { get; set; }
    public NotificationChannel DefaultChannels { get; set; }
    public bool IsActive { get; set; }
    public bool IsPersistent { get; set; }
    public bool IsDismissible { get; set; }
    public string? DefaultActionUrl { get; set; }
    public int? ExpirationHours { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public string? CreatorName { get; set; }
}

/// <summary>
/// Data transfer object for creating notification templates.
/// </summary>
public class CreateNotificationTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TitleTemplate { get; set; } = string.Empty;
    public string MessageTemplate { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority DefaultPriority { get; set; } = NotificationPriority.Normal;
    public NotificationChannel DefaultChannels { get; set; } = NotificationChannel.InApp;
    public bool IsPersistent { get; set; } = true;
    public bool IsDismissible { get; set; } = true;
    public string? DefaultActionUrl { get; set; }
    public int? ExpirationHours { get; set; }
}

/// <summary>
/// Data transfer object for updating notification templates.
/// </summary>
public class UpdateNotificationTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TitleTemplate { get; set; } = string.Empty;
    public string MessageTemplate { get; set; } = string.Empty;
    public NotificationPriority DefaultPriority { get; set; }
    public NotificationChannel DefaultChannels { get; set; }
    public bool IsPersistent { get; set; }
    public bool IsDismissible { get; set; }
    public string? DefaultActionUrl { get; set; }
    public int? ExpirationHours { get; set; }
}

/// <summary>
/// Data transfer object for template preview.
/// </summary>
public class TemplatePreviewDto
{
    public string TitleTemplate { get; set; } = string.Empty;
    public string MessageTemplate { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
}

/// <summary>
/// Data transfer object for template preview result.
/// </summary>
public class TemplatePreviewResultDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public IEnumerable<string> Errors { get; set; } = new List<string>();
    public IEnumerable<string> MissingParameters { get; set; } = new List<string>();
}