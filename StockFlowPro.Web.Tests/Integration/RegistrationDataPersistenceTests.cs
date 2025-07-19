using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Web.Controllers.Api;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace StockFlowPro.Web.Tests.Integration;

/// <summary>
/// Integration tests to verify user registration data is properly persisted to the database
/// </summary>
public class RegistrationDataPersistenceTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public RegistrationDataPersistenceTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Register_ValidUser_ShouldPersistToDatabase()
    {
        // Arrange
        var uniqueEmail = $"test.user.{Guid.NewGuid():N}@example.com";
        var registerRequest = new EnhancedRegisterRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = uniqueEmail,
            PhoneNumber = "+1234567890",
            DateOfBirth = new DateTime(1990, 1, 1),
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/enhanced-auth/register", registerRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var responseContent = await response.Content.ReadAsStringAsync();
        var registrationResult = JsonSerializer.Deserialize<RegistrationResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(registrationResult);
        Assert.Equal("Registration successful and verified", registrationResult.Message);
        Assert.NotNull(registrationResult.User);
        Assert.Equal(uniqueEmail, registrationResult.User.Email);
        Assert.Equal("John", registrationResult.User.FirstName);
        Assert.Equal("Doe", registrationResult.User.LastName);

        // Verify database persistence using direct database access
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();

        // Test 1: Verify user exists by ID
        var userById = await context.Users.FindAsync(registrationResult.User.Id);
        Assert.NotNull(userById);
        Assert.Equal(uniqueEmail, userById.Email);
        Assert.Equal("John", userById.FirstName);
        Assert.Equal("Doe", userById.LastName);
        Assert.True(userById.IsActive);
        Assert.NotNull(userById.PasswordHash);

        // Test 2: Verify user exists by email
        var userByEmail = await userRepository.GetByEmailAsync(uniqueEmail);
        Assert.NotNull(userByEmail);
        Assert.Equal(registrationResult.User.Id, userByEmail.Id);

        // Test 3: Verify email uniqueness check works
        var emailExists = await userRepository.EmailExistsAsync(uniqueEmail);
        Assert.True(emailExists);

        // Test 4: Verify user appears in all users list
        var allUsers = await userRepository.GetAllAsync();
        var createdUser = allUsers.FirstOrDefault(u => u.Email == uniqueEmail);
        Assert.NotNull(createdUser);
        Assert.Equal(registrationResult.User.Id, createdUser.Id);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ShouldReturnConflict()
    {
        // Arrange
        var uniqueEmail = $"duplicate.test.{Guid.NewGuid():N}@example.com";
        
        // First registration
        var firstRequest = new EnhancedRegisterRequest
        {
            FirstName = "First",
            LastName = "User",
            Email = uniqueEmail,
            PhoneNumber = "+1234567890",
            DateOfBirth = new DateTime(1990, 1, 1),
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!"
        };

        var firstResponse = await _client.PostAsJsonAsync("/api/enhanced-auth/register", firstRequest);
        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        // Second registration with same email
        var secondRequest = new EnhancedRegisterRequest
        {
            FirstName = "Second",
            LastName = "User",
            Email = uniqueEmail, // Same email
            PhoneNumber = "+1234567891",
            DateOfBirth = new DateTime(1985, 1, 1),
            Password = "AnotherPassword123!",
            ConfirmPassword = "AnotherPassword123!"
        };

        // Act
        var secondResponse = await _client.PostAsJsonAsync("/api/enhanced-auth/register", secondRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);

        var responseContent = await secondResponse.Content.ReadAsStringAsync();
        Assert.Contains("email already exists", responseContent, StringComparison.OrdinalIgnoreCase);

        // Verify only one user exists in database
        using var scope = _factory.Services.CreateScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        
        var allUsersWithEmail = await userRepository.SearchUsersAsync(uniqueEmail);
        Assert.Single(allUsersWithEmail);
        
        var user = allUsersWithEmail.First();
        Assert.Equal("First", user.FirstName); // Should be the first user
        Assert.Equal("User", user.LastName);
    }

    [Fact]
    public async Task VerifyUserExists_ExistingUser_ShouldReturnUserDetails()
    {
        // Arrange
        var uniqueEmail = $"verify.test.{Guid.NewGuid():N}@example.com";
        
        // Create a user first
        var registerRequest = new EnhancedRegisterRequest
        {
            FirstName = "Verify",
            LastName = "Test",
            Email = uniqueEmail,
            PhoneNumber = "+1234567890",
            DateOfBirth = new DateTime(1990, 1, 1),
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/enhanced-auth/register", registerRequest);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        // Act
        var verifyResponse = await _client.GetAsync($"/api/enhanced-auth/verify-user/{uniqueEmail}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, verifyResponse.StatusCode);

        var responseContent = await verifyResponse.Content.ReadAsStringAsync();
        var verificationResult = JsonSerializer.Deserialize<UserVerificationResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(verificationResult);
        Assert.True(verificationResult.UserFound);
        Assert.True(verificationResult.EmailExists);
        Assert.Equal(uniqueEmail, verificationResult.Email);
        Assert.Equal("Verify", verificationResult.FirstName);
        Assert.Equal("Test", verificationResult.LastName);
        Assert.True(verificationResult.IsActive);
        Assert.NotNull(verificationResult.UserId);
    }

    [Fact]
    public async Task VerifyUserExists_NonExistentUser_ShouldReturnNotFound()
    {
        // Arrange
        var nonExistentEmail = $"nonexistent.{Guid.NewGuid():N}@example.com";

        // Act
        var verifyResponse = await _client.GetAsync($"/api/enhanced-auth/verify-user/{nonExistentEmail}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, verifyResponse.StatusCode);

        var responseContent = await verifyResponse.Content.ReadAsStringAsync();
        var verificationResult = JsonSerializer.Deserialize<UserVerificationResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(verificationResult);
        Assert.False(verificationResult.UserFound);
        Assert.False(verificationResult.EmailExists);
        Assert.Equal(nonExistentEmail, verificationResult.Email);
        Assert.Null(verificationResult.UserId);
    }

    [Fact]
    public async Task GetDatabaseStats_ShouldReturnValidStatistics()
    {
        // Arrange - Create a few test users
        var testUsers = new[]
        {
            new EnhancedRegisterRequest
            {
                FirstName = "Stats",
                LastName = "User1",
                Email = $"stats1.{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+1234567890",
                DateOfBirth = new DateTime(1990, 1, 1),
                Password = "SecurePassword123!",
                ConfirmPassword = "SecurePassword123!"
            },
            new EnhancedRegisterRequest
            {
                FirstName = "Stats",
                LastName = "User2",
                Email = $"stats2.{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+1234567891",
                DateOfBirth = new DateTime(1985, 1, 1),
                Password = "SecurePassword123!",
                ConfirmPassword = "SecurePassword123!"
            }
        };

        foreach (var user in testUsers)
        {
            var response = await _client.PostAsJsonAsync("/api/enhanced-auth/register", user);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        // Act
        var statsResponse = await _client.GetAsync("/api/enhanced-auth/database-stats");

        // Assert
        Assert.Equal(HttpStatusCode.OK, statsResponse.StatusCode);

        var responseContent = await statsResponse.Content.ReadAsStringAsync();
        var stats = JsonSerializer.Deserialize<DatabaseStatsResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(stats);
        Assert.True(stats.TotalUsers >= 2); // At least our test users
        Assert.True(stats.ActiveUsers >= 2);
        Assert.True(stats.UsersWithPasswords >= 2);
        Assert.NotNull(stats.UserRoles);
        Assert.True(stats.UserRoles.ContainsKey("User"));
    }

    [Fact]
    public async Task Register_ValidUser_ShouldCreateUserWithCorrectTimestamps()
    {
        // Arrange
        var uniqueEmail = $"timestamp.test.{Guid.NewGuid():N}@example.com";
        var beforeRegistration = DateTime.UtcNow;
        
        var registerRequest = new EnhancedRegisterRequest
        {
            FirstName = "Timestamp",
            LastName = "Test",
            Email = uniqueEmail,
            PhoneNumber = "+1234567890",
            DateOfBirth = new DateTime(1990, 1, 1),
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/enhanced-auth/register", registerRequest);
        var afterRegistration = DateTime.UtcNow;

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        // Verify timestamps in database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == uniqueEmail);
        Assert.NotNull(user);
        
        // CreatedAt should be between before and after registration
        Assert.True(user.CreatedAt >= beforeRegistration);
        Assert.True(user.CreatedAt <= afterRegistration);
        
        // UpdatedAt should be null for new users
        Assert.Null(user.UpdatedAt);
    }
}

// Response DTOs for testing
public class RegistrationResponse
{
    public string RegistrationId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public UserResponse User { get; set; } = new();
    public VerificationResponse Verification { get; set; } = new();
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VerificationResponse
{
    public bool UserFoundById { get; set; }
    public bool UserFoundByEmail { get; set; }
    public bool DataMatches { get; set; }
}

public class UserVerificationResponse
{
    public string Email { get; set; } = string.Empty;
    public bool UserFound { get; set; }
    public bool EmailExists { get; set; }
    public Guid? UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class DatabaseStatsResponse
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int InactiveUsers { get; set; }
    public int UsersWithPasswords { get; set; }
    public int RecentUsers { get; set; }
    public Dictionary<string, int> UserRoles { get; set; } = new();
}