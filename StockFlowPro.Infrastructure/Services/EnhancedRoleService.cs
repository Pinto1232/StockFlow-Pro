using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Infrastructure.Services;

/// <summary>
/// Enhanced role service leveraging SQL Server capabilities
/// </summary>
public class EnhancedRoleService : IEnhancedRoleService
{
    private readonly ApplicationDbContext _context;

    public EnhancedRoleService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Create a new custom role with specific permissions
    /// </summary>
    public async Task<Role> CreateCustomRoleAsync(string name, string displayName, 
        string description, List<string> permissionNames, int priority = 0)
    {
        // Check if role already exists
        var existingRole = await _context.Set<Role>()
            .FirstOrDefaultAsync(r => r.Name.ToLower() == name.ToLower());
        
        if (existingRole != null)
            {throw new InvalidOperationException($"Role '{name}' already exists");}

        // Get permissions
        var permissions = await _context.Set<Permission>()
            .Where(p => permissionNames.Contains(p.Name))
            .ToListAsync();

        // Create role
        var role = new Role(name, displayName, description, permissionNames, priority);
        _context.Set<Role>().Add(role);

        // Create role-permission relationships
        foreach (var permission in permissions)
        {
            var rolePermission = new RolePermission(role.Id, permission.Id, Guid.Empty); // TODO: Get current user ID
            _context.Set<RolePermission>().Add(rolePermission);
        }

        await _context.SaveChangesAsync();
        return role;
    }

    /// <summary>
    /// Get all permissions for a specific role including inherited permissions
    /// </summary>
    public async Task<List<Permission>> GetRolePermissionsAsync(Guid roleId)
    {
        return await _context.Set<RolePermission>()
            .Where(rp => rp.RoleId == roleId)
            .Include(rp => rp.Permission)
            .Select(rp => rp.Permission)
            .ToListAsync();
    }

    /// <summary>
    /// Check if a user has a specific permission (SQL Server optimized query)
    /// </summary>
    public async Task<bool> UserHasPermissionAsync(Guid userId, string permissionName)
    {
        // Use LINQ instead of raw SQL for better compatibility
        var hasPermission = await _context.Set<User>()
            .Where(u => u.Id == userId && u.IsActive)
            .Join(_context.Set<Role>(), u => u.RoleId, r => r.Id, (u, r) => r)
            .Where(r => r.IsActive)
            .Join(_context.Set<RolePermission>(), r => r.Id, rp => rp.RoleId, (r, rp) => rp)
            .Join(_context.Set<Permission>(), rp => rp.PermissionId, p => p.Id, (rp, p) => p)
            .Where(p => p.Name == permissionName && p.IsActive)
            .AnyAsync();

        return hasPermission;
    }

    /// <summary>
    /// Get role hierarchy with permission inheritance
    /// </summary>
    public async Task<List<Role>> GetRoleHierarchyAsync()
    {
        return await _context.Set<Role>()
            .Where(r => r.IsActive)
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.Name)
            .Include(r => r.Users)
            .ToListAsync();
    }

    /// <summary>
    /// Bulk assign permissions to role (SQL Server optimized)
    /// </summary>
    public async Task BulkAssignPermissionsAsync(Guid roleId, List<Guid> permissionIds, Guid assignedBy)
    {
        // Remove existing permissions
        var existingRolePermissions = await _context.Set<RolePermission>()
            .Where(rp => rp.RoleId == roleId)
            .ToListAsync();
        
        _context.Set<RolePermission>().RemoveRange(existingRolePermissions);

        // Add new permissions
        var newRolePermissions = permissionIds.Select(permissionId => 
            new RolePermission(roleId, permissionId, assignedBy)).ToList();
        
        await _context.Set<RolePermission>().AddRangeAsync(newRolePermissions);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Get users by role with pagination (SQL Server optimized)
    /// </summary>
    public async Task<(List<User> Users, int TotalCount)> GetUsersByRoleAsync(
        Guid roleId, int page = 1, int pageSize = 50)
    {
        var query = _context.Set<User>()
            .Where(u => u.RoleId == roleId && u.IsActive)
            .Include(u => u.DatabaseRole);

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    /// <summary>
    /// Generate role usage analytics
    /// </summary>
    public async Task<Dictionary<string, object>> GetRoleAnalyticsAsync()
    {
        var roleStats = await _context.Set<Role>()
            .Where(r => r.IsActive)
            .Select(r => new
            {
                RoleName = r.Name,
                UserCount = r.Users.Count(u => u.IsActive),
                PermissionCount = _context.Set<RolePermission>()
                    .Count(rp => rp.RoleId == r.Id),
                LastUsed = r.Users
                    .Where(u => u.IsActive && u.LastLoginAt.HasValue)
                    .Any() ? r.Users
                    .Where(u => u.IsActive && u.LastLoginAt.HasValue)
                    .Max(u => u.LastLoginAt) : (DateTime?)null
            })
            .ToListAsync();

        var lastActivity = roleStats.Where(r => r.LastUsed.HasValue).Any() 
            ? roleStats.Where(r => r.LastUsed.HasValue).Max(r => r.LastUsed)
            : (DateTime?)null;

        return new Dictionary<string, object>
        {
            ["TotalRoles"] = roleStats.Count,
            ["TotalActiveUsers"] = roleStats.Sum(r => r.UserCount),
            ["RoleDistribution"] = roleStats.ToDictionary(r => r.RoleName, r => r.UserCount),
            ["PermissionDistribution"] = roleStats.ToDictionary(r => r.RoleName, r => r.PermissionCount),
            ["LastActivity"] = lastActivity ?? DateTime.MinValue
        };
    }
}