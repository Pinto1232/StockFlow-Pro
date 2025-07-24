using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for Permission entity operations.
/// </summary>
public interface IPermissionRepository
{
    /// <summary>
    /// Gets all permissions from the database.
    /// </summary>
    Task<IEnumerable<Permission>> GetAllAsync();

    /// <summary>
    /// Gets active permissions only.
    /// </summary>
    Task<IEnumerable<Permission>> GetActivePermissionsAsync();

    /// <summary>
    /// Gets permissions grouped by category.
    /// </summary>
    Task<IEnumerable<IGrouping<string, Permission>>> GetPermissionsByCategoryAsync();

    /// <summary>
    /// Gets a permission by its unique identifier.
    /// </summary>
    Task<Permission?> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets a permission by its name.
    /// </summary>
    Task<Permission?> GetByNameAsync(string name);

    /// <summary>
    /// Creates a new permission in the database.
    /// </summary>
    Task<Permission> CreateAsync(Permission permission);

    /// <summary>
    /// Updates an existing permission in the database.
    /// </summary>
    Task<Permission> UpdateAsync(Permission permission);

    /// <summary>
    /// Deletes a permission from the database.
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Checks if a permission with the given name already exists.
    /// </summary>
    Task<bool> ExistsAsync(string name);

    /// <summary>
    /// Checks if a permission is used by any roles.
    /// </summary>
    Task<bool> IsUsedByRolesAsync(Guid permissionId);

    /// <summary>
    /// Activates a permission.
    /// </summary>
    Task ActivateAsync(Guid id);

    /// <summary>
    /// Deactivates a permission.
    /// </summary>
    Task DeactivateAsync(Guid id);

    /// <summary>
    /// Gets permissions for a specific role.
    /// </summary>
    Task<IEnumerable<Permission>> GetRolePermissionsAsync(Guid roleId);

    /// <summary>
    /// Gets role permission mappings.
    /// </summary>
    Task<IEnumerable<object>> GetRolePermissionMappingsAsync(Guid? roleId = null);

    /// <summary>
    /// Gets a specific role permission mapping.
    /// </summary>
    Task<object?> GetRolePermissionAsync(Guid roleId, Guid permissionId);

    /// <summary>
    /// Grants a permission to a role.
    /// </summary>
    Task GrantPermissionToRoleAsync(Guid roleId, Guid permissionId);

    /// <summary>
    /// Revokes a permission from a role.
    /// </summary>
    Task RevokePermissionFromRoleAsync(Guid roleId, Guid permissionId);
}