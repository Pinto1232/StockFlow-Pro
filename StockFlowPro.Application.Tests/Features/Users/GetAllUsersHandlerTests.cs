using AutoMapper;
using FluentAssertions;
using Moq;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Features.Users;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Tests.Features.Users;

public class GetAllUsersHandlerTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly GetAllUsersHandler _handler;

    public GetAllUsersHandlerTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetAllUsersHandler(_mockUserRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_GetAllUsers_ShouldReturnAllUsers()
    {
        // Arrange
        var query = new GetAllUsersQuery { ActiveOnly = false };
        
        var users = new List<User>
        {
            new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User),
            new User("Jane", "Smith", "jane.smith@example.com", "987-654-3210", new DateTime(1985, 5, 15), UserRole.Manager)
        };

        var userDtos = new List<UserDto>
        {
            new UserDto
            {
                Id = users[0].Id,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                PhoneNumber = "123-456-7890",
                Role = UserRole.User,
                IsActive = true
            },
            new UserDto
            {
                Id = users[1].Id,
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@example.com",
                PhoneNumber = "987-654-3210",
                Role = UserRole.Manager,
                IsActive = true
            }
        };

        _mockUserRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);
        _mockMapper.Setup(m => m.Map<IEnumerable<UserDto>>(users))
            .Returns(userDtos);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.First().FirstName.Should().Be("John");
        result.Last().FirstName.Should().Be("Jane");

        _mockUserRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.GetActiveUsersAsync(It.IsAny<CancellationToken>()), Times.Never);
        _mockMapper.Verify(m => m.Map<IEnumerable<UserDto>>(users), Times.Once);
    }

    [Fact]
    public async Task Handle_GetActiveUsersOnly_ShouldReturnActiveUsers()
    {
        // Arrange
        var query = new GetAllUsersQuery { ActiveOnly = true };
        
        var activeUsers = new List<User>
        {
            new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User)
        };

        var userDtos = new List<UserDto>
        {
            new UserDto
            {
                Id = activeUsers[0].Id,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                PhoneNumber = "123-456-7890",
                Role = UserRole.User,
                IsActive = true
            }
        };

        _mockUserRepository.Setup(r => r.GetActiveUsersAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeUsers);
        _mockMapper.Setup(m => m.Map<IEnumerable<UserDto>>(activeUsers))
            .Returns(userDtos);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().FirstName.Should().Be("John");
        result.First().IsActive.Should().BeTrue();

        _mockUserRepository.Verify(r => r.GetActiveUsersAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Never);
        _mockMapper.Verify(m => m.Map<IEnumerable<UserDto>>(activeUsers), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptyUserList_ShouldReturnEmptyCollection()
    {
        // Arrange
        var query = new GetAllUsersQuery { ActiveOnly = false };
        var emptyUsers = new List<User>();
        var emptyUserDtos = new List<UserDto>();

        _mockUserRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyUsers);
        _mockMapper.Setup(m => m.Map<IEnumerable<UserDto>>(emptyUsers))
            .Returns(emptyUserDtos);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();

        _mockUserRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<UserDto>>(emptyUsers), Times.Once);
    }

    [Fact]
    public async Task Handle_NullQuery_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null!, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        var query = new GetAllUsersQuery { ActiveOnly = false };

        _mockUserRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_MapperThrowsException_ShouldPropagateException()
    {
        // Arrange
        var query = new GetAllUsersQuery { ActiveOnly = false };
        var users = new List<User>
        {
            new User("John", "Doe", "john.doe@example.com", "123-456-7890", new DateTime(1990, 1, 1), UserRole.User)
        };

        _mockUserRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);
        _mockMapper.Setup(m => m.Map<IEnumerable<UserDto>>(users))
            .Throws(new InvalidOperationException("Mapping error"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(query, CancellationToken.None));
    }
}