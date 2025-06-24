using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Tests.Data;

public class ApplicationDbContextTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly SqliteConnection _connection;

    public ApplicationDbContextTests()
    {
        // Use SQLite in-memory database which enforces constraints
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();
    }

    [Fact]
    public void ApplicationDbContext_ShouldCreateUsersTable()
    {
        // Act & Assert
        _context.Users.Should().NotBeNull();
        _context.Database.CanConnect().Should().BeTrue();
    }

    [Fact]
    public async Task ApplicationDbContext_ShouldSaveAndRetrieveUser()
    {
        // Arrange
        var user = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc), UserRole.User);

        // Act
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Assert
        var savedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "john.doe@example.com");
        savedUser.Should().NotBeNull();
        savedUser!.FirstName.Should().Be("John");
        savedUser.LastName.Should().Be("Doe");
        savedUser.Email.Should().Be("john.doe@example.com");
        savedUser.Role.Should().Be(UserRole.User);
    }

    [Fact]
    public async Task ApplicationDbContext_ShouldEnforceUniqueEmailConstraint()
    {
        // Arrange
        var user1 = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc), UserRole.User);

        var user2 = new User("Jane", "Smith", "john.doe@example.com", "987-654-3210", new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc), UserRole.Manager);

        // Act
        _context.Users.Add(user1);
        await _context.SaveChangesAsync();

        _context.Users.Add(user2);

        // Assert
        var act = async () => await _context.SaveChangesAsync();
        await act.Should().ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task ApplicationDbContext_ShouldUpdateUserTimestamps()
    {
        // Arrange
        var user = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc), UserRole.User);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var originalUpdatedAt = user.UpdatedAt;

        // Act
        await Task.Delay(10); // Small delay to ensure different timestamp
        user.UpdatePersonalInfo("Jane", "Doe", "123-456-7890", user.DateOfBirth);
        await _context.SaveChangesAsync();

        // Assert
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt ?? DateTime.MinValue);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}