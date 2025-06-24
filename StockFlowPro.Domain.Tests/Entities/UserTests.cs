using FluentAssertions;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void User_Constructor_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phoneNumber = "123-456-7890";
        var dateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var role = UserRole.User;

        // Act
        var user = new User(firstName, lastName, email, phoneNumber, dateOfBirth, role);

        // Assert
        user.FirstName.Should().Be(firstName);
        user.LastName.Should().Be(lastName);
        user.Email.Should().Be(email);
        user.PhoneNumber.Should().Be(phoneNumber);
        user.DateOfBirth.Should().Be(dateOfBirth);
        user.Role.Should().Be(role);
        user.IsActive.Should().BeTrue(); // Default value
        user.Id.Should().NotBeEmpty(); // Should have a generated ID
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        user.UpdatedAt.Should().BeNull(); // Initially null
    }

    [Fact]
    public void User_GetFullName_ShouldReturnCombinedFirstAndLastName()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));

        // Act
        var fullName = user.GetFullName();

        // Assert
        fullName.Should().Be("John Doe");
    }

    [Theory]
    [InlineData("", "Doe", " Doe")]
    [InlineData("John", "", "John ")]
    [InlineData("", "", " ")]
    public void User_GetFullName_ShouldHandleEmptyNames(string firstName, string lastName, string expected)
    {
        // Arrange
        var user = new User(firstName, lastName, "test@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));

        // Act
        var fullName = user.GetFullName();

        // Assert
        fullName.Should().Be(expected);
    }

    [Fact]
    public void User_UpdatePersonalInfo_ShouldUpdatePropertiesAndTimestamp()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        Thread.Sleep(10); // Small delay to ensure different timestamp
        user.UpdatePersonalInfo("Jane", "Smith", "987-654-3210", DateTime.UtcNow.AddYears(-25));

        // Assert
        user.FirstName.Should().Be("Jane");
        user.LastName.Should().Be("Smith");
        user.PhoneNumber.Should().Be("987-654-3210");
        user.UpdatedAt.Should().NotBeNull();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }

    [Fact]
    public void User_UpdateEmail_ShouldUpdateEmailAndTimestamp()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        Thread.Sleep(10); // Small delay to ensure different timestamp
        user.UpdateEmail("newemail@example.com");

        // Assert
        user.Email.Should().Be("newemail@example.com");
        user.UpdatedAt.Should().NotBeNull();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }

    [Fact]
    public void User_Activate_ShouldSetIsActiveToTrueAndUpdateTimestamp()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));
        user.Deactivate(); // First deactivate
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        Thread.Sleep(10); // Small delay to ensure different timestamp
        user.Activate();

        // Assert
        user.IsActive.Should().BeTrue();
        user.UpdatedAt.Should().NotBeNull();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }

    [Fact]
    public void User_Deactivate_ShouldSetIsActiveToFalseAndUpdateTimestamp()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        Thread.Sleep(10); // Small delay to ensure different timestamp
        user.Deactivate();

        // Assert
        user.IsActive.Should().BeFalse();
        user.UpdatedAt.Should().NotBeNull();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }

    [Fact]
    public void User_SetRole_ShouldUpdateRoleAndTimestamp()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        Thread.Sleep(10); // Small delay to ensure different timestamp
        user.SetRole(UserRole.Admin);

        // Assert
        user.Role.Should().Be(UserRole.Admin);
        user.UpdatedAt.Should().NotBeNull();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }

    [Fact]
    public void User_GetAge_ShouldCalculateCorrectAge()
    {
        // Arrange
        var birthDate = DateTime.UtcNow.AddYears(-25).AddDays(-1); // 25 years and 1 day ago
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", birthDate);

        // Act
        var age = user.GetAge();

        // Assert
        age.Should().Be(25);
    }

    [Fact]
    public void User_UpdatePasswordHash_ShouldUpdatePasswordAndTimestamp()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30));
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        Thread.Sleep(10); // Small delay to ensure different timestamp
        user.UpdatePasswordHash("newhashedpassword");

        // Assert
        user.PasswordHash.Should().Be("newhashedpassword");
        user.UpdatedAt.Should().NotBeNull();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }
}