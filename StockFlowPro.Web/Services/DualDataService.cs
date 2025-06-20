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
        _logger.LogInformation("Getting all users from database (primary source)");
        
        try
        {
            var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
            var users = await _mediator.Send(query);
            return users;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get users from database, falling back to mock data");
            var mockUsers = await _mockDataService.GetUsersAsync();
            return activeOnly ? mockUsers.Where(u => u.IsActive) : mockUsers;
        }
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
        _logger.LogInformation("Getting user by email {Email} from database", email);
        
        try
        {
            var query = new GetUserByEmailQuery { Email = email };
            return await _mediator.Send(query);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get user by email from database, falling back to mock data");
            var users = await _mockDataService.GetUsersAsync();
            return users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        }
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        _logger.LogInformation("Creating user in both database and mock data");
        
        UserDto? createdUser = null;
        bool databaseSuccess = false;
        bool mockDataSuccess = false;

        try
        {
            var command = _mapper.Map<CreateUserCommand>(createUserDto);
            createdUser = await _mediator.Send(command);
            databaseSuccess = true;
            _logger.LogInformation("Successfully created user {UserId} in database", createdUser.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user in database");
        }

        try
        {
            var userDto = new UserDto
            {
                Id = createdUser?.Id ?? Guid.NewGuid(),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.PhoneNumber,
                DateOfBirth = createUserDto.DateOfBirth,
                Role = createUserDto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _mockDataService.AddUserAsync(userDto);
            mockDataSuccess = true;
            _logger.LogInformation("Successfully created user {UserId} in mock data", userDto.Id);
            
            createdUser ??= userDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user in mock data");
        }

        if (!databaseSuccess && !mockDataSuccess)
        {
            throw new InvalidOperationException("Failed to create user in both database and mock data");
        }

        if (databaseSuccess != mockDataSuccess)
        {
            _logger.LogWarning("User creation partially failed - Database: {DatabaseSuccess}, Mock: {MockSuccess}", 
                databaseSuccess, mockDataSuccess);
        }

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