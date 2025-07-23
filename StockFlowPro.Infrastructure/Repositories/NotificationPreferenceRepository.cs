using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for managing notification preferences.
/// </summary>
public class NotificationPreferenceRepository : INotificationPreferenceRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationPreferenceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    #region Base Repository Methods

    public async Task<NotificationPreference?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationPreferences
            .Include(np => np.User)
            .FirstOrDefaultAsync(np => np.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<NotificationPreference>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.NotificationPreferences
            .Include(np => np.User)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(NotificationPreference entity, CancellationToken cancellationToken = default)
    {
        await _context.NotificationPreferences.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(NotificationPreference entity, CancellationToken cancellationToken = default)
    {
        _context.NotificationPreferences.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(NotificationPreference entity, CancellationToken cancellationToken = default)
    {
        _context.NotificationPreferences.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Preference-Specific Methods

    public async Task<IEnumerable<NotificationPreference>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationPreferences
            .Where(np => np.UserId == userId)
            .OrderBy(np => np.NotificationType)
            .ToListAsync(cancellationToken);
    }

    public async Task<NotificationPreference?> GetByUserAndTypeAsync(Guid userId, NotificationType type, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationPreferences
            .Include(np => np.User)
            .FirstOrDefaultAsync(np => np.UserId == userId && np.NotificationType == type, cancellationToken);
    }

    public async Task<IEnumerable<Guid>> GetUsersWithEnabledNotificationAsync(NotificationType type, NotificationChannel channel, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationPreferences
            .Where(np => np.NotificationType == type && 
                        np.IsEnabled && 
                        (np.EnabledChannels & channel) == channel)
            .Select(np => np.UserId)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateDefaultPreferencesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var defaultPreferences = new List<NotificationPreference>();

        // Create default preferences for each notification type
        foreach (NotificationType type in Enum.GetValues<NotificationType>())
        {
            var preference = new NotificationPreference(
                userId,
                type,
                GetDefaultChannelsForType(type),
                true,
                GetDefaultMinimumPriorityForType(type));

            defaultPreferences.Add(preference);
        }

        await _context.NotificationPreferences.AddRangeAsync(defaultPreferences, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpsertPreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        var existing = await GetByUserAndTypeAsync(preference.UserId, preference.NotificationType, cancellationToken);

        if (existing != null)
        {
            existing.UpdateChannels(preference.EnabledChannels);
            if (preference.IsEnabled)
                {existing.Enable();}
            else
               { existing.Disable();}
            existing.SetMinimumPriority(preference.MinimumPriority);
            
            if (preference.QuietHoursStart.HasValue && preference.QuietHoursEnd.HasValue)
            {
                existing.SetQuietHours(preference.QuietHoursStart.Value, preference.QuietHoursEnd.Value);
            }
            
            if (preference.BatchingIntervalMinutes.HasValue)
            {
                existing.SetBatching(preference.BatchingIntervalMinutes.Value);
            }

            _context.NotificationPreferences.Update(existing);
        }
        else
        {
            await _context.NotificationPreferences.AddAsync(preference, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var preferences = await _context.NotificationPreferences
            .Where(np => np.UserId == userId)
            .ToListAsync(cancellationToken);

        _context.NotificationPreferences.RemoveRange(preferences);
        await _context.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Private Helper Methods

    private static NotificationChannel GetDefaultChannelsForType(NotificationType type)
    {
        return type switch
        {
            NotificationType.System => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Security => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.StockAlert => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Invoice => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Payment => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Account => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Subscription => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Error => NotificationChannel.InApp | NotificationChannel.Email,
            NotificationType.Warning => NotificationChannel.InApp,
            _ => NotificationChannel.InApp
        };
    }

    private static NotificationPriority GetDefaultMinimumPriorityForType(NotificationType type)
    {
        return type switch
        {
            NotificationType.System => NotificationPriority.High,
            NotificationType.Security => NotificationPriority.High,
            NotificationType.StockAlert => NotificationPriority.Normal,
            NotificationType.Invoice => NotificationPriority.Normal,
            NotificationType.Payment => NotificationPriority.High,
            NotificationType.Account => NotificationPriority.Normal,
            NotificationType.Subscription => NotificationPriority.Normal,
            NotificationType.Error => NotificationPriority.High,
            NotificationType.Warning => NotificationPriority.Normal,
            _ => NotificationPriority.Low
        };
    }

    #endregion
}