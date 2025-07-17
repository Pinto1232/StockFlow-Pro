using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Data service that prioritizes database over mock data
/// </summary>
public class DatabaseFirstDataService : IDataSourceService
{
    private readonly IUserService _userService;
    private readonly IMockDataStorageService _mockDataService;
    private readonly ILogger<DatabaseFirstDataService> _logger;

    public DatabaseFirstDataService(
        IUserService userService,
        IMockDataStorageService mockDataService,
        ILogger<DatabaseFirstDataService> logger)
    {
        _userService = userService;
        _mockDataService = mockDataService;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(bool activeOnly = false)
    {
        try
        {
            _logger.LogInformation("Attempting to retrieve users from database");
            var users = await _userService.GetAllAsync();
            
            if (users?.Any() == true)
            {
                var filteredUsers = activeOnly ? users.Where(u => u.IsActive) : users;
                _logger.LogInformation("Retrieved {Count} users from database", filteredUsers.Count());
                return filteredUsers;
            }

            _logger.LogWarning("No users found in database, falling back to mock data");
            var mockUsers = await _mockDataService.GetUsersAsync();
            return activeOnly ? mockUsers.Where(u => u.IsActive) : mockUsers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users from database, falling back to mock data");
            var mockUsers = await _mockDataService.GetUsersAsync();
            return activeOnly ? mockUsers.Where(u => u.IsActive) : mockUsers;
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Attempting to retrieve user {UserId} from database", id);
            var user = await _userService.GetByIdAsync(id);
            
            if (user != null)
            {
                _logger.LogInformation("Retrieved user {UserId} from database", id);
                return user;
            }

            _logger.LogWarning("User {UserId} not found in database, checking mock data", id);
            return await _mockDataService.GetUserByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId} from database, falling back to mock data", id);
            return await _mockDataService.GetUserByIdAsync(id);
        }
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            _logger.LogInformation("Attempting to retrieve user with email {Email} from database", email);
            var user = await _userService.GetByEmailAsync(email);
            
            if (user != null)
            {
                _logger.LogInformation("Retrieved user with email {Email} from database", email);
                return user;
            }

            _logger.LogWarning("User with email {Email} not found in database, checking mock data", email);
            // Mock service doesn't have GetByEmail, so search through all users
            var mockUsers = await _mockDataService.GetUsersAsync();
            return mockUsers.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user with email {Email} from database, falling back to mock data", email);
            var mockUsers = await _mockDataService.GetUsersAsync();
            return mockUsers.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        }
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        try
        {
            _logger.LogInformation("Attempting to create user in database");
            var user = await _userService.CreateAsync(createUserDto);
            _logger.LogInformation("Created user {UserId} in database", user.Id);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user in database, falling back to mock data");
            // Convert CreateUserDto to UserDto for mock service
            var userDto = new UserDto
            {
                Id = Guid.NewGuid(),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.PhoneNumber,
                DateOfBirth = createUserDto.DateOfBirth,
                Role = createUserDto.Role,
                IsActive = true
            };
            return await _mockDataService.AddUserAsync(userDto);
        }
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
    {
        try
        {
            _logger.LogInformation("Attempting to update user {UserId} in database", id);
            var user = await _userService.UpdateAsync(id, updateUserDto);
            
            if (user != null)
            {
                _logger.LogInformation("Updated user {UserId} in database", id);
                return user;
            }

            _logger.LogWarning("User {UserId} not found in database for update, trying mock data", id);
            // Get existing user from mock data to preserve email
            var existingUser = await _mockDataService.GetUserByIdAsync(id);
            if (existingUser != null)
            {
                // Update only the fields that are in UpdateUserDto
                existingUser.FirstName = updateUserDto.FirstName;
                existingUser.LastName = updateUserDto.LastName;
                existingUser.PhoneNumber = updateUserDto.PhoneNumber;
                existingUser.DateOfBirth = updateUserDto.DateOfBirth;
                if (updateUserDto.Role.HasValue)
                {
                    existingUser.Role = updateUserDto.Role.Value;
                }
                return await _mockDataService.UpdateUserAsync(id, existingUser);
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId} in database, falling back to mock data", id);
            return null;
        }
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Attempting to delete user {UserId} from database", id);
            // Since IUserService doesn't have delete, we'll just return false for database
            _logger.LogWarning("Delete operation not supported in database service, trying mock data");
            return await _mockDataService.DeleteUserAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId} from database, falling back to mock data", id);
            return await _mockDataService.DeleteUserAsync(id);
        }
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm)
    {
        try
        {
            _logger.LogInformation("Attempting to search users in database with term: {SearchTerm}", searchTerm);
            var users = await _userService.SearchAsync(searchTerm);
            
            if (users?.Any() == true)
            {
                _logger.LogInformation("Found {Count} users in database matching search term", users.Count());
                return users;
            }

            _logger.LogWarning("No users found in database for search term, trying mock data");
            var mockUsers = await _mockDataService.GetUsersAsync();
            return mockUsers.Where(u => 
                u.FirstName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users in database, falling back to mock data");
            var mockUsers = await _mockDataService.GetUsersAsync();
            return mockUsers.Where(u => 
                u.FirstName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }
    }

    public string GetDataSourceInfo()
    {
        return "Database-first data service with mock data fallback";
    }

    public string GetCurrentDataSource()
    {
        return "Database";
    }
}