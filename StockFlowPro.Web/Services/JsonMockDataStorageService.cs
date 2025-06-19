using System.Text.Json;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Services;

public class JsonMockDataStorageService : IMockDataStorageService
{
    private readonly string _dataFilePath;
    private readonly ILogger<JsonMockDataStorageService> _logger;
    private readonly SemaphoreSlim _fileLock = new(1, 1);
    private readonly JsonSerializerOptions _jsonOptions;
    private List<UserDto>? _cachedUsers;
    private DateTime _lastCacheUpdate = DateTime.MinValue;
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5);

    public JsonMockDataStorageService(IWebHostEnvironment environment, ILogger<JsonMockDataStorageService> logger)
    {
        _logger = logger;
        var dataDirectory = Path.Combine(environment.ContentRootPath, "App_Data");
        Directory.CreateDirectory(dataDirectory);
        _dataFilePath = Path.Combine(dataDirectory, "mock-users.json");
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
        };
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        // Check cache first
        if (_cachedUsers != null && DateTime.UtcNow - _lastCacheUpdate < _cacheExpiry)
        {
            return new List<UserDto>(_cachedUsers);
        }

        await _fileLock.WaitAsync().ConfigureAwait(false);
        try
        {
            // Double-check cache after acquiring lock
            if (_cachedUsers != null && DateTime.UtcNow - _lastCacheUpdate < _cacheExpiry)
            {
                return new List<UserDto>(_cachedUsers);
            }

            if (!File.Exists(_dataFilePath))
            {
                await InitializeDefaultDataInternalAsync().ConfigureAwait(false);
                return new List<UserDto>(_cachedUsers ?? new List<UserDto>());
            }

            var users = await GetUsersFromFileAsync().ConfigureAwait(false);
            
            // Update cache
            _cachedUsers = users;
            _lastCacheUpdate = DateTime.UtcNow;
            
            _logger.LogDebug("Retrieved {Count} users from persistent storage", users.Count);
            return new List<UserDto>(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading users from persistent storage");
            return new List<UserDto>(_cachedUsers ?? new List<UserDto>());
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private async Task<List<UserDto>> GetUsersFromFileAsync()
    {
        using var fileStream = new FileStream(_dataFilePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4096, useAsync: true);
        return await JsonSerializer.DeserializeAsync<List<UserDto>>(fileStream, _jsonOptions).ConfigureAwait(false) ?? new List<UserDto>();
    }

    private async Task InitializeDefaultDataInternalAsync()
    {
        var defaultUsers = new List<UserDto>
        {
            new UserDto 
            { 
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440001"), 
                FirstName = "John", 
                LastName = "Admin", 
                Email = "admin@stockflowpro.com", 
                PhoneNumber = "+1-555-0101", 
                Role = UserRole.Admin,
                IsActive = true,
                DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new UserDto 
            { 
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440002"), 
                FirstName = "Jane", 
                LastName = "Manager", 
                Email = "manager@stockflowpro.com", 
                PhoneNumber = "+1-555-0102", 
                Role = UserRole.Manager,
                IsActive = true,
                DateOfBirth = new DateTime(1990, 8, 22, 0, 0, 0, DateTimeKind.Utc)
            },
            new UserDto 
            { 
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440003"), 
                FirstName = "Bob", 
                LastName = "User", 
                Email = "user@stockflowpro.com", 
                PhoneNumber = "+1-555-0103", 
                Role = UserRole.User,
                IsActive = true,
                DateOfBirth = new DateTime(1992, 12, 10, 0, 0, 0, DateTimeKind.Utc)
            },
            new UserDto 
            { 
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440004"), 
                FirstName = "Alice", 
                LastName = "Smith", 
                Email = "alice.smith@stockflowpro.com", 
                PhoneNumber = "+1-555-0104", 
                Role = UserRole.User,
                IsActive = false,
                DateOfBirth = new DateTime(1988, 3, 7, 0, 0, 0, DateTimeKind.Utc)
            }
        };

        await SaveUsersInternalAsync(defaultUsers).ConfigureAwait(false);
        _logger.LogInformation("Initialized default mock data with {Count} users", defaultUsers.Count);
    }

    public async Task SaveUsersAsync(List<UserDto> users)
    {
        await _fileLock.WaitAsync().ConfigureAwait(false);
        try
        {
            await SaveUsersInternalAsync(users).ConfigureAwait(false);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private async Task SaveUsersInternalAsync(List<UserDto> users)
    {
        try
        {
            using var fileStream = new FileStream(_dataFilePath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 4096, useAsync: true);
            await JsonSerializer.SerializeAsync(fileStream, users, _jsonOptions).ConfigureAwait(false);
            
            // Update cache
            _cachedUsers = new List<UserDto>(users);
            _lastCacheUpdate = DateTime.UtcNow;
            
            _logger.LogDebug("Saved {Count} users to persistent storage", users.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving users to persistent storage at path: {FilePath}", _dataFilePath);
            throw new InvalidOperationException($"Failed to save users to persistent storage: {ex.Message}", ex);
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        var users = await GetUsersAsync().ConfigureAwait(false);
        return users.FirstOrDefault(u => u.Id == id);
    }

    public async Task<UserDto> AddUserAsync(UserDto user)
    {
        var users = await GetUsersAsync().ConfigureAwait(false);
        
        // Ensure unique ID
        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
        }
        
        // Check for duplicate email
        if (users.Any(u => u.Email.Equals(user.Email, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"User with email {user.Email} already exists");
        }
        
        users.Add(user);
        await SaveUsersAsync(users).ConfigureAwait(false);
        
        _logger.LogInformation("Added new user with ID {UserId} and email {Email}", user.Id, user.Email);
        return user;
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UserDto updatedUser)
    {
        var users = await GetUsersAsync().ConfigureAwait(false);
        var existingUser = users.FirstOrDefault(u => u.Id == id);
        
        if (existingUser == null)
        {
            return null;
        }

        // Check for duplicate email (excluding current user)
        if (users.Any(u => u.Id != id && u.Email.Equals(updatedUser.Email, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"User with email {updatedUser.Email} already exists");
        }

        // Update properties
        existingUser.FirstName = updatedUser.FirstName;
        existingUser.LastName = updatedUser.LastName;
        existingUser.Email = updatedUser.Email;
        existingUser.PhoneNumber = updatedUser.PhoneNumber;
        existingUser.DateOfBirth = updatedUser.DateOfBirth;
        existingUser.Role = updatedUser.Role;
        existingUser.IsActive = updatedUser.IsActive;

        await SaveUsersAsync(users).ConfigureAwait(false);
        
        _logger.LogInformation("Updated user with ID {UserId}", id);
        return existingUser;
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var users = await GetUsersAsync().ConfigureAwait(false);
        var userToDelete = users.FirstOrDefault(u => u.Id == id);
        
        if (userToDelete == null)
        {
            return false;
        }

        users.Remove(userToDelete);
        await SaveUsersAsync(users).ConfigureAwait(false);
        
        _logger.LogInformation("Deleted user with ID {UserId} and email {Email}", id, userToDelete.Email);
        return true;
    }

    public async Task InitializeDefaultDataAsync()
    {
        await _fileLock.WaitAsync().ConfigureAwait(false);
        try
        {
            await InitializeDefaultDataInternalAsync().ConfigureAwait(false);
        }
        finally
        {
            _fileLock.Release();
        }
    }
}