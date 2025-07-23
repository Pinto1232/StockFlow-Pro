using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for managing notification templates.
/// </summary>
public interface INotificationTemplateRepository : IRepository<NotificationTemplate>
{
    /// <summary>
    /// Gets all active notification templates.
    /// </summary>
    Task<IEnumerable<NotificationTemplate>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notification templates by type.
    /// </summary>
    Task<IEnumerable<NotificationTemplate>> GetByTypeAsync(NotificationType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a notification template by name.
    /// </summary>
    Task<NotificationTemplate?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets notification templates created by a specific user.
    /// </summary>
    Task<IEnumerable<NotificationTemplate>> GetByCreatorAsync(Guid creatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a template name already exists.
    /// </summary>
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}