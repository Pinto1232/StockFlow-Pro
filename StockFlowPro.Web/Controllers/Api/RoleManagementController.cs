using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/role-management")]
public class RoleManagementController : ControllerBase
{
    private readonly ILogger<RoleManagementController> _logger;
    
    // In-memory storage for demonstration - in production, this would use a database service
    private static readonly List<Role> _roles = new()
    {
        new Role(
            "Admin",
            "Administrator",
            "Full system access and user management capabilities",
            new List<string> { "Users.ViewAll", "Users.Create", "Users.Update", "Users.Delete", "System.ViewAdminPanel", "Reports.ViewAll" },
            100,
            true
        ),
        new Role(
            "Manager",
            "Manager",
            "Elevated privileges including reporting access and team management",
            new List<string> { "Users.ViewTeam", "Products.Manage", "Reports.ViewAdvanced", "Inventory.Manage" },
            50,
            true
        ),
        new Role(
            "User",
            "User",
            "Standard user role with basic system access and product viewing",
            new List<string> { "Products.View", "Reports.ViewBasic", "Profile.Update" },
            10,
            true
        )
    };

    public RoleManagementController(ILogger<RoleManagementController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets all roles in the system.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Roles = "Admin")]
    public ActionResult<IEnumerable<RoleDto>> GetAllRoles([FromQuery] bool activeOnly = true)
    {
        try
        {
            var roles = _roles.Where(r => !activeOnly || r.IsActive)
                             .OrderByDescending(r => r.Priority)
                             .ThenBy(r => r.Name)
                             .Select(MapToRoleDto)
                             .ToList();

            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve roles");
            return StatusCode(500, new { message = "Failed to retrieve roles", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets role options for dropdowns and selection lists.
    /// </summary>
    [HttpGet("roles/options")]
    [AllowAnonymous] // Allow for user creation forms
    public ActionResult<IEnumerable<RoleOptionDto>> GetRoleOptions()
    {
        try
        {
            var roleOptions = _roles.Where(r => r.IsActive)
                                   .OrderByDescending(r => r.Priority)
                                   .Select(MapToRoleOptionDto)
                                   .ToList();

            return Ok(roleOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role options");
            return StatusCode(500, new { message = "Failed to retrieve role options", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets a specific role by ID.
    /// </summary>
    [HttpGet("roles/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public ActionResult<RoleDto> GetRoleById(Guid id)
    {
        try
        {
            var role = _roles.FirstOrDefault(r => r.Id == id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            return Ok(MapToRoleDto(role));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to retrieve role", error = ex.Message });
        }
    }

    /// <summary>
    /// Creates a new role.
    /// </summary>
    [HttpPost("roles")]
    [Authorize(Roles = "Admin")]
    public ActionResult<RoleDto> CreateRole([FromBody] CreateRoleDto createRoleDto)
    {
        try
        {
            // Validate role name uniqueness
            if (_roles.Any(r => r.Name.Equals(createRoleDto.Name, StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest(new { message = "A role with this name already exists" });
            }

            var newRole = new Role(
                createRoleDto.Name.Trim(),
                string.IsNullOrWhiteSpace(createRoleDto.DisplayName) 
                    ? createRoleDto.Name.Trim() 
                    : createRoleDto.DisplayName.Trim(),
                createRoleDto.Description?.Trim() ?? string.Empty,
                createRoleDto.Permissions ?? new List<string>(),
                createRoleDto.Priority,
                false
            );

            _roles.Add(newRole);

            _logger.LogInformation("Created new role: {RoleName} with ID: {RoleId}", newRole.Name, newRole.Id);

            return CreatedAtAction(
                nameof(GetRoleById),
                new { id = newRole.Id },
                MapToRoleDto(newRole));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create role");
            return StatusCode(500, new { message = "Failed to create role", error = ex.Message });
        }
    }

    /// <summary>
    /// Updates an existing role.
    /// </summary>
    [HttpPut("roles/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public ActionResult<RoleDto> UpdateRole(Guid id, [FromBody] UpdateRoleDto updateRoleDto)
    {
        try
        {
            var role = _roles.FirstOrDefault(r => r.Id == id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            if (role.IsSystemRole)
            {
                return BadRequest(new { message = "System roles cannot be modified" });
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

            _logger.LogInformation("Updated role: {RoleName} with ID: {RoleId}", role.Name, role.Id);

            return Ok(MapToRoleDto(role));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to update role", error = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a role.
    /// </summary>
    [HttpDelete("roles/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public ActionResult DeleteRole(Guid id)
    {
        try
        {
            var role = _roles.FirstOrDefault(r => r.Id == id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            if (role.IsSystemRole)
            {
                return BadRequest(new { message = "System roles cannot be deleted" });
            }

            _roles.Remove(role);

            _logger.LogInformation("Deleted role: {RoleName} with ID: {RoleId}", role.Name, role.Id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to delete role", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets available permissions that can be assigned to roles.
    /// </summary>
    [HttpGet("permissions")]
    [Authorize(Roles = "Admin")]
    public ActionResult<IEnumerable<object>> GetAvailablePermissions()
    {
        try
        {
            var permissions = new[]
            {
                new { Category = "Users", Permissions = new[] { "Users.ViewAll", "Users.ViewTeam", "Users.Create", "Users.Update", "Users.Delete" } },
                new { Category = "Products", Permissions = new[] { "Products.View", "Products.Create", "Products.Update", "Products.Delete", "Products.Manage" } },
                new { Category = "Inventory", Permissions = new[] { "Inventory.View", "Inventory.Update", "Inventory.Manage", "Inventory.Reports" } },
                new { Category = "Reports", Permissions = new[] { "Reports.ViewBasic", "Reports.ViewAdvanced", "Reports.ViewAll", "Reports.Create", "Reports.Export" } },
                new { Category = "System", Permissions = new[] { "System.ViewAdminPanel", "System.ManageSettings", "System.ViewLogs", "System.Backup" } },
                new { Category = "Profile", Permissions = new[] { "Profile.View", "Profile.Update", "Profile.ChangePassword" } }
            };

            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve available permissions");
            return StatusCode(500, new { message = "Failed to retrieve permissions", error = ex.Message });
        }
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
            UserCount = 0 // This would be calculated from the database in a real implementation
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
}