using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Web.Extensions;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// API controller for managing role upgrade requests
/// </summary>
[ApiController]
[Route("api/role-upgrade-requests")]
[Authorize]
public class RoleUpgradeRequestController : ControllerBase
{
    private readonly IRoleUpgradeRequestService _roleUpgradeRequestService;
    private readonly ILogger<RoleUpgradeRequestController> _logger;

    public RoleUpgradeRequestController(
        IRoleUpgradeRequestService roleUpgradeRequestService,
        ILogger<RoleUpgradeRequestController> logger)
    {
        _roleUpgradeRequestService = roleUpgradeRequestService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new role upgrade request
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "User,Manager")]
    public async Task<ActionResult<RoleUpgradeRequestDto>> CreateRequest([FromBody] CreateRoleUpgradeRequestDto createDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user authentication");
            }

            // Validate that user is not trying to request Admin role unless they're already a Manager
            var currentUserRole = User.GetUserRole();
            if (createDto.RequestedRole == UserRole.Admin && currentUserRole != UserRole.Manager)
            {
                return BadRequest("Only Managers can request Admin privileges. Please contact your system administrator.");
            }

            var request = await _roleUpgradeRequestService.CreateRequestAsync(userId, createDto);
            
            _logger.LogInformation("Role upgrade request created by user {UserId} for role {RequestedRole}", 
                userId, createDto.RequestedRole);

            return CreatedAtAction(nameof(GetRequestById), new { id = request.Id }, request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role upgrade request");
            return StatusCode(500, "An error occurred while creating the role upgrade request");
        }
    }

    /// <summary>
    /// Gets all role upgrade requests (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<RoleUpgradeRequestDto>>> GetAllRequests(
        [FromQuery] RoleUpgradeRequestStatus? status = null,
        [FromQuery] UserRole? requestedRole = null)
    {
        try
        {
            var requests = await _roleUpgradeRequestService.GetAllRequestsAsync(status, requestedRole);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade requests");
            return StatusCode(500, "An error occurred while retrieving role upgrade requests");
        }
    }

    /// <summary>
    /// Gets role upgrade requests for the current user
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<IEnumerable<RoleUpgradeRequestDto>>> GetMyRequests()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user authentication");
            }

            var requests = await _roleUpgradeRequestService.GetUserRequestsAsync(userId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user's role upgrade requests");
            return StatusCode(500, "An error occurred while retrieving your role upgrade requests");
        }
    }

    /// <summary>
    /// Gets a specific role upgrade request by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoleUpgradeRequestDto>> GetRequestById(Guid id)
    {
        try
        {
            var request = await _roleUpgradeRequestService.GetRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound($"Role upgrade request with ID {id} not found");
            }

            // Check permissions - users can only see their own requests unless they're Admin
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.GetUserRole();
            
            if (currentUserRole != UserRole.Admin && 
                (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId) || request.UserId != userId))
            {
                return Forbid("You can only view your own role upgrade requests");
            }

            return Ok(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade request {RequestId}", id);
            return StatusCode(500, "An error occurred while retrieving the role upgrade request");
        }
    }

    /// <summary>
    /// Reviews a role upgrade request (approve or reject) - Admin only
    /// </summary>
    [HttpPost("{id:guid}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoleUpgradeRequestDto>> ReviewRequest(Guid id, [FromBody] ReviewRoleUpgradeRequestDto reviewDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var reviewerId))
            {
                return BadRequest("Invalid user authentication");
            }

            reviewDto.RequestId = id;
            var request = await _roleUpgradeRequestService.ReviewRequestAsync(reviewerId, reviewDto);
            
            _logger.LogInformation("Role upgrade request {RequestId} reviewed by {ReviewerId} - {Action}", 
                id, reviewerId, reviewDto.Approve ? "Approved" : "Rejected");

            return Ok(request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reviewing role upgrade request {RequestId}", id);
            return StatusCode(500, "An error occurred while reviewing the role upgrade request");
        }
    }

    /// <summary>
    /// Cancels a pending role upgrade request
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<RoleUpgradeRequestDto>> CancelRequest(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user authentication");
            }

            var request = await _roleUpgradeRequestService.CancelRequestAsync(id, userId);
            
            _logger.LogInformation("Role upgrade request {RequestId} cancelled by user {UserId}", id, userId);

            return Ok(request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling role upgrade request {RequestId}", id);
            return StatusCode(500, "An error occurred while cancelling the role upgrade request");
        }
    }

    /// <summary>
    /// Updates the priority of a role upgrade request - Admin only
    /// </summary>
    [HttpPatch("{id:guid}/priority")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoleUpgradeRequestDto>> UpdateRequestPriority(Guid id, [FromBody] int newPriority)
    {
        try
        {
            if (newPriority < 1 || newPriority > 5)
            {
                return BadRequest("Priority must be between 1 and 5");
            }

            var request = await _roleUpgradeRequestService.UpdateRequestPriorityAsync(id, newPriority);
            
            _logger.LogInformation("Role upgrade request {RequestId} priority updated to {Priority}", id, newPriority);

            return Ok(request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating priority for role upgrade request {RequestId}", id);
            return StatusCode(500, "An error occurred while updating the request priority");
        }
    }

    /// <summary>
    /// Gets statistics about role upgrade requests - Admin only
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoleUpgradeRequestStatsDto>> GetStatistics()
    {
        try
        {
            var stats = await _roleUpgradeRequestService.GetRequestStatisticsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade request statistics");
            return StatusCode(500, "An error occurred while retrieving statistics");
        }
    }

    /// <summary>
    /// Gets requests requiring attention (high priority or old requests) - Admin only
    /// </summary>
    [HttpGet("attention-required")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<RoleUpgradeRequestDto>>> GetRequestsRequiringAttention()
    {
        try
        {
            var requests = await _roleUpgradeRequestService.GetRequestsRequiringAttentionAsync();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade requests requiring attention");
            return StatusCode(500, "An error occurred while retrieving requests requiring attention");
        }
    }

    /// <summary>
    /// Checks if the current user can request a specific role
    /// </summary>
    [HttpGet("can-request/{role}")]
    public async Task<ActionResult<bool>> CanRequestRole(UserRole role)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user authentication");
            }

            var canRequest = await _roleUpgradeRequestService.CanUserRequestRoleAsync(userId, role);
            return Ok(canRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user can request role {Role}", role);
            return StatusCode(500, "An error occurred while checking role request eligibility");
        }
    }

    /// <summary>
    /// Gets available roles that the current user can request
    /// </summary>
    [HttpGet("available-roles")]
    public async Task<ActionResult<object[]>> GetAvailableRoles()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user authentication");
            }

            var currentUserRole = User.GetUserRole();
            if (!currentUserRole.HasValue)
            {
                return BadRequest("Unable to determine current user role");
            }

            var availableRoles = new List<object>();

            // Users can request Manager role
            if (currentUserRole.Value == UserRole.User)
            {
                var canRequestManager = await _roleUpgradeRequestService.CanUserRequestRoleAsync(userId, UserRole.Manager);
                if (canRequestManager)
                {
                    availableRoles.Add(new
                    {
                        Role = UserRole.Manager,
                        DisplayName = "Manager",
                        Description = "Elevated privileges including product and invoice management",
                        RequiresApproval = true,
                        ApprovalMessage = "Manager role requests require approval from a system administrator."
                    });
                }
            }

            // Managers can request Admin role
            if (currentUserRole.Value == UserRole.Manager)
            {
                var canRequestAdmin = await _roleUpgradeRequestService.CanUserRequestRoleAsync(userId, UserRole.Admin);
                if (canRequestAdmin)
                {
                    availableRoles.Add(new
                    {
                        Role = UserRole.Admin,
                        DisplayName = "Administrator",
                        Description = "Full system access including user management and system settings",
                        RequiresApproval = true,
                        ApprovalMessage = "Administrator role requests require approval from an existing system administrator."
                    });
                }
            }

            return Ok(availableRoles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving available roles for user");
            return StatusCode(500, "An error occurred while retrieving available roles");
        }
    }
}