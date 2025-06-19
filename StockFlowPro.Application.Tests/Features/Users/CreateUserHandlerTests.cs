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

public class CreateUserHandlerTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new CreateUserHandler(_mockUserRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateUserAndReturnDto()
    {

        var command = new CreateUserCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "123-456-7890",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };

        var userDto = new UserDto
        {
            Id = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "123-456-7890",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User,
            IsActive = true
        };

        _mockMapper.Setup(m => m.Map<UserDto>(It.IsAny<User>())).Returns(userDto);
        _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);


        var result = await _handler.Handle(command, CancellationToken.None);


        result.Should().NotBeNull();
        result.FirstName.Should().Be("John");
        result.LastName.Should().Be("Doe");
        result.Email.Should().Be("john.doe@example.com");
        result.PhoneNumber.Should().Be("123-456-7890");
        result.Role.Should().Be(UserRole.User);
        result.IsActive.Should().BeTrue();

        _mockUserRepository.Verify(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<UserDto>(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NullCommand_ShouldThrowArgumentNullException()
    {

        await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null!, CancellationToken.None));
    }

    [Theory]
    [InlineData("", "Doe", "john.doe@example.com", "123-456-7890")]
    [InlineData("John", "", "john.doe@example.com", "123-456-7890")]
    [InlineData("John", "Doe", "", "123-456-7890")]
    [InlineData("John", "Doe", "john.doe@example.com", "")]
    public async Task Handle_InvalidCommand_ShouldThrowException(string firstName, string lastName, string email, string phoneNumber)
    {

        var command = new CreateUserCommand
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = phoneNumber,
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };


        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {

        var command = new CreateUserCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "123-456-7890",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };

        _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));


        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
    }
}
