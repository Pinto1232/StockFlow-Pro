using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories;

namespace StockFlowPro.Infrastructure.Tests.Repositories;

public class UserRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new UserRepository(_context);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllUsers()
    {
        // Arrange
        var users = new[]
        {
            new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30), UserRole.User),
            new User("Jane", "Smith", "jane@example.com", "987-654-3210", DateTime.UtcNow.AddYears(-25), UserRole.Manager),
            new User("Bob", "Johnson", "bob@example.com", "555-123-4567", DateTime.UtcNow.AddYears(-35), UserRole.Admin)
        };

        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(u => u.Email == "john@example.com");
        result.Should().Contain(u => u.Email == "jane@example.com");
        result.Should().Contain(u => u.Email == "bob@example.com");
    }

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ShouldReturnUser()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30), UserRole.User);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be("john@example.com");
        result.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ShouldReturnNull()
    {
        // Arrange
        var nonExistingId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistingId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByEmailAsync_ExistingUser_ShouldReturnUser()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30), UserRole.User);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByEmailAsync("john@example.com");

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be("john@example.com");
        result.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task GetByEmailAsync_NonExistingUser_ShouldReturnNull()
    {
        // Act
        var result = await _repository.GetByEmailAsync("nonexisting@example.com");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_ShouldAddUserToDatabase()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30), UserRole.User);

        // Act
        await _repository.AddAsync(user);

        // Assert
        var savedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "john@example.com");
        savedUser.Should().NotBeNull();
        savedUser!.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateExistingUser()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30), UserRole.User);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        user.UpdatePersonalInfo("Jane", "Doe", "123-456-7890", user.DateOfBirth);
        await _repository.UpdateAsync(user);

        // Assert
        var updatedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
        updatedUser.Should().NotBeNull();
        updatedUser!.FirstName.Should().Be("Jane");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveUserFromDatabase()
    {
        // Arrange
        var user = new User("John", "Doe", "john@example.com", "123-456-7890", DateTime.UtcNow.AddYears(-30), UserRole.User);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        await _repository.DeleteAsync(user);

        // Assert
        var deletedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
        deletedUser.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}