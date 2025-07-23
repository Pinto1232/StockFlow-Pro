using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for managing notification templates.
/// </summary>
public class NotificationTemplateRepository : INotificationTemplateRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationTemplateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    #region Base Repository Methods

    public async Task<NotificationTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .Include(nt => nt.Creator)
            .FirstOrDefaultAsync(nt => nt.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .Include(nt => nt.Creator)
            .OrderBy(nt => nt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(NotificationTemplate entity, CancellationToken cancellationToken = default)
    {
        await _context.NotificationTemplates.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(NotificationTemplate entity, CancellationToken cancellationToken = default)
    {
        _context.NotificationTemplates.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(NotificationTemplate entity, CancellationToken cancellationToken = default)
    {
        _context.NotificationTemplates.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Template-Specific Methods

    public async Task<IEnumerable<NotificationTemplate>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .Include(nt => nt.Creator)
            .Where(nt => nt.IsActive)
            .OrderBy(nt => nt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetByTypeAsync(NotificationType type, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .Include(nt => nt.Creator)
            .Where(nt => nt.Type == type)
            .OrderBy(nt => nt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<NotificationTemplate?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .Include(nt => nt.Creator)
            .FirstOrDefaultAsync(nt => nt.Name == name, cancellationToken);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetByCreatorAsync(Guid creatorId, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .Include(nt => nt.Creator)
            .Where(nt => nt.CreatedBy == creatorId)
            .OrderBy(nt => nt.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.NotificationTemplates.Where(nt => nt.Name == name);

        if (excludeId.HasValue)
        {
            query = query.Where(nt => nt.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    #endregion
}