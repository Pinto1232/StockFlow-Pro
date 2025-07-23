using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.Validators;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Utilities;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories;
using Xunit;

namespace StockFlowPro.Application.Tests.Validators;

/// <summary>
/// Comprehensive tests for email uniqueness validation
/// </summary>
public class EmailUniquenessValidationTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UserRepository _userRepository;
    private readonly CreateUserCommandValidator _validator;

    public EmailUniquenessValidationTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _userRepository = new UserRepository(_context);
        _validator = new CreateUserCommandValidator(_userRepository);
    }

    [Fact]
    public async Task CreateUser_WithUniqueEmail_ShouldPassValidation()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "+1234567890",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            Role = UserRole.User
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().NotContain(e => e.PropertyName == nameof(command.Email));
    }

    [Fact]
    public async Task CreateUser_WithExistingEmail_ShouldFailValidation()
    {
        // Arrange
        var existingEmail = "existing@example.com";
        await CreateTestUser(existingEmail);

        var command = new CreateUserCommand
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = existingEmail,
            PhoneNumber = "+1234567891",
            DateOfBirth = DateTime.UtcNow.AddYears(-30),
            Role = UserRole.User
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.Email) && e.ErrorMessage == "Email already exists");
    }

    [Theory]
    [InlineData("TEST@EXAMPLE.COM", "test@example.com")]
    [InlineData("Test@Example.Com", "test@example.com")]
    [InlineData("test@EXAMPLE.com", "test@example.com")]
    public async Task CreateUser_WithCaseInsensitiveDuplicateEmail_ShouldFailValidation(
        string newEmail, string existingEmail)
    {
        // Arrange
        await CreateTestUser(existingEmail);

        var command = new CreateUserCommand
        {
            FirstName = "Test",
            LastName = "User",
            Email = newEmail,
            PhoneNumber = "+1234567892",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            Role = UserRole.User
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.Email) && e.ErrorMessage == "Email already exists");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("invalid-email")]
    [InlineData("@example.com")]
    [InlineData("test@")]
    [InlineData("test.example.com")]
    public async Task CreateUser_WithInvalidEmailFormat_ShouldFailValidation(string invalidEmail)
    {
        // Arrange
        var command = new CreateUserCommand
        {
            FirstName = "Test",
            LastName = "User",
            Email = invalidEmail,
            PhoneNumber = "+1234567893",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            Role = UserRole.User
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.Email));
    }

    [Theory]
    [InlineData("test@10minutemail.com")]
    [InlineData("user@tempmail.org")]
    [InlineData("fake@guerrillamail.com")]
    public async Task CreateUser_WithBlockedEmailDomain_ShouldFailValidation(string blockedEmail)
    {
        // Arrange
        var enhancedValidator = new EnhancedCreateUserCommandValidator(_userRepository);
        var command = new CreateUserCommand
        {
            FirstName = "Test",
            LastName = "User",
            Email = blockedEmail,
            PhoneNumber = "+1234567894",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            Role = UserRole.User
        };

        // Act
        var result = await enhancedValidator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.Email) && e.ErrorMessage == "Email domain is not allowed");
    }

    [Fact]
    public void EmailNormalizer_ShouldNormalizeEmailCorrectly()
    {
        // Arrange & Act
        var normalized1 = EmailNormalizer.Normalize("  TEST@EXAMPLE.COM  ");
        var normalized2 = EmailNormalizer.Normalize("test@example.com");
        var normalized3 = EmailNormalizer.Normalize("Test@Example.Com");

        // Assert
        Assert.Equal("test@example.com", normalized1);
        Assert.Equal("test@example.com", normalized2);
        Assert.Equal("test@example.com", normalized3);
        Assert.Equal(normalized1, normalized2);
        Assert.Equal(normalized2, normalized3);
    }

    [Theory]
    [InlineData("test@example.com", true)]
    [InlineData("user.name+tag@domain.co.uk", true)]
    [InlineData("invalid-email", false)]
    [InlineData("@example.com", false)]
    [InlineData("test@", false)]
    [InlineData("", false)]
    public void EmailNormalizer_IsValidFormat_ShouldValidateCorrectly(string email, bool expected)
    {
        // Act
        var result = EmailNormalizer.IsValidFormat(email);

        // Assert
        Assert.Equal(expected, result);
    }

    [Fact]
    public void EmailNormalizer_IsValidFormat_WithNull_ShouldReturnFalse()
    {
        // Act
        var result = EmailNormalizer.IsValidFormat(null!);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void EmailNormalizer_ExtractDomain_ShouldExtractCorrectly()
    {
        // Arrange & Act
        var domain1 = EmailNormalizer.ExtractDomain("test@example.com");
        var domain2 = EmailNormalizer.ExtractDomain("user@DOMAIN.CO.UK");
        var domain3 = EmailNormalizer.ExtractDomain("invalid-email");

        // Assert
        Assert.Equal("example.com", domain1);
        Assert.Equal("domain.co.uk", domain2);
        Assert.Equal("", domain3);
    }

    [Fact]
    public async Task UserRepository_EmailExistsAsync_ShouldBeCaseInsensitive()
    {
        // Arrange
        await CreateTestUser("test@example.com");

        // Act
        var exists1 = await _userRepository.EmailExistsAsync("test@example.com");
        var exists2 = await _userRepository.EmailExistsAsync("TEST@EXAMPLE.COM");
        var exists3 = await _userRepository.EmailExistsAsync("Test@Example.Com");
        var notExists = await _userRepository.EmailExistsAsync("different@example.com");

        // Assert
        Assert.True(exists1);
        Assert.True(exists2);
        Assert.True(exists3);
        Assert.False(notExists);
    }

    [Fact]
    public async Task UserRepository_EmailExistsAsync_WithExclusion_ShouldWorkCorrectly()
    {
        // Arrange
        var user = await CreateTestUser("test@example.com");

        // Act
        var existsWithoutExclusion = await _userRepository.EmailExistsAsync("test@example.com");
        var existsWithExclusion = await _userRepository.EmailExistsAsync("test@example.com", user.Id);

        // Assert
        Assert.True(existsWithoutExclusion);
        Assert.False(existsWithExclusion);
    }

    private async Task<User> CreateTestUser(string email)
    {
        var user = new User(
            "Test",
            "User",
            email,
            "+1234567890",
            DateTime.UtcNow.AddYears(-25),
            UserRole.User,
            "hashedpassword"
        );

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}