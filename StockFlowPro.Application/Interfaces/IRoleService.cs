using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;
/// <summary>
/// Service interface for role management operations.
/// </summary>
public interface IRoleService
{
    /// <summary>
    /// Gets all roles.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<RoleDto>> GetAllRolesAsync(bool activeOnly = true);

    /// <summary>
    /// Gets role options for dropdowns.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<RoleOptionDto>> GetRoleOptionsAsync();

    /// <summary>
    /// Gets a role by its ID.
    /// </summary>
        System.Threading.Tasks.Task<RoleDto?> GetRoleByIdAsync(Guid id);

    /// <summary>
    /// Creates a new role.
    /// </summary>
        System.Threading.Tasks.Task<RoleDto> CreateRoleAsync(CreateRoleDto createRoleDto);

    /// <summary>
    /// Updates an existing role.
    /// </summary>
        System.Threading.Tasks.Task<RoleDto> UpdateRoleAsync(Guid id, UpdateRoleDto updateRoleDto);

    /// <summary>
    /// Deletes a role.
    /// </summary>
    Task DeleteRoleAsync(Guid id);

    /// <summary>
    /// Gets available permissions for role assignment.
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<object>> GetAvailablePermissionsAsync();

    /// <summary>
    /// Updates role permissions.
    /// </summary>
    Task UpdateRolePermissionsAsync(Guid roleId, List<Guid> permissionIds);
}