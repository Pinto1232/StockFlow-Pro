using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Web.Services;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// Controller for secure user synchronization operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class UserSynchronizationController : ControllerBase
{
    private readonly IUserSynchronizationService _userSyncService;
    private readonly ILogger<UserSynchronizationController> _logger;

    public UserSynchronizationController(
        IUserSynchronizationService userSyncService,
        ILogger<UserSynchronizationController> logger)
    {
        _userSyncService = userSyncService;
        _logger = logger;
    }

    /// <summary>
    /// Check if a user requires synchronization
    /// </summary>
    [HttpGet("check/{userId:guid}")]
    public async Task<ActionResult<UserExistenceStatus>> CheckUserSyncStatus(Guid userId)
    {
        try
        {
            var status = await _userSyncService.CheckUserExistenceAsync(userId);
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking sync status for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Validate if a user can be synchronized
    /// </summary>
    [HttpPost("validate/{userId:guid}")]
    public async Task<ActionResult<UserSyncValidationResult>> ValidateUserSync(Guid userId)
    {
        try
        {
            var requestingUserId = GetCurrentUserId();
            if (requestingUserId == null)
            {
                return BadRequest("Invalid user authentication");
            }

            var validation = await _userSyncService.ValidateUserForSyncAsync(userId, requestingUserId.Value);
            return Ok(validation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating sync for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Securely synchronize a user to the database
    /// </summary>
    [HttpPost("sync/{userId:guid}")]
    public async Task<ActionResult> SyncUser(Guid userId, [FromBody] SyncUserRequest request)
    {
        try
        {
            var requestingUserId = GetCurrentUserId();
            if (requestingUserId == null)
            {
                return BadRequest("Invalid user authentication");
            }

            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest("Synchronization reason is required");
            }

            var syncedUser = await _userSyncService.SecureSyncUserAsync(
                userId, 
                requestingUserId.Value, 
                request.Reason);

            if (syncedUser == null)
            {
                return BadRequest("User synchronization failed. Check validation requirements.");
            }

            _logger.LogInformation("User {UserId} successfully synchronized by {RequestingUserId} for reason: {Reason}", 
                userId, requestingUserId, request.Reason);

            return Ok(new { 
                message = "User synchronized successfully", 
                user = syncedUser 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error synchronizing user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get synchronization audit logs for a user
    /// </summary>
    [HttpGet("audit/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserSyncAuditEntry>>> GetSyncAuditLogs(Guid userId)
    {
        try
        {
            var logs = await _userSyncService.GetSyncAuditLogsAsync(userId);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Synchronize current user (self-service) - with enhanced security validation
    /// </summary>
    [HttpPost("sync-self")]
    [Authorize] // Any authenticated user can sync themselves
    public async Task<ActionResult> SyncSelf([FromBody] SyncSelfRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return BadRequest("Invalid user authentication");
            }

            // SECURITY ENHANCEMENT: Additional validation for self-sync
            // Check if user exists in the system before allowing self-sync
            var userExistence = await _userSyncService.CheckUserExistenceAsync(userId.Value);
            
            if (!userExistence.ExistsInMockData)
            {
                _logger.LogWarning("Self-sync attempted by non-existent user: {UserId}", userId);
                return BadRequest("User account not found in the system. Please contact an administrator.");
            }

            if (!userExistence.RequiresSync)
            {
                _logger.LogInformation("Self-sync attempted by user {UserId} who doesn't require sync", userId);
                return BadRequest("Your account is already synchronized and doesn't require synchronization.");
            }

            var reason = string.IsNullOrWhiteSpace(request.Reason) 
                ? "Self-service synchronization" 
                : request.Reason;

            var syncedUser = await _userSyncService.SecureSyncUserAsync(
                userId.Value, 
                userId.Value, 
                reason);

            if (syncedUser == null)
            {
                return BadRequest("User synchronization failed. Your account may not meet synchronization requirements.");
            }

            _logger.LogInformation("User {UserId} successfully self-synchronized", userId);

            return Ok(new { 
                message = "Your account has been synchronized successfully", 
                user = syncedUser 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during self-synchronization for user {UserId}", GetCurrentUserId());
            return StatusCode(500, "Internal server error");
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }
}

/// <summary>
/// Request model for user synchronization
/// </summary>
public class SyncUserRequest
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Request model for self-synchronization
/// </summary>
public class SyncSelfRequest
{
    public string? Reason { get; set; }
}