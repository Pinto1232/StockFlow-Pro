using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;

namespace StockFlowPro.Web.Services;

public class DualDataService : IDualDataService
{
    private readonly IMediator _mediator;
    private readonly IMockDataStorageService _mockDataService;
    private readonly IMapper _mapper;
    private readonly ILogger<DualDataService> _logger;
    private DateTime _lastSyncTime = DateTime.MinValue;

    public DualDataService(
        IMediator mediator,
        IMockDataStorageService mockDataService,
        IMapper mapper,
        ILogger<DualDataService> logger)
    {
        _mediator = mediator;
        _mockDataService = mockDataService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(bool activeOnly = false)
    {
        _logger.LogInformation("Getting all users from both database and mock data sources");
        
        var allUsers = new List<UserDto>();
        var userIds = new HashSet<Guid>();

        try
        {
            var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
            var databaseUsers = await _mediator.Send(query);
            
            allUsers.AddRange(databaseUsers.Where(user => userIds.Add(user.Id)));
            
            _logger.LogInformation("Retrieved {Count} users from database", databaseUsers.Count());
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get users from database");
        }

        try
        {
            var mockUsers = await _mockDataService.GetUsersAsync();
            var filteredMockUsers = activeOnly ? mockUsers.Where(u => u.IsActive) : mockUsers;
            var initialUserCount = allUsers.Count;
            
            allUsers.AddRange(filteredMockUsers.Where(user => userIds.Add(user.Id)));
            
            var additionalUsersFromMock = allUsers.Count - initialUserCount;
            _logger.LogInformation("Retrieved {Count} additional users from mock data", additionalUsersFromMock);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get users from mock data");
        }

        _logger.LogInformation("Total users retrieved: {Count}", allUsers.Count);
        return allUsers;
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        _logger.LogInformation("Getting user {UserId} from database", id);
        
        try
        {
            var query = new GetUserByIdQuery { Id = id };
            return await _mediator.Send(query);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get user from database, falling back to mock data");
            return await _mockDataService.GetUserByIdAsync(id);
        }
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        _logger.LogInformation("Getting user by email {Email} from both database and mock data", email);
        
        try
        {
            _logger.LogInformation("Searching for user by email {Email} in database", email);
            var query = new GetUserByEmailQuery { Email = email };
            var databaseUser = await _mediator.Send(query);
            if (databaseUser != null)
            {
                _logger.LogInformation("Found user by email {Email} in database with ID {UserId}", email, databaseUser.Id);
                return databaseUser;
            }
            else
            {
                _logger.LogInformation("User with email {Email} not found in database", email);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get user by email {Email} from database", email);
        }

        try
        {
            _logger.LogInformation("Searching for user by email {Email} in mock data", email);
            var users = await _mockDataService.GetUsersAsync();
            _logger.LogInformation("Retrieved {Count} users from mock data for email search", users.Count);
            
            foreach (var user in users)
            {
                _logger.LogDebug("Mock user: Email={Email}, ID={UserId}, IsActive={IsActive}", 
                    user.Email, user.Id, user.IsActive);
            }
            
            var mockUser = users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            if (mockUser != null)
            {
                _logger.LogInformation("Found user by email {Email} in mock data with ID {UserId}", email, mockUser.Id);
                return mockUser;
            }
            else
            {
                _logger.LogInformation("User with email {Email} not found in mock data", email);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get user by email {Email} from mock data", email);
        }

        _logger.LogWarning("User with email {Email} not found in any data source", email);
        return null;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        _logger.LogInformation("Creating user in both database and mock data with email: {Email}", createUserDto.Email);
        
        UserDto? createdUser = null;
        bool databaseSuccess = false;
        bool mockDataSuccess = false;

        try
        {
            _logger.LogInformation("Attempting to create user in database with email: {Email}", createUserDto.Email);
            var command = _mapper.Map<CreateUserCommand>(createUserDto);
            createdUser = await _mediator.Send(command);
            databaseSuccess = true;
            _logger.LogInformation("Successfully created user {UserId} in database with email: {Email}", createdUser.Id, createdUser.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user in database with email: {Email}", createUserDto.Email);
        }

        try
        {
            _logger.LogDebug("Attempting to create user in mock data with email: {Email}", createUserDto.Email);
            var userDto = new UserDto
            {
                Id = createdUser?.Id ?? Guid.NewGuid(),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                FullName = $"{createUserDto.FirstName} {createUserDto.LastName}",
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.PhoneNumber,
                DateOfBirth = createUserDto.DateOfBirth,
                Age = DateTime.UtcNow.Year - createUserDto.DateOfBirth.Year,
                Role = createUserDto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = createUserDto.PasswordHash
            };

            _logger.LogDebug("Mock user data prepared: ID={UserId}, Email={Email}, IsActive={IsActive}, HasPasswordHash={HasPassword}",
            userDto.Id, userDto.Email, userDto.IsActive, !string.IsNullOrEmpty(userDto.PasswordHash));

            await _mockDataService.AddUserAsync(userDto);
            mockDataSuccess = true;
            _logger.LogInformation("Successfully created user {UserId} in mock data with email: {Email}", userDto.Id, userDto.Email);
            
            createdUser ??= userDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user in mock data with email: {Email}", createUserDto.Email);
        }

        if (!databaseSuccess && !mockDataSuccess)
        {
            _logger.LogError("Failed to create user in both database and mock data with email: {Email}", createUserDto.Email);
            throw new InvalidOperationException("Failed to create user in both database and mock data");
        }

        if (databaseSuccess != mockDataSuccess)
        {
            _logger.LogWarning("User creation partially failed - Database: {DatabaseSuccess}, Mock: {MockSuccess} for email: {Email}", 
                databaseSuccess, mockDataSuccess, createUserDto.Email);
        }

        _logger.LogInformation("User creation completed. Final user: ID={UserId}, Email={Email}", createdUser!.Id, createdUser.Email);
        return createdUser!;
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
    {
        _logger.LogInformation("Updating user {UserId} in both database and mock data", id);
        
        UserDto? updatedUser = null;
        bool databaseSuccess = false;
        bool mockDataSuccess = false;

        try
        {
            var command = _mapper.Map<UpdateUserCommand>(updateUserDto);
            command.Id = id;
            updatedUser = await _mediator.Send(command);
            databaseSuccess = true;
            _logger.LogInformation("Successfully updated user {UserId} in database", id);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found in database", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update user {UserId} in database", id);
        }

        try
        {
            var existingMockUser = await _mockDataService.GetUserByIdAsync(id);
            if (existingMockUser != null)
            {
                existingMockUser.FirstName = updateUserDto.FirstName;
                existingMockUser.LastName = updateUserDto.LastName;
                existingMockUser.PhoneNumber = updateUserDto.PhoneNumber;
                existingMockUser.DateOfBirth = updateUserDto.DateOfBirth;
                existingMockUser.UpdatedAt = DateTime.UtcNow;

                var mockUpdatedUser = await _mockDataService.UpdateUserAsync(id, existingMockUser);
                mockDataSuccess = mockUpdatedUser != null;
                
                if (mockDataSuccess)
                {
                    _logger.LogInformation("Successfully updated user {UserId} in mock data", id);
                    updatedUser ??= mockUpdatedUser;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update user {UserId} in mock data", id);
        }

        if (!databaseSuccess && !mockDataSuccess)
        {
            return null;
        }

        if (databaseSuccess != mockDataSuccess)
        {
            _logger.LogWarning("User update partially failed - Database: {DatabaseSuccess}, Mock: {MockSuccess}", 
                databaseSuccess, mockDataSuccess);
        }

        return updatedUser;
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        _logger.LogInformation("Deleting user {UserId} from both database and mock data", id);
        
        bool databaseSuccess = false;
        bool mockDataSuccess = false;

        try
        {
            var command = new DeleteUserCommand { Id = id };
            databaseSuccess = await _mediator.Send(command);
            if (databaseSuccess)
            {
                _logger.LogInformation("Successfully deleted user {UserId} from database", id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete user {UserId} from database", id);
        }

        try
        {
            mockDataSuccess = await _mockDataService.DeleteUserAsync(id);
            if (mockDataSuccess)
            {
                _logger.LogInformation("Successfully deleted user {UserId} from mock data", id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete user {UserId} from mock data", id);
        }

        if (databaseSuccess != mockDataSuccess)
        {
            _logger.LogWarning("User deletion partially failed - Database: {DatabaseSuccess}, Mock: {MockSuccess}", 
                databaseSuccess, mockDataSuccess);
        }

        return databaseSuccess || mockDataSuccess;
    }

    public async Task<bool> UpdateUserPasswordAsync(string email, string newPasswordHash)
    {
        _logger.LogInformation("Updating password for user with email: {Email}", email);
        
        bool success = false;

        var user = await GetUserByEmailAsync(email);
        if (user == null)
        {
            _logger.LogWarning("User not found with email: {Email}", email);
            return false;
        }

        try
        {
            var mockUsers = await _mockDataService.GetUsersAsync();
            var mockUser = mockUsers.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            
            if (mockUser != null)
            {
                mockUser.PasswordHash = newPasswordHash;
                mockUser.UpdatedAt = DateTime.UtcNow;
                
                var updatedMockUser = await _mockDataService.UpdateUserAsync(mockUser.Id, mockUser);
                if (updatedMockUser != null)
                {
                    success = true;
                    _logger.LogInformation("Successfully updated password in mock data for user with email: {Email}", email);
                }
            }
            else
            {
                _logger.LogInformation("User not found in mock data, creating mock entry for password update: {Email}", email);
                
                var newMockUser = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    DateOfBirth = user.DateOfBirth,
                    Age = user.Age,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = DateTime.UtcNow,
                    PasswordHash = newPasswordHash
                };
                
                await _mockDataService.AddUserAsync(newMockUser);
                success = true;
                _logger.LogInformation("Successfully created mock entry with updated password for user: {Email}", email);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating password in mock data for user with email: {Email}", email);
        }

        if (success)
        {
            _logger.LogInformation("Password update completed successfully for user: {Email}", email);
        }
        else
        {
            _logger.LogWarning("Failed to update password for user: {Email}", email);
        }

        return success;
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm)
    {
        _logger.LogInformation("Searching users with term '{SearchTerm}' in database", searchTerm);
        
        try
        {
            var query = new SearchUsersQuery { SearchTerm = searchTerm ?? string.Empty };
            return await _mediator.Send(query);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to search users in database, falling back to mock data");
            var users = await _mockDataService.GetUsersAsync();
            
            if (string.IsNullOrWhiteSpace(searchTerm))
                return users;

            var lowerSearchTerm = searchTerm.ToLower();
            return users.Where(u => 
                u.FirstName.ToLower().Contains(lowerSearchTerm) ||
                u.LastName.ToLower().Contains(lowerSearchTerm) ||
                u.Email.ToLower().Contains(lowerSearchTerm));
        }
    }

    public async Task SyncDataSourcesAsync()
    {
        _logger.LogInformation("Starting data source synchronization");
        
        try
        {
            var query = new GetAllUsersQuery { ActiveOnly = false };
            var databaseUsers = await _mediator.Send(query);
            
            var mockUsers = databaseUsers.ToList();
            await _mockDataService.SaveUsersAsync(mockUsers);
            
            _lastSyncTime = DateTime.UtcNow;
            _logger.LogInformation("Successfully synchronized {Count} users from database to mock data", mockUsers.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to synchronize data sources");
            throw new InvalidOperationException("Data source synchronization failed", ex);
        }
    }

    public async Task<DataSourceSyncStatus> GetSyncStatusAsync()
    {
        var status = new DataSourceSyncStatus
        {
            LastSyncTime = _lastSyncTime
        };

        try
        {
            var query = new GetAllUsersQuery { ActiveOnly = false };
            var databaseUsers = await _mediator.Send(query);
            status.DatabaseUserCount = databaseUsers.Count();
        }
        catch (Exception ex)
        {
            status.SyncIssues.Add($"Failed to get database user count: {ex.Message}");
        }

        try
        {
            var mockUsers = await _mockDataService.GetUsersAsync();
            status.MockDataUserCount = mockUsers.Count;
        }
        catch (Exception ex)
        {
            status.SyncIssues.Add($"Failed to get mock data user count: {ex.Message}");
        }

        return status;
    }
}
