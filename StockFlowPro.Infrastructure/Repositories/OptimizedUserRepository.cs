using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;
using System.Linq.Expressions;

namespace StockFlowPro.Infrastructure.Repositories;

public class OptimizedUserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public OptimizedUserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetPagedAsync(
        int page, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(User entity, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(User entity, CancellationToken cancellationToken = default)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(User entity, CancellationToken cancellationToken = default)
    {
        _context.Users.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.IsActive)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(
        string email, 
        Guid? excludeUserId = null, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking().Where(u => u.Email == email);
        
        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> SearchUsersAsync(
        string searchTerm, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await GetAllAsync(cancellationToken);
        }

        var lowerSearchTerm = searchTerm.ToLower();
        
        return await _context.Users
            .AsNoTracking()
            .Where(u => EF.Functions.Like(u.FirstName.ToLower(), $"%{lowerSearchTerm}%") ||
                       EF.Functions.Like(u.LastName.ToLower(), $"%{lowerSearchTerm}%") ||
                       EF.Functions.Like(u.Email.ToLower(), $"%{lowerSearchTerm}%"))
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> BulkUpdateActiveStatusAsync(
        Expression<Func<User, bool>> predicate,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Where(predicate)
            .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.IsActive, isActive), cancellationToken);
    }

    public async Task<int> BulkUpdateRoleAsync(
        Expression<Func<User, bool>> predicate,
        StockFlowPro.Domain.Enums.UserRole role,
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Where(predicate)
            .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.Role, role), cancellationToken);
    }

    public async Task<int> BulkDeleteAsync(
        Expression<Func<User, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Where(predicate)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users.CountAsync(cancellationToken);
    }

    public async Task<int> GetActiveCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users.CountAsync(u => u.IsActive, cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetRoleStatisticsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .GroupBy(u => u.Role)
            .Select(g => new { Role = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Role, x => x.Count, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetUsersByRoleAsync(
        StockFlowPro.Domain.Enums.UserRole role, 
        CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Role == role)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Id == id, cancellationToken);
    }
}
