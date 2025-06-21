using StockFlowPro.Application.DTOs;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Web.Services;

public class PersistentMockDataService : IPersistentMockDataService
{
    private readonly string _dataFilePath;
    private readonly ILogger<PersistentMockDataService> _logger;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    public PersistentMockDataService(IWebHostEnvironment environment, ILogger<PersistentMockDataService> logger)
    {
        _logger = logger;
        _dataFilePath = Path.Combine(environment.ContentRootPath, "App_Data", "mock-users.json");
        
        var directory = Path.GetDirectoryName(_dataFilePath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        await _semaphore.WaitAsync();
        try
        {
            if (!File.Exists(_dataFilePath))
            {
                await InitializeDefaultDataAsync();
            }

            var json = await File.ReadAllTextAsync(_dataFilePath);
            var users = JsonSerializer.Deserialize<List<UserDto>>(json, GetJsonOptions()) ?? new List<UserDto>();
            return users;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading users from file");
            return new List<UserDto>();
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        var users = await GetAllUsersAsync();
        return users.FirstOrDefault(u => u.Id == id);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        await _semaphore.WaitAsync();
        try
        {
            var users = (await GetAllUsersAsync()).ToList();
            
            var newUser = new UserDto
            {
                Id = Guid.NewGuid(),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                FullName = $"{createUserDto.FirstName} {createUserDto.LastName}",
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.PhoneNumber,
                DateOfBirth = createUserDto.DateOfBirth,
                Age = CalculateAge(createUserDto.DateOfBirth),
                Role = createUserDto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PasswordHash = createUserDto.PasswordHash
            };

            users.Add(newUser);
            await SaveUsersAsync(users);
            return newUser;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, CreateUserDto updateUserDto)
    {
        await _semaphore.WaitAsync();
        try
        {
            var users = (await GetAllUsersAsync()).ToList();
            var user = users.FirstOrDefault(u => u.Id == id);
            
            if (user == null)
                return null;

            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.FullName = $"{updateUserDto.FirstName} {updateUserDto.LastName}";
            user.Email = updateUserDto.Email;
            user.PhoneNumber = updateUserDto.PhoneNumber;
            user.DateOfBirth = updateUserDto.DateOfBirth;
            user.Age = CalculateAge(updateUserDto.DateOfBirth);
            user.Role = updateUserDto.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await SaveUsersAsync(users);
            return user;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        await _semaphore.WaitAsync();
        try
        {
            var users = (await GetAllUsersAsync()).ToList();
            var user = users.FirstOrDefault(u => u.Id == id);
            
            if (user == null)
                return false;

            users.Remove(user);
            await SaveUsersAsync(users);
            return true;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task InitializeDefaultDataAsync()
    {
        var defaultUsers = new List<UserDto>
        {
            new UserDto
            {
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440000"),
                FirstName = "Admin",
                LastName = "User",
                FullName = "Admin User",
                Email = "admin@stockflowpro.com",
                PhoneNumber = "+1-555-0100",
                DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                Age = CalculateAge(new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Role = StockFlowPro.Domain.Enums.UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PasswordHash = CreateDefaultPasswordHash("admin123")
            },
            new UserDto
            {
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440001"),
                FirstName = "John",
                LastName = "Manager",
                FullName = "John Manager",
                Email = "john.manager@stockflowpro.com",
                PhoneNumber = "+1-555-0101",
                DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                Age = CalculateAge(new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc)),
                Role = StockFlowPro.Domain.Enums.UserRole.Manager,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PasswordHash = CreateDefaultPasswordHash("manager123")
            },
            new UserDto
            {
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440002"),
                FirstName = "Jane",
                LastName = "Smith",
                FullName = "Jane Smith",
                Email = "jane.smith@stockflowpro.com",
                PhoneNumber = "+1-555-0102",
                DateOfBirth = new DateTime(1992, 8, 20, 0, 0, 0, DateTimeKind.Utc),
                Age = CalculateAge(new DateTime(1992, 8, 20, 0, 0, 0, DateTimeKind.Utc)),
                Role = StockFlowPro.Domain.Enums.UserRole.User,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PasswordHash = CreateDefaultPasswordHash("user123")
            }
        };

        await SaveUsersAsync(defaultUsers);
    }

    private async Task SaveUsersAsync(List<UserDto> users)
    {
        try
        {
            var json = JsonSerializer.Serialize(users, GetJsonOptions());
            await File.WriteAllTextAsync(_dataFilePath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving users to file at path: {FilePath}", _dataFilePath);
            throw new InvalidOperationException($"Failed to save users to file: {ex.Message}", ex);
        }
    }

    private static JsonSerializerOptions GetJsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            PropertyNameCaseInsensitive = true
        };
    }

    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age))
            age--;
        return age;
    }

    private static string CreateDefaultPasswordHash(string password)
    {
        using var sha256 = SHA256.Create();
        var salt = Guid.NewGuid().ToString();
        var saltedPassword = password + salt;
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
        var hashedPassword = Convert.ToBase64String(hashedBytes);
        return $"{hashedPassword}:{salt}";
    }
}
