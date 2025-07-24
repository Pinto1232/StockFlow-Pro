using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service implementation for role management operations.
/// </summary>
public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissionRepository _permissionRepository;

    public RoleService(IRoleRepository roleRepository, IPermissionRepository permissionRepository)
    {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
    }

    public async Task<IEnumerable<RoleDto>> GetAllRolesAsync(bool activeOnly = true)
    {
        var roles = activeOnly 
            ? await _roleRepository.GetActiveRolesAsync()
            : await _roleRepository.GetAllAsync();

        return roles.Select(MapToRoleDto);
    }

    public async Task<IEnumerable<RoleOptionDto>> GetRoleOptionsAsync()
    {
        var roles = await _roleRepository.GetOrderedByPriorityAsync();
        return roles.Select(MapToRoleOptionDto);
    }

    public async Task<RoleDto?> GetRoleByIdAsync(Guid id)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        return role != null ? MapToRoleDto(role) : null;
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleDto createRoleDto)
    {
        // Check if role name already exists
        if (await _roleRepository.ExistsAsync(createRoleDto.Name))
        {
            throw new InvalidOperationException("A role with this name already exists");
        }

        var role = new Role(
            createRoleDto.Name.Trim(),
            string.IsNullOrWhiteSpace(createRoleDto.DisplayName) 
                ? createRoleDto.Name.Trim() 
                : createRoleDto.DisplayName.Trim(),
            createRoleDto.Description?.Trim() ?? string.Empty,
            createRoleDto.Permissions ?? new List<string>(),
            createRoleDto.Priority,
            false // New roles are not system roles
        );

        var createdRole = await _roleRepository.CreateAsync(role);
        return MapToRoleDto(createdRole);
    }

    public async Task<RoleDto> UpdateRoleAsync(Guid id, UpdateRoleDto updateRoleDto)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        if (role == null)
        {
            throw new ArgumentException($"Role with ID {id} not found");
        }

        if (role.IsSystemRole)
        {
            throw new InvalidOperationException("System roles cannot be modified");
        }

        // Update role properties
        role.UpdateDisplayName(string.IsNullOrWhiteSpace(updateRoleDto.DisplayName) 
            ? role.Name 
            : updateRoleDto.DisplayName.Trim());
        role.UpdateDescription(updateRoleDto.Description?.Trim() ?? string.Empty);
        role.UpdatePermissions(updateRoleDto.Permissions ?? new List<string>());
        role.UpdatePriority(updateRoleDto.Priority);

        if (updateRoleDto.IsActive)
        {
            role.Activate();
        }
        else
        {
            role.Deactivate();
        }

        var updatedRole = await _roleRepository.UpdateAsync(role);
        return MapToRoleDto(updatedRole);
    }

    public async Task DeleteRoleAsync(Guid id)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        if (role == null)
        {
            throw new ArgumentException($"Role with ID {id} not found");
        }

        if (role.IsSystemRole)
        {
            throw new InvalidOperationException("System roles cannot be deleted");
        }

        await _roleRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<object>> GetAvailablePermissionsAsync()
    {
        // Return available permissions grouped by category
        var permissions = new[]
        {
            new { Category = "Users", Permissions = new[] { "Users.ViewAll", "Users.ViewTeam", "Users.Create", "Users.Update", "Users.Delete" } },
            new { Category = "Products", Permissions = new[] { "Products.View", "Products.Create", "Products.Update", "Products.Delete", "Products.Manage" } },
            new { Category = "Inventory", Permissions = new[] { "Inventory.View", "Inventory.Update", "Inventory.Manage", "Inventory.Reports" } },
            new { Category = "Reports", Permissions = new[] { "Reports.ViewBasic", "Reports.ViewAdvanced", "Reports.ViewAll", "Reports.Create", "Reports.Export" } },
            new { Category = "System", Permissions = new[] { "System.ViewAdminPanel", "System.ManageSettings", "System.ViewLogs", "System.Backup" } },
            new { Category = "Profile", Permissions = new[] { "Profile.View", "Profile.Update", "Profile.ChangePassword" } }
        };

        return await Task.FromResult(permissions);
    }

    private static RoleDto MapToRoleDto(Role role)
    {
        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            DisplayName = role.DisplayName,
            Description = role.Description,
            Permissions = role.Permissions,
            IsActive = role.IsActive,
            IsSystemRole = role.IsSystemRole,
            Priority = role.Priority,
            CreatedAt = role.CreatedAt,
            UpdatedAt = role.UpdatedAt,
            UserCount = 0 // This would be calculated from user assignments
        };
    }

    private static RoleOptionDto MapToRoleOptionDto(Role role)
    {
        var iconClass = role.Name.ToLower() switch
        {
            "admin" => "fas fa-user-shield",
            "manager" => "fas fa-user-tie",
            "user" => "fas fa-user",
            "supervisor" => "fas fa-user-check",
            "analyst" => "fas fa-chart-line",
            "operator" => "fas fa-cogs",
            _ => "fas fa-user-tag"
        };

        var keyPermissions = role.Permissions.Take(3).ToList();

        return new RoleOptionDto
        {
            Id = role.Id,
            Name = role.Name,
            DisplayName = role.DisplayName,
            Description = role.Description,
            IconClass = iconClass,
            Priority = role.Priority,
            KeyPermissions = keyPermissions
        };
    }

    public async Task UpdateRolePermissionsAsync(Guid roleId, List<Guid> permissionIds)
    {
        var role = await _roleRepository.GetByIdAsync(roleId);
        if (role == null)
        {
            throw new ArgumentException($"Role with ID {roleId} not found");
        }

        if (role.IsSystemRole)
        {
            throw new InvalidOperationException("System roles cannot be modified");
        }

        // Get current role permissions
        var currentPermissions = await _permissionRepository.GetRolePermissionsAsync(roleId);
        var currentPermissionIds = currentPermissions.Select(p => p.Id).ToList();

        // Determine permissions to add and remove
        var permissionsToAdd = permissionIds.Except(currentPermissionIds).ToList();
        var permissionsToRemove = currentPermissionIds.Except(permissionIds).ToList();

        // Remove permissions
        foreach (var permissionId in permissionsToRemove)
        {
            await _permissionRepository.RevokePermissionFromRoleAsync(roleId, permissionId);
        }

        // Add permissions
        foreach (var permissionId in permissionsToAdd)
        {
            await _permissionRepository.GrantPermissionToRoleAsync(roleId, permissionId);
        }
    }
}