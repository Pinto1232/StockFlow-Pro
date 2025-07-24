using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service interface for managing role permissions
/// </summary>
public interface IRolePermissionService
{
    /// <summary>
    /// Gets all role permissions
    /// </summary>
    Task<IEnumerable<RolePermission>> GetAllRolePermissionsAsync();

    /// <summary>
    /// Gets role permissions for a specific role
    /// </summary>
    Task<IEnumerable<RolePermission>> GetRolePermissionsAsync(Guid roleId);

    /// <summary>
    /// Gets permissions for a specific role
    /// </summary>
    Task<IEnumerable<Permission>> GetPermissionsForRoleAsync(Guid roleId);

    /// <summary>
    /// Gets user permissions based on their role
    /// </summary>
    Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId);

    /// <summary>
    /// Grants a permission to a role
    /// </summary>
    Task<RolePermission> GrantPermissionToRoleAsync(Guid roleId, Guid permissionId, Guid grantedBy);

    /// <summary>
    /// Revokes a permission from a role
    /// </summary>
    Task RevokePermissionFromRoleAsync(Guid roleId, Guid permissionId);

    /// <summary>
    /// Updates all permissions for a role (bulk operation)
    /// </summary>
    Task UpdateRolePermissionsAsync(Guid roleId, IEnumerable<Guid> permissionIds, Guid updatedBy);

    /// <summary>
    /// Checks if a user has a specific permission
    /// </summary>
    Task<bool> UserHasPermissionAsync(Guid userId, string permissionName);

    /// <summary>
    /// Checks if a role has a specific permission
    /// </summary>
    Task<bool> RoleHasPermissionAsync(Guid roleId, string permissionName);
}