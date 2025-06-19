using AutoMapper;
using FluentAssertions;
using Moq;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Features.Users;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Tests.Features.Users;

public class UpdateUserHandlerTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly UpdateUserHandler _handler;

    public UpdateUserHandlerTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new UpdateUserHandler(_mockUserRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldUpdateUserAndReturnDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new UpdateUserCommand
        {
            Id = userId,
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15)
        };

        var existingUser = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User);
        var updatedUserDto = new UserDto
        {
            Id = userId,
            FirstName = "Jane",
            LastName = "Smith",
            Email = "john.doe@example.com", // Email should remain unchanged
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15),
            Role = UserRole.User,
            IsActive = true
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(r => r.UpdateAsync(existingUser, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<UserDto>(existingUser)).Returns(updatedUserDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
        result.PhoneNumber.Should().Be("987-654-3210");
        result.DateOfBirth.Should().Be(new DateTime(1985, 5, 15));
        result.Role.Should().Be(UserRole.User);

        _mockUserRepository.Verify(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.UpdateAsync(existingUser, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<UserDto>(existingUser), Times.Once);
    }

    [Fact]
    public async Task Handle_NonExistingUser_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new UpdateUserCommand
        {
            Id = userId,
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15)
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _handler.Handle(command, CancellationToken.None));

        _mockUserRepository.Verify(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NullCommand_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null!, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_EmptyGuidId_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var command = new UpdateUserCommand
        {
            Id = Guid.Empty,
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15)
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(Guid.Empty, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_RepositoryUpdateThrowsException_ShouldPropagateException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new UpdateUserCommand
        {
            Id = userId,
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15)
        };

        var existingUser = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User);

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(r => r.UpdateAsync(existingUser, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Theory]
    [InlineData("", "Smith", "987-654-3210")]
    [InlineData("Jane", "", "987-654-3210")]
    [InlineData("Jane", "Smith", "")]
    public async Task Handle_InvalidCommandData_ShouldStillProcessUpdate(string firstName, string lastName, string phoneNumber)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new UpdateUserCommand
        {
            Id = userId,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
            DateOfBirth = new DateTime(1985, 5, 15)
        };

        var existingUser = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User);
        var updatedUserDto = new UserDto
        {
            Id = userId,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
            DateOfBirth = new DateTime(1985, 5, 15),
            IsActive = true
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(r => r.UpdateAsync(existingUser, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<UserDto>(existingUser)).Returns(updatedUserDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be(firstName);
        result.LastName.Should().Be(lastName);
        result.PhoneNumber.Should().Be(phoneNumber);

        _mockUserRepository.Verify(r => r.UpdateAsync(existingUser, It.IsAny<CancellationToken>()), Times.Once);
    }
}