using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Permission entity operations.
/// </summary>
public class PermissionRepository : IPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public PermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Permission>> GetAllAsync()
    {
        return await _context.Permissions
            .OrderBy(p => p.Category)
            .ThenBy(p => p.DisplayName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Permission>> GetActivePermissionsAsync()
    {
        return await _context.Permissions
            .Where(p => p.IsActive)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.DisplayName)
            .ToListAsync();
    }

    public async Task<IEnumerable<IGrouping<string, Permission>>> GetPermissionsByCategoryAsync()
    {
        return await _context.Permissions
            .Where(p => p.IsActive)
            .GroupBy(p => p.Category)
            .OrderBy(g => g.Key)
            .ToListAsync();
    }

    public async Task<Permission?> GetByIdAsync(Guid id)
    {
        return await _context.Permissions
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Permission?> GetByNameAsync(string name)
    {
        return await _context.Permissions
            .FirstOrDefaultAsync(p => p.Name.ToLower() == name.ToLower());
    }

    public async Task<Permission> CreateAsync(Permission permission)
    {
        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<Permission> UpdateAsync(Permission permission)
    {
        _context.Permissions.Update(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task DeleteAsync(Guid id)
    {
        var permission = await GetByIdAsync(id);
        if (permission != null)
        {
            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string name)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Name.ToLower() == name.ToLower());
    }

    public async Task<bool> IsUsedByRolesAsync(Guid permissionId)
    {
        return await _context.RolePermissions
            .AnyAsync(rp => rp.PermissionId == permissionId);
    }

    public async Task ActivateAsync(Guid id)
    {
        var permission = await GetByIdAsync(id);
        if (permission != null)
        {
            permission.Activate();
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeactivateAsync(Guid id)
    {
        var permission = await GetByIdAsync(id);
        if (permission != null)
        {
            permission.Deactivate();
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(Guid roleId)
    {
        return await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Include(rp => rp.Permission)
            .Select(rp => rp.Permission)
            .Where(p => p.IsActive)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.DisplayName)
            .ToListAsync();
    }

    public async Task<IEnumerable<object>> GetRolePermissionMappingsAsync(Guid? roleId = null)
    {
        var query = _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .AsQueryable();

        if (roleId.HasValue)
        {
            query = query.Where(rp => rp.RoleId == roleId.Value);
        }

        return await query
            .Select(rp => new
            {
                RoleId = rp.RoleId,
                PermissionId = rp.PermissionId,
                RoleName = rp.Role.Name,
                PermissionName = rp.Permission.Name,
                PermissionDisplayName = rp.Permission.DisplayName,
                GrantedAt = rp.GrantedAt
            })
            .OrderBy(rp => rp.RoleName)
            .ThenBy(rp => rp.PermissionDisplayName)
            .ToListAsync();
    }

    public async Task<object?> GetRolePermissionAsync(Guid roleId, Guid permissionId)
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == roleId && rp.PermissionId == permissionId)
            .Select(rp => new
            {
                RoleId = rp.RoleId,
                PermissionId = rp.PermissionId,
                RoleName = rp.Role.Name,
                PermissionName = rp.Permission.Name,
                PermissionDisplayName = rp.Permission.DisplayName,
                GrantedAt = rp.GrantedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task GrantPermissionToRoleAsync(Guid roleId, Guid permissionId)
    {
        // Check if the permission is already granted
        var existingRolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (existingRolePermission == null)
        {
            var rolePermission = new RolePermission(roleId, permissionId, Guid.Empty); // TODO: Get current user ID
            _context.RolePermissions.Add(rolePermission);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RevokePermissionFromRoleAsync(Guid roleId, Guid permissionId)
    {
        var rolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (rolePermission != null)
        {
            _context.RolePermissions.Remove(rolePermission);
            await _context.SaveChangesAsync();
        }
    }
}