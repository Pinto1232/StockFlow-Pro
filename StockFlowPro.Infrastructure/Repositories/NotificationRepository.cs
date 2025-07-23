using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for managing notifications.
/// </summary>
public class NotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    #region Base Repository Methods

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Notification entity, CancellationToken cancellationToken = default)
    {
        await _context.Notifications.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Notification entity, CancellationToken cancellationToken = default)
    {
        _context.Notifications.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Notification entity, CancellationToken cancellationToken = default)
    {
        _context.Notifications.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Notification-Specific Methods

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Sender)
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Sender)
            .Where(n => n.RecipientId == userId && n.Status != NotificationStatus.Read)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetByStatusAsync(NotificationStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .Where(n => n.Status == status)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetByTypeAsync(NotificationType type, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .Where(n => n.Type == type)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetByPriorityAsync(NotificationPriority priority, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .Where(n => n.Priority == priority)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Notifications
            .Where(n => n.ExpiresAt.HasValue && n.ExpiresAt.Value <= now && n.Status != NotificationStatus.Expired)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetRetryableFailedAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Notifications
            .Where(n => n.Status == NotificationStatus.Failed && 
                       n.DeliveryAttempts < 3 && 
                       (!n.ExpiresAt.HasValue || n.ExpiresAt.Value > now))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .Where(n => n.CreatedAt >= startDate && n.CreatedAt <= endDate)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetByRelatedEntityAsync(Guid entityId, string entityType, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Include(n => n.Recipient)
            .Include(n => n.Sender)
            .Where(n => n.RelatedEntityId == entityId && n.RelatedEntityType == entityType)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .CountAsync(n => n.RecipientId == userId && n.Status != NotificationStatus.Read, cancellationToken);
    }

    public async Task MarkAsReadAsync(IEnumerable<Guid> notificationIds, CancellationToken cancellationToken = default)
    {
        var notifications = await _context.Notifications
            .Where(n => notificationIds.Contains(n.Id))
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var notifications = await _context.Notifications
            .Where(n => n.RecipientId == userId && n.Status != NotificationStatus.Read)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteOldNotificationsAsync(DateTime cutoffDate, CancellationToken cancellationToken = default)
    {
        var oldNotifications = await _context.Notifications
            .Where(n => n.CreatedAt < cutoffDate && 
                       (n.Status == NotificationStatus.Read || 
                        n.Status == NotificationStatus.Expired || 
                        n.Status == NotificationStatus.Failed))
            .ToListAsync(cancellationToken);

        _context.Notifications.RemoveRange(oldNotifications);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Dictionary<NotificationType, int>> GetNotificationStatsAsync(Guid userId, DateTime? fromDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications.Where(n => n.RecipientId == userId);

        if (fromDate.HasValue)
        {
            query = query.Where(n => n.CreatedAt >= fromDate.Value);
        }

        var stats = await query
            .GroupBy(n => n.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count, cancellationToken);

        return stats;
    }

    #endregion
}