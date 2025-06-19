using FluentAssertions;
using Moq;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.Features.Users;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Tests.Features.Users;

public class DeleteUserHandlerTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly DeleteUserHandler _handler;

    public DeleteUserHandlerTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _handler = new DeleteUserHandler(_mockUserRepository.Object);
    }

    [Fact]
    public async Task Handle_ExistingUser_ShouldDeleteUserAndReturnTrue()
    {

        var userId = Guid.NewGuid();
        var command = new DeleteUserCommand { Id = userId };
        var existingUser = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User);

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(r => r.DeleteAsync(existingUser, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);


        var result = await _handler.Handle(command, CancellationToken.None);


        result.Should().BeTrue();

        _mockUserRepository.Verify(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.DeleteAsync(existingUser, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NonExistingUser_ShouldThrowKeyNotFoundException()
    {

        var userId = Guid.NewGuid();
        var command = new DeleteUserCommand { Id = userId };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);


        await Assert.ThrowsAsync<KeyNotFoundException>(() => _handler.Handle(command, CancellationToken.None));

        _mockUserRepository.Verify(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.DeleteAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_EmptyGuidId_ShouldThrowKeyNotFoundException()
    {

        var command = new DeleteUserCommand { Id = Guid.Empty };

        _mockUserRepository.Setup(r => r.GetByIdAsync(Guid.Empty, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);


        await Assert.ThrowsAsync<KeyNotFoundException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_NullCommand_ShouldThrowArgumentNullException()
    {

        await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null!, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_RepositoryDeleteThrowsException_ShouldPropagateException()
    {

        var userId = Guid.NewGuid();
        var command = new DeleteUserCommand { Id = userId };
        var existingUser = new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User);

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);
        _mockUserRepository.Setup(r => r.DeleteAsync(existingUser, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));


        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));

        _mockUserRepository.Verify(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.DeleteAsync(existingUser, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_RepositoryGetByIdThrowsException_ShouldPropagateException()
    {

        var userId = Guid.NewGuid();
        var command = new DeleteUserCommand { Id = userId };

        _mockUserRepository.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database connection error"));


        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));

        _mockUserRepository.Verify(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.DeleteAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
