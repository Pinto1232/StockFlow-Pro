using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service interface for managing permissions
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// Gets all permissions in the system
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();

    /// <summary>
    /// Gets permissions grouped by category
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<PermissionCategory>> GetPermissionsByCategoryAsync();

    /// <summary>
    /// Gets a permission by ID
    /// </summary>
        System.Threading.Tasks.Task<PermissionDto?> GetPermissionByIdAsync(Guid id);

    /// <summary>
    /// Gets a permission by name
    /// </summary>
        System.Threading.Tasks.Task<PermissionDto?> GetPermissionByNameAsync(string name);

    /// <summary>
    /// Creates a new permission
    /// </summary>
        System.Threading.Tasks.Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto createPermissionDto);

    /// <summary>
    /// Updates an existing permission
    /// </summary>
        System.Threading.Tasks.Task<PermissionDto> UpdatePermissionAsync(Guid id, UpdatePermissionDto updatePermissionDto);

    /// <summary>
    /// Deletes a permission
    /// </summary>
    Task DeletePermissionAsync(Guid id);

    /// <summary>
    /// Activates a permission
    /// </summary>
    Task ActivatePermissionAsync(Guid id);

    /// <summary>
    /// Deactivates a permission
    /// </summary>
    Task DeactivatePermissionAsync(Guid id);

    /// <summary>
    /// Gets user permissions
    /// </summary>
        System.Threading.Tasks.Task<UserPermissionsDto> GetUserPermissionsAsync(Guid userId);

    /// <summary>
    /// Gets role permissions
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<RolePermissionDto>> GetRolePermissionsAsync(Guid? roleId = null);

    /// <summary>
    /// Grants permission to role
    /// </summary>
        System.Threading.Tasks.Task<RolePermissionDto> GrantPermissionToRoleAsync(CreateRolePermissionDto createRolePermissionDto);

    /// <summary>
    /// Revokes permission from role
    /// </summary>
    Task RevokePermissionFromRoleAsync(Guid roleId, Guid permissionId);
}