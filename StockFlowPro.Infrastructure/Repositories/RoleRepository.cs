using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Role entity operations.
/// </summary>
public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        return await _context.Roles
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Role>> GetActiveRolesAsync()
    {
        return await _context.Roles
            .Where(r => r.IsActive)
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<Role?> GetByIdAsync(Guid id)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Role?> GetByNameAsync(string name)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => r.Name.ToLower() == name.ToLower());
    }

    public async Task<Role> CreateAsync(Role role)
    {
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task<Role> UpdateAsync(Role role)
    {
        _context.Roles.Update(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task DeleteAsync(Guid id)
    {
        var role = await GetByIdAsync(id);
        if (role != null)
        {
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string name)
    {
        return await _context.Roles
            .AnyAsync(r => r.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<Role>> GetOrderedByPriorityAsync()
    {
        return await _context.Roles
            .Where(r => r.IsActive)
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Role>> GetUserRolesAsync(Guid userId)
    {
        // For now, we'll get the user's role from the User entity
        // In a more complex system, you might have a UserRoles table
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return Enumerable.Empty<Role>();
        }

        // Convert the user's role enum to a role entity
        var roleName = user.Role.ToString();
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == roleName);

        return role != null ? new[] { role } : Enumerable.Empty<Role>();
    }
}