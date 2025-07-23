using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service for managing notification templates.
/// </summary>
public interface INotificationTemplateService
{
    /// <summary>
    /// Creates a new notification template.
    /// </summary>
    Task<NotificationTemplate> CreateTemplateAsync(
        string name,
        string description,
        string titleTemplate,
        string messageTemplate,
        NotificationType type,
        Guid createdBy,
        NotificationPriority defaultPriority = NotificationPriority.Normal,
        NotificationChannel defaultChannels = NotificationChannel.InApp,
        bool isPersistent = true,
        bool isDismissible = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing notification template.
    /// </summary>
    Task<NotificationTemplate> UpdateTemplateAsync(
        Guid templateId,
        string name,
        string description,
        string titleTemplate,
        string messageTemplate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a notification template.
    /// </summary>
    Task DeleteTemplateAsync(Guid templateId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a notification template by ID.
    /// </summary>
    Task<NotificationTemplate?> GetTemplateAsync(Guid templateId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a notification template by name.
    /// </summary>
    Task<NotificationTemplate?> GetTemplateByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active notification templates.
    /// </summary>
    Task<IEnumerable<NotificationTemplate>> GetActiveTemplatesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notification templates by type.
    /// </summary>
    Task<IEnumerable<NotificationTemplate>> GetTemplatesByTypeAsync(NotificationType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates a notification template.
    /// </summary>
    Task ActivateTemplateAsync(Guid templateId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deactivates a notification template.
    /// </summary>
    Task DeactivateTemplateAsync(Guid templateId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates template syntax and parameters.
    /// </summary>
    Task<bool> ValidateTemplateAsync(string titleTemplate, string messageTemplate, Dictionary<string, object> sampleParameters, CancellationToken cancellationToken = default);

    /// <summary>
    /// Previews a template with sample parameters.
    /// </summary>
    Task<(string title, string message)> PreviewTemplateAsync(string titleTemplate, string messageTemplate, Dictionary<string, object> parameters, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates default system templates.
    /// </summary>
    Task CreateDefaultTemplatesAsync(Guid createdBy, CancellationToken cancellationToken = default);
}