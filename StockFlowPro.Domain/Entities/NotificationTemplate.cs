using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a template for generating consistent notifications.
/// </summary>
public class NotificationTemplate : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string TitleTemplate { get; private set; } = string.Empty;
    public string MessageTemplate { get; private set; } = string.Empty;
    public NotificationType Type { get; private set; }
    public NotificationPriority DefaultPriority { get; private set; }
    public NotificationChannel DefaultChannels { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsPersistent { get; private set; }
    public bool IsDismissible { get; private set; }
    public string? DefaultActionUrl { get; private set; }
    public int? ExpirationHours { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public Guid CreatedBy { get; private set; }

    // Navigation property
    public virtual User? Creator { get; private set; }

    private NotificationTemplate() { }

    public NotificationTemplate(
        string name,
        string description,
        string titleTemplate,
        string messageTemplate,
        NotificationType type,
        Guid createdBy,
        NotificationPriority defaultPriority = NotificationPriority.Normal,
        NotificationChannel defaultChannels = NotificationChannel.InApp,
        bool isPersistent = true,
        bool isDismissible = true)
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        TitleTemplate = titleTemplate;
        MessageTemplate = messageTemplate;
        Type = type;
        DefaultPriority = defaultPriority;
        DefaultChannels = defaultChannels;
        IsActive = true;
        IsPersistent = isPersistent;
        IsDismissible = isDismissible;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }

    public void UpdateTemplate(string name, string description, string titleTemplate, string messageTemplate)
    {
        Name = name;
        Description = description;
        TitleTemplate = titleTemplate;
        MessageTemplate = messageTemplate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDefaults(
        NotificationPriority priority,
        NotificationChannel channels,
        bool isPersistent,
        bool isDismissible)
    {
        DefaultPriority = priority;
        DefaultChannels = channels;
        IsPersistent = isPersistent;
        IsDismissible = isDismissible;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetActionUrl(string actionUrl)
    {
        DefaultActionUrl = actionUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetExpiration(int hours)
    {
        ExpirationHours = hours;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Generates a notification from this template with the provided parameters.
    /// </summary>
    public Notification GenerateNotification(
        Dictionary<string, object> parameters,
        Guid? recipientId = null,
        Guid? senderId = null,
        NotificationPriority? priority = null,
        NotificationChannel? channels = null)
    {
        var title = ReplaceTemplateParameters(TitleTemplate, parameters);
        var message = ReplaceTemplateParameters(MessageTemplate, parameters);

        var notification = new Notification(
            title,
            message,
            Type,
            recipientId,
            senderId,
            priority ?? DefaultPriority,
            channels ?? DefaultChannels,
            IsPersistent,
            IsDismissible);

        notification.SetTemplate(Id.ToString());

        if (!string.IsNullOrEmpty(DefaultActionUrl))
        {
            var actionUrl = ReplaceTemplateParameters(DefaultActionUrl, parameters);
            notification.SetActionUrl(actionUrl);
        }

        if (ExpirationHours.HasValue)
        {
            notification.SetExpiration(DateTime.UtcNow.AddHours(ExpirationHours.Value));
        }

        return notification;
    }

    private static string ReplaceTemplateParameters(string template, Dictionary<string, object> parameters)
    {
        var result = template;
        foreach (var parameter in parameters)
        {
            var placeholder = $"{{{parameter.Key}}}";
            result = result.Replace(placeholder, parameter.Value?.ToString() ?? string.Empty);
        }
        return result;
    }
}