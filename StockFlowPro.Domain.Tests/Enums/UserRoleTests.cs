using FluentAssertions;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Tests.Enums;

public class UserRoleTests
{
    [Fact]
    public void UserRole_ShouldHaveExpectedValues()
    {
        // Assert
        Enum.GetValues<UserRole>().Should().HaveCount(3);
        Enum.GetValues<UserRole>().Should().Contain(UserRole.User);
        Enum.GetValues<UserRole>().Should().Contain(UserRole.Manager);
        Enum.GetValues<UserRole>().Should().Contain(UserRole.Admin);
    }

    [Theory]
    [InlineData(UserRole.Admin, 1)]
    [InlineData(UserRole.User, 2)]
    [InlineData(UserRole.Manager, 3)]
    public void UserRole_ShouldHaveCorrectNumericValues(UserRole role, int expectedValue)
    {
        // Assert
        ((int)role).Should().Be(expectedValue);
    }

    [Theory]
    [InlineData(UserRole.User, "User")]
    [InlineData(UserRole.Manager, "Manager")]
    [InlineData(UserRole.Admin, "Admin")]
    public void UserRole_ToString_ShouldReturnCorrectString(UserRole role, string expectedString)
    {
        // Assert
        role.ToString().Should().Be(expectedString);
    }

    [Theory]
    [InlineData("User", UserRole.User)]
    [InlineData("Manager", UserRole.Manager)]
    [InlineData("Admin", UserRole.Admin)]
    public void UserRole_Parse_ShouldParseCorrectly(string roleString, UserRole expectedRole)
    {
        // Act
        var success = Enum.TryParse<UserRole>(roleString, out var parsedRole);

        // Assert
        success.Should().BeTrue();
        parsedRole.Should().Be(expectedRole);
    }
}