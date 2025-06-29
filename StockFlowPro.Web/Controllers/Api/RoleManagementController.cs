using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/role-management")]
public class RoleManagementController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ILogger<RoleManagementController> _logger;

    public RoleManagementController(IRoleService roleService, ILogger<RoleManagementController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all roles in the system.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Roles = "Admin")]
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
    /// Gets role options for dropdowns and selection lists.
    /// </summary>
    [HttpGet("roles/options")]
    [AllowAnonymous] // Allow for user creation forms
    public async Task<ActionResult<IEnumerable<RoleOptionDto>>> GetRoleOptions()
    {
        try
        {
            var roleOptions = await _roleService.GetRoleOptionsAsync();
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
    /// Creates a new role.
    /// </summary>
    [HttpPost("roles")]
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
    [HttpPut("roles/{id:guid}")]
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
    /// Deletes a role.
    /// </summary>
    [HttpDelete("roles/{id:guid}")]
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
    /// Gets available permissions that can be assigned to roles.
    /// </summary>
    [HttpGet("permissions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<object>>> GetAvailablePermissions()
    {
        try
        {
            var permissions = await _roleService.GetAvailablePermissionsAsync();
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve available permissions");
            return StatusCode(500, new { message = "Failed to retrieve permissions", error = ex.Message });
        }
    }
}