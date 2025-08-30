using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Data service that uses only database data for security
/// </summary>
public class DatabaseOnlyDataService : IDataSourceService
{
    private readonly IUserService _userService;
    private readonly ILogger<DatabaseOnlyDataService> _logger;

    public DatabaseOnlyDataService(
        IUserService userService,
        ILogger<DatabaseOnlyDataService> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(bool activeOnly = false)
    {
        try
        {
            _logger.LogInformation("Retrieving users from database (activeOnly: {ActiveOnly})", activeOnly);
            var users = await _userService.GetAllAsync();
            
            if (users?.Any() == true)
            {
                var filteredUsers = activeOnly ? users.Where(u => u.IsActive) : users;
                _logger.LogInformation("Retrieved {Count} users from database", filteredUsers.Count());
                return filteredUsers;
            }

            _logger.LogWarning("No users found in database");
            return Enumerable.Empty<UserDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users from database");
            throw new InvalidOperationException("Failed to retrieve users from database", ex);
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving user {UserId} from database", id);
            var user = await _userService.GetByIdAsync(id);
            
            if (user != null)
            {
                _logger.LogInformation("Retrieved user {UserId} from database", id);
                return user;
            }

            _logger.LogWarning("User {UserId} not found in database", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId} from database", id);
            throw new InvalidOperationException($"Failed to retrieve user {id} from database", ex);
        }
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            _logger.LogInformation("Retrieving user with email {Email} from database", email);
            var user = await _userService.GetByEmailAsync(email);
            
            if (user != null)
            {
                _logger.LogInformation("Retrieved user with email {Email} from database", email);
                return user;
            }

            _logger.LogWarning("User with email {Email} not found in database", email);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user with email {Email} from database", email);
            throw new InvalidOperationException($"Failed to retrieve user with email {email} from database", ex);
        }
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        try
        {
            _logger.LogInformation("Creating user in database");
            var user = await _userService.CreateAsync(createUserDto);
            _logger.LogInformation("Created user {UserId} in database", user.Id);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user in database");
            throw new InvalidOperationException("Failed to create user in database", ex);
        }
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
    {
        try
        {
            _logger.LogInformation("Updating user {UserId} in database", id);
            var user = await _userService.UpdateAsync(id, updateUserDto);
            
            if (user != null)
            {
                _logger.LogInformation("Updated user {UserId} in database", id);
                return user;
            }

            _logger.LogWarning("User {UserId} not found in database for update", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId} in database", id);
            throw new InvalidOperationException($"Failed to update user {id} in database", ex);
        }
    }

    public Task<bool> DeleteUserAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting user {UserId} from database", id);
            // Implement delete functionality through user service if available
            // For now, we'll log that deletion is not implemented
            _logger.LogWarning("Delete operation not implemented in user service for user {UserId}", id);
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId} from database", id);
            throw new InvalidOperationException($"Failed to delete user {id} from database", ex);
        }
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm)
    {
        try
        {
            _logger.LogInformation("Searching users in database with term: {SearchTerm}", searchTerm);
            var users = await _userService.SearchAsync(searchTerm);
            
            if (users?.Any() == true)
            {
                _logger.LogInformation("Found {Count} users in database matching search term", users.Count());
                return users;
            }

            _logger.LogInformation("No users found in database for search term: {SearchTerm}", searchTerm);
            return Enumerable.Empty<UserDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users in database");
            throw new InvalidOperationException("Failed to search users in database", ex);
        }
    }

    public string GetCurrentDataSource()
    {
        return "Database Only";
    }
}
