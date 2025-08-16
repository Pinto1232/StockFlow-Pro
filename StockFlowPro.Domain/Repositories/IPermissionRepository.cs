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
    System.Threading.Tasks.Task<IEnumerable<Permission>> GetAllAsync();

    /// <summary>
    /// Gets active permissions only.
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<Permission>> GetActivePermissionsAsync();

    /// <summary>
    /// Gets permissions grouped by category.
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<IGrouping<string, Permission>>> GetPermissionsByCategoryAsync();

    /// <summary>
    /// Gets a permission by its unique identifier.
    /// </summary>
    System.Threading.Tasks.Task<Permission?> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets a permission by its name.
    /// </summary>
    System.Threading.Tasks.Task<Permission?> GetByNameAsync(string name);

    /// <summary>
    /// Creates a new permission in the database.
    /// </summary>
    System.Threading.Tasks.Task<Permission> CreateAsync(Permission permission);

    /// <summary>
    /// Updates an existing permission in the database.
    /// </summary>
    System.Threading.Tasks.Task<Permission> UpdateAsync(Permission permission);

    /// <summary>
    /// Deletes a permission from the database.
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(Guid id);

    /// <summary>
    /// Checks if a permission with the given name already exists.
    /// </summary>
    System.Threading.Tasks.Task<bool> ExistsAsync(string name);

    /// <summary>
    /// Checks if a permission is used by any roles.
    /// </summary>
    System.Threading.Tasks.Task<bool> IsUsedByRolesAsync(Guid permissionId);

    /// <summary>
    /// Activates a permission.
    /// </summary>
    System.Threading.Tasks.Task ActivateAsync(Guid id);

    /// <summary>
    /// Deactivates a permission.
    /// </summary>
    System.Threading.Tasks.Task DeactivateAsync(Guid id);

    /// <summary>
    /// Gets permissions for a specific role.
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<Permission>> GetRolePermissionsAsync(Guid roleId);

    /// <summary>
    /// Gets role permission mappings.
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<object>> GetRolePermissionMappingsAsync(Guid? roleId = null);

    /// <summary>
    /// Gets a specific role permission mapping.
    /// </summary>
    System.Threading.Tasks.Task<object?> GetRolePermissionAsync(Guid roleId, Guid permissionId);

    /// <summary>
    /// Grants a permission to a role.
    /// </summary>
    System.Threading.Tasks.Task GrantPermissionToRoleAsync(Guid roleId, Guid permissionId);

    /// <summary>
    /// Revokes a permission from a role.
    /// </summary>
    System.Threading.Tasks.Task RevokePermissionFromRoleAsync(Guid roleId, Guid permissionId);
}