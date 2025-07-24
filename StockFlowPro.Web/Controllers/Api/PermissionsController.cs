using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/permissions")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(IPermissionService permissionService, ILogger<PermissionsController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all permissions in the system.
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions()
    {
        try
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve permissions");
            return StatusCode(500, new { message = "Failed to retrieve permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets a specific permission by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<PermissionDto>> GetPermissionById(Guid id)
    {
        try
        {
            var permission = await _permissionService.GetPermissionByIdAsync(id);
            if (permission == null)
            {
                return NotFound($"Permission with ID {id} not found");
            }

            return Ok(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve permission {PermissionId}", id);
            return StatusCode(500, new { message = "Failed to retrieve permission", error = ex.Message });
        }
    }

    /// <summary>
    /// Creates a new permission.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PermissionDto>> CreatePermission([FromBody] CreatePermissionDto createPermissionDto)
    {
        try
        {
            var newPermission = await _permissionService.CreatePermissionAsync(createPermissionDto);

            _logger.LogInformation("Created new permission: {PermissionName} with ID: {PermissionId}", 
                newPermission.Name, newPermission.Id);

            return CreatedAtAction(
                nameof(GetPermissionById),
                new { id = newPermission.Id },
                newPermission);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create permission");
            return StatusCode(500, new { message = "Failed to create permission", error = ex.Message });
        }
    }

    /// <summary>
    /// Updates an existing permission.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PermissionDto>> UpdatePermission(Guid id, [FromBody] UpdatePermissionDto updatePermissionDto)
    {
        try
        {
            var updatedPermission = await _permissionService.UpdatePermissionAsync(id, updatePermissionDto);

            _logger.LogInformation("Updated permission: {PermissionName} with ID: {PermissionId}", 
                updatedPermission.Name, updatedPermission.Id);

            return Ok(updatedPermission);
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
            _logger.LogError(ex, "Failed to update permission {PermissionId}", id);
            return StatusCode(500, new { message = "Failed to update permission", error = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a permission.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeletePermission(Guid id)
    {
        try
        {
            await _permissionService.DeletePermissionAsync(id);

            _logger.LogInformation("Deleted permission with ID: {PermissionId}", id);

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
            _logger.LogError(ex, "Failed to delete permission {PermissionId}", id);
            return StatusCode(500, new { message = "Failed to delete permission", error = ex.Message });
        }
    }
}