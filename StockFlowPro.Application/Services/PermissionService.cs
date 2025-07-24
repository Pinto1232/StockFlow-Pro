using AutoMapper;
using Microsoft.Extensions.Logging;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service for managing permissions
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<PermissionService> _logger;

    public PermissionService(
        IPermissionRepository permissionRepository,
        IRoleRepository roleRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<PermissionService> logger)
    {
        _permissionRepository = permissionRepository;
        _roleRepository = roleRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        try
        {
            var permissions = await _permissionRepository.GetActivePermissionsAsync();
            return _mapper.Map<IEnumerable<PermissionDto>>(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all permissions");
            throw;
        }
    }

    public async Task<IEnumerable<PermissionCategory>> GetPermissionsByCategoryAsync()
    {
        try
        {
            var permissions = await _permissionRepository.GetActivePermissionsAsync();
            var permissionDtos = _mapper.Map<IEnumerable<PermissionDto>>(permissions);
            
            return permissionDtos
                .GroupBy(p => p.Category)
                .Select(g => new PermissionCategory
                {
                    Category = g.Key,
                    Permissions = g.OrderBy(p => p.DisplayName).ToList()
                })
                .OrderBy(c => c.Category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permissions by category");
            throw;
        }
    }

    public async Task<PermissionDto?> GetPermissionByIdAsync(Guid id)
    {
        try
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            return permission != null ? _mapper.Map<PermissionDto>(permission) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permission by ID: {PermissionId}", id);
            throw;
        }
    }

    public async Task<PermissionDto?> GetPermissionByNameAsync(string name)
    {
        try
        {
            var permission = await _permissionRepository.GetByNameAsync(name);
            return permission != null ? _mapper.Map<PermissionDto>(permission) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permission by name: {PermissionName}", name);
            throw;
        }
    }

    public async Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto createPermissionDto)
    {
        try
        {
            // Check if permission with same name already exists
            var existingPermission = await _permissionRepository.GetByNameAsync(createPermissionDto.Name);
            if (existingPermission != null)
            {
                throw new InvalidOperationException($"Permission with name '{createPermissionDto.Name}' already exists");
            }

            var permission = new Permission(
                createPermissionDto.Name,
                createPermissionDto.DisplayName,
                createPermissionDto.Description,
                createPermissionDto.Category);
            
            var createdPermission = await _permissionRepository.CreateAsync(permission);

            _logger.LogInformation("Created new permission: {PermissionName} ({PermissionId})", 
                createPermissionDto.Name, createdPermission.Id);
            
            return _mapper.Map<PermissionDto>(createdPermission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating permission: {PermissionName}", createPermissionDto.Name);
            throw;
        }
    }

    public async Task<PermissionDto> UpdatePermissionAsync(Guid id, UpdatePermissionDto updatePermissionDto)
    {
        try
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            if (permission == null)
            {
                throw new ArgumentException($"Permission with ID {id} not found");
            }

            permission.Update(updatePermissionDto.DisplayName, updatePermissionDto.Description, updatePermissionDto.Category);
            
            var updatedPermission = await _permissionRepository.UpdateAsync(permission);

            _logger.LogInformation("Updated permission: {PermissionName} ({PermissionId})", permission.Name, id);
            
            return _mapper.Map<PermissionDto>(updatedPermission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating permission: {PermissionId}", id);
            throw;
        }
    }

    public async Task DeletePermissionAsync(Guid id)
    {
        try
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            if (permission == null)
            {
                throw new ArgumentException($"Permission with ID {id} not found");
            }

            // Check if permission is used by any roles
            var isUsed = await _permissionRepository.IsUsedByRolesAsync(id);

            if (isUsed)
            {
                throw new InvalidOperationException("Cannot delete permission that is assigned to roles");
            }

            await _permissionRepository.DeleteAsync(id);

            _logger.LogInformation("Deleted permission: {PermissionName} ({PermissionId})", permission.Name, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting permission: {PermissionId}", id);
            throw;
        }
    }

    public async Task ActivatePermissionAsync(Guid id)
    {
        try
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            if (permission == null)
            {
                throw new ArgumentException($"Permission with ID {id} not found");
            }

            await _permissionRepository.ActivateAsync(id);

            _logger.LogInformation("Activated permission: {PermissionName} ({PermissionId})", permission.Name, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating permission: {PermissionId}", id);
            throw;
        }
    }

    public async Task DeactivatePermissionAsync(Guid id)
    {
        try
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            if (permission == null)
            {
                throw new ArgumentException($"Permission with ID {id} not found");
            }

            await _permissionRepository.DeactivateAsync(id);

            _logger.LogInformation("Deactivated permission: {PermissionName} ({PermissionId})", permission.Name, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating permission: {PermissionId}", id);
            throw;
        }
    }

    public async Task<UserPermissionsDto> GetUserPermissionsAsync(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException($"User with ID {userId} not found");
            }

            // Get user roles and their permissions
            var userRoles = await _roleRepository.GetUserRolesAsync(userId);
            var roleNames = userRoles.Select(r => r.Name).ToList();

            // Get all permissions from user's roles
            var permissions = new HashSet<string>();
            var detailedPermissions = new List<PermissionDto>();

            foreach (var role in userRoles)
            {
                var rolePermissions = await _permissionRepository.GetRolePermissionsAsync(role.Id);
                foreach (var permission in rolePermissions)
                {
                    permissions.Add(permission.Name);
                    if (!detailedPermissions.Any(p => p.Id == permission.Id))
                    {
                        detailedPermissions.Add(_mapper.Map<PermissionDto>(permission));
                    }
                }
            }

            return new UserPermissionsDto
            {
                UserId = userId,
                UserName = $"{user.FirstName} {user.LastName}",
                UserEmail = user.Email,
                Roles = roleNames,
                Permissions = permissions.ToList(),
                DetailedPermissions = detailedPermissions.OrderBy(p => p.Category).ThenBy(p => p.DisplayName).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user permissions for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<RolePermissionDto>> GetRolePermissionsAsync(Guid? roleId = null)
    {
        try
        {
            var rolePermissions = await _permissionRepository.GetRolePermissionMappingsAsync(roleId);
            return _mapper.Map<IEnumerable<RolePermissionDto>>(rolePermissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role permissions for role: {RoleId}", roleId);
            throw;
        }
    }

    public async Task<RolePermissionDto> GrantPermissionToRoleAsync(CreateRolePermissionDto createRolePermissionDto)
    {
        try
        {
            // Verify role exists
            var role = await _roleRepository.GetByIdAsync(createRolePermissionDto.RoleId);
            if (role == null)
            {
                throw new ArgumentException($"Role with ID {createRolePermissionDto.RoleId} not found");
            }

            // Verify permission exists
            var permission = await _permissionRepository.GetByIdAsync(createRolePermissionDto.PermissionId);
            if (permission == null)
            {
                throw new ArgumentException($"Permission with ID {createRolePermissionDto.PermissionId} not found");
            }

            // Check if permission is already granted to role
            var existingMapping = await _permissionRepository.GetRolePermissionAsync(
                createRolePermissionDto.RoleId, createRolePermissionDto.PermissionId);
            
            if (existingMapping != null)
            {
                throw new InvalidOperationException($"Permission '{permission.Name}' is already granted to role '{role.Name}'");
            }

            // Grant permission to role
            await _permissionRepository.GrantPermissionToRoleAsync(createRolePermissionDto.RoleId, createRolePermissionDto.PermissionId);

            _logger.LogInformation("Granted permission '{PermissionName}' to role '{RoleName}'", 
                permission.Name, role.Name);

            return new RolePermissionDto
            {
                RoleId = createRolePermissionDto.RoleId,
                PermissionId = createRolePermissionDto.PermissionId,
                RoleName = role.Name,
                PermissionName = permission.Name,
                PermissionDisplayName = permission.DisplayName,
                GrantedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error granting permission to role: {RoleId}, {PermissionId}", 
                createRolePermissionDto.RoleId, createRolePermissionDto.PermissionId);
            throw;
        }
    }

    public async Task RevokePermissionFromRoleAsync(Guid roleId, Guid permissionId)
    {
        try
        {
            // Verify role exists
            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null)
            {
                throw new ArgumentException($"Role with ID {roleId} not found");
            }

            // Verify permission exists
            var permission = await _permissionRepository.GetByIdAsync(permissionId);
            if (permission == null)
            {
                throw new ArgumentException($"Permission with ID {permissionId} not found");
            }

            // Check if permission is granted to role
            var existingMapping = await _permissionRepository.GetRolePermissionAsync(roleId, permissionId);
            if (existingMapping == null)
            {
                throw new InvalidOperationException($"Permission '{permission.Name}' is not granted to role '{role.Name}'");
            }

            // Revoke permission from role
            await _permissionRepository.RevokePermissionFromRoleAsync(roleId, permissionId);

            _logger.LogInformation("Revoked permission '{PermissionName}' from role '{RoleName}'", 
                permission.Name, role.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking permission from role: {RoleId}, {PermissionId}", 
                roleId, permissionId);
            throw;
        }
    }
}