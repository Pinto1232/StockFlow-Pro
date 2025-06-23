using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Web.Services;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/user-management")]
public class UserManagementController : ControllerBase
{
    private readonly IDualDataService _dualDataService;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(IDualDataService dualDataService, ILogger<UserManagementController> logger)
    {
        _dualDataService = dualDataService;
        _logger = logger;
    }

    [HttpGet("sync-status")]
    public async Task<ActionResult<DataSourceSyncStatus>> GetSyncStatus()
    {
        var status = await _dualDataService.GetSyncStatusAsync();
        return Ok(status);
    }

    [HttpPost("sync")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> SyncDataSources()
    {
        try
        {
            await _dualDataService.SyncDataSourcesAsync();
            return Ok(new { message = "Data sources synchronized successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync data sources");
            return StatusCode(500, new { message = "Failed to synchronize data sources", error = ex.Message });
        }
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        Console.WriteLine($"[USER MANAGEMENT] Getting all users from database - ActiveOnly: {activeOnly}");
        
        var users = await _dualDataService.GetAllUsersAsync(activeOnly);
        
        Console.WriteLine($"[USER MANAGEMENT] Retrieved {users.Count()} users from database");
        return Ok(users);
    }

    [HttpGet("users/{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
        Console.WriteLine($"[USER MANAGEMENT] Getting user by ID from database: {id}");
        
        var user = await _dualDataService.GetUserByIdAsync(id);
        
        if (user == null)
        {
            Console.WriteLine($"[USER MANAGEMENT] User with ID {id} not found in database");
            return NotFound($"User with ID {id} not found");
        }

        Console.WriteLine($"[USER MANAGEMENT] Retrieved user from database: {user.Email} (ID: {user.Id})");
        return Ok(user);
    }

    [HttpGet("users/by-email/{email}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
    {
        Console.WriteLine($"[USER MANAGEMENT] Getting user by email from database: {email}");
        
        var user = await _dualDataService.GetUserByEmailAsync(email);
        
        if (user == null)
        {
            Console.WriteLine($"[USER MANAGEMENT] User with email {email} not found in database");
            return NotFound($"User with email {email} not found");
        }

        Console.WriteLine($"[USER MANAGEMENT] Retrieved user from database: {user.Email} (ID: {user.Id})");
        return Ok(user);
    }

    [HttpGet("users/search")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        Console.WriteLine($"[USER MANAGEMENT] Searching users in database with term: '{searchTerm ?? string.Empty}'");
        
        var users = await _dualDataService.SearchUsersAsync(searchTerm ?? string.Empty);
        
        Console.WriteLine($"[USER MANAGEMENT] Found {users.Count()} users matching search term '{searchTerm ?? string.Empty}'");
        return Ok(users);
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            Console.WriteLine($"[USER MANAGEMENT] Creating new user in database: {createUserDto.Email}");
            
            var user = await _dualDataService.CreateUserAsync(createUserDto);
            
            Console.WriteLine($"[USER MANAGEMENT] Successfully created user in database: {user.Email} (ID: {user.Id})");
            
            return CreatedAtAction(
                nameof(GetUserById), 
                new { id = user.Id }, 
                user);
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"[USER MANAGEMENT] Failed to create user in database: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[USER MANAGEMENT] Error creating user in database: {ex.Message}");
            _logger.LogError(ex, "Failed to create user");
            return StatusCode(500, new { message = "Failed to create user", error = ex.Message });
        }
    }

    [HttpPut("users/{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            var user = await _dualDataService.UpdateUserAsync(id, updateUserDto);
            
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update user {UserId}", id);
            return StatusCode(500, new { message = "Failed to update user", error = ex.Message });
        }
    }

    [HttpDelete("users/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        try
        {
            var result = await _dualDataService.DeleteUserAsync(id);
            
            if (!result)
            {
                return NotFound($"User with ID {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete user {UserId}", id);
            return StatusCode(500, new { message = "Failed to delete user", error = ex.Message });
        }
    }

    [HttpGet("statistics")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> GetUserStatistics()
    {
        try
        {
            Console.WriteLine("[USER MANAGEMENT] Getting user statistics from database");
            
            var allUsers = await _dualDataService.GetAllUsersAsync(false);
            var activeUsers = await _dualDataService.GetAllUsersAsync(true);
            var syncStatus = await _dualDataService.GetSyncStatusAsync();

            var statistics = new
            {
                TotalUsers = allUsers.Count(),
                ActiveUsers = activeUsers.Count(),
                InactiveUsers = allUsers.Count() - activeUsers.Count(),
                UsersByRole = allUsers.GroupBy(u => u.Role).ToDictionary(g => g.Key.ToString(), g => g.Count()),
                SyncStatus = syncStatus,
                LastUpdated = DateTime.UtcNow
            };

            Console.WriteLine($"[USER MANAGEMENT] User statistics retrieved - Total: {statistics.TotalUsers}, Active: {statistics.ActiveUsers}, Inactive: {statistics.InactiveUsers}");

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[USER MANAGEMENT] Error getting user statistics from database: {ex.Message}");
            _logger.LogError(ex, "Failed to get user statistics");
            return StatusCode(500, new { message = "Failed to get user statistics", error = ex.Message });
        }
    }
}