using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(IRoleService roleService, ILogger<RolesController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all roles in the system.
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAllRoles([FromQuery] bool activeOnly = true)
    {
        try
        {
            var roles = await _roleService.GetAllRolesAsync(activeOnly);
            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve roles");
            return StatusCode(500, new { message = "Failed to retrieve roles", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets available roles for assignment.
    /// </summary>
    [HttpGet("available")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<RoleOptionDto>>> GetAvailableRoles()
    {
        try
        {
            var roleOptions = await _roleService.GetRoleOptionsAsync();
            return Ok(roleOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve available roles");
            return StatusCode(500, new { message = "Failed to retrieve available roles", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets a specific role by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<RoleDto>> GetRoleById(Guid id)
    {
        try
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            return Ok(role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to retrieve role", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets a role with its permissions.
    /// </summary>
    [HttpGet("{id:guid}/permissions")]
    [Authorize]
    public async Task<ActionResult<RoleDto>> GetRoleWithPermissions(Guid id)
    {
        try
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            return Ok(role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role with permissions {RoleId}", id);
            return StatusCode(500, new { message = "Failed to retrieve role with permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Creates a new role.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoleDto>> CreateRole([FromBody] CreateRoleDto createRoleDto)
    {
        try
        {
            var newRole = await _roleService.CreateRoleAsync(createRoleDto);

            _logger.LogInformation("Created new role: {RoleName} with ID: {RoleId}", newRole.Name, newRole.Id);

            return CreatedAtAction(
                nameof(GetRoleById),
                new { id = newRole.Id },
                newRole);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
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
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoleDto>> UpdateRole(Guid id, [FromBody] UpdateRoleDto updateRoleDto)
    {
        try
        {
            var updatedRole = await _roleService.UpdateRoleAsync(id, updateRoleDto);

            _logger.LogInformation("Updated role: {RoleName} with ID: {RoleId}", updatedRole.Name, updatedRole.Id);

            return Ok(updatedRole);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to update role", error = ex.Message });
        }
    }

    /// <summary>
    /// Updates role permissions.
    /// </summary>
    [HttpPut("{id:guid}/permissions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateRolePermissions(Guid id, [FromBody] UpdateRolePermissionsDto updateDto)
    {
        try
        {
            await _roleService.UpdateRolePermissionsAsync(id, updateDto.PermissionIds);

            _logger.LogInformation("Updated permissions for role with ID: {RoleId}", id);

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update role permissions {RoleId}", id);
            return StatusCode(500, new { message = "Failed to update role permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a role.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteRole(Guid id)
    {
        try
        {
            await _roleService.DeleteRoleAsync(id);

            _logger.LogInformation("Deleted role with ID: {RoleId}", id);

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to delete role", error = ex.Message });
        }
    }

    /// <summary>
    /// Activates a role.
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ActivateRole(Guid id)
    {
        try
        {
            // This would need to be implemented in the role service
            // For now, we'll use the update method with isActive = true
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            var updateDto = new UpdateRoleDto
            {
                DisplayName = role.DisplayName,
                Description = role.Description,
                IsActive = true
            };

            await _roleService.UpdateRoleAsync(id, updateDto);

            _logger.LogInformation("Activated role with ID: {RoleId}", id);

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to activate role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to activate role", error = ex.Message });
        }
    }

    /// <summary>
    /// Deactivates a role.
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeactivateRole(Guid id)
    {
        try
        {
            // This would need to be implemented in the role service
            // For now, we'll use the update method with isActive = false
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound($"Role with ID {id} not found");
            }

            var updateDto = new UpdateRoleDto
            {
                DisplayName = role.DisplayName,
                Description = role.Description,
                IsActive = false
            };

            await _roleService.UpdateRoleAsync(id, updateDto);

            _logger.LogInformation("Deactivated role with ID: {RoleId}", id);

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deactivate role {RoleId}", id);
            return StatusCode(500, new { message = "Failed to deactivate role", error = ex.Message });
        }
    }
}

// DTO for updating role permissions
public class UpdateRolePermissionsDto
{
    public List<Guid> PermissionIds { get; set; } = new();
}