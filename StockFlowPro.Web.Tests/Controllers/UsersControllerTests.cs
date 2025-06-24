using AutoMapper;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Web.Controllers.Api;
using System.Security.Claims;

namespace StockFlowPro.Web.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IMediator> _mockMediator;
    private readonly Mock<IMapper> _mockMapper;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockMediator = new Mock<IMediator>();
        _mockMapper = new Mock<IMapper>();
        _controller = new UsersController(_mockMediator.Object, _mockMapper.Object);
        
        // Setup mock user context for authorization tests
        SetupMockUser(Guid.NewGuid(), UserRole.Admin);
    }

    private void SetupMockUser(Guid userId, UserRole role)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role.ToString()),
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.Email, "test@example.com")
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext
        {
            User = principal
        };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
    }

    [Fact]
    public async Task GetAllUsers_ShouldReturnOkWithUsers()
    {
        var users = new List<UserDto>
        {
            new UserDto
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Role = UserRole.User,
                IsActive = true
            }
        };

        _mockMediator.Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        var result = await _controller.GetAllUsers();

        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUsers = okResult.Value.Should().BeAssignableTo<IEnumerable<UserDto>>().Subject;
        returnedUsers.Should().HaveCount(1);
        returnedUsers.First().FirstName.Should().Be("John");

        _mockMediator.Verify(m => m.Send(It.Is<GetAllUsersQuery>(q => !q.ActiveOnly), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllUsers_WithActiveOnlyTrue_ShouldPassActiveOnlyParameter()
    {
        var users = new List<UserDto>();
        _mockMediator.Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        await _controller.GetAllUsers(activeOnly: true);

        _mockMediator.Verify(m => m.Send(It.Is<GetAllUsersQuery>(q => q.ActiveOnly), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetUserById_ExistingUser_ShouldReturnOkWithUser()
    {

        var userId = Guid.NewGuid();
        var user = new UserDto
        {
            Id = userId,
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Role = UserRole.User,
            IsActive = true
        };

        _mockMediator.Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);


        var result = await _controller.GetUserById(userId);


        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUser = okResult.Value.Should().BeOfType<UserDto>().Subject;
        returnedUser.Id.Should().Be(userId);
        returnedUser.FirstName.Should().Be("John");

        _mockMediator.Verify(m => m.Send(It.Is<GetUserByIdQuery>(q => q.Id == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetUserById_NonExistingUser_ShouldReturnNotFound()
    {

        var userId = Guid.NewGuid();
        _mockMediator.Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);


        var result = await _controller.GetUserById(userId);


        var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().Be($"User with ID {userId} not found");
    }

    [Fact]
    public async Task CreateUser_ValidUser_ShouldReturnCreatedAtAction()
    {

        var createUserDto = new CreateUserDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "123-456-7890",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };

        var command = new CreateUserCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "123-456-7890",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };

        var createdUser = new UserDto
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

        _mockMapper.Setup(m => m.Map<CreateUserCommand>(createUserDto)).Returns(command);
        _mockMediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);


        var result = await _controller.CreateUser(createUserDto);


        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(UsersController.GetUserById));
        createdResult.RouteValues!["id"].Should().Be(createdUser.Id);
        
        var returnedUser = createdResult.Value.Should().BeOfType<UserDto>().Subject;
        returnedUser.FirstName.Should().Be("John");

        _mockMapper.Verify(m => m.Map<CreateUserCommand>(createUserDto), Times.Once);
        _mockMediator.Verify(m => m.Send(command, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateUser_ExistingUser_ShouldReturnOkWithUpdatedUser()
    {

        var userId = Guid.NewGuid();
        var updateUserDto = new UpdateUserDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.Manager
        };

        var command = new UpdateUserCommand
        {
            Id = userId,
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.Manager
        };

        var updatedUser = new UserDto
        {
            Id = userId,
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.Manager,
            IsActive = true
        };

        _mockMapper.Setup(m => m.Map<UpdateUserCommand>(updateUserDto)).Returns(command);
        _mockMediator.Setup(m => m.Send(It.IsAny<UpdateUserCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUser);


        var result = await _controller.UpdateUser(userId, updateUserDto);


        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUser = okResult.Value.Should().BeOfType<UserDto>().Subject;
        returnedUser.Id.Should().Be(userId);
        returnedUser.FirstName.Should().Be("Jane");

        _mockMapper.Verify(m => m.Map<UpdateUserCommand>(updateUserDto), Times.Once);
        _mockMediator.Verify(m => m.Send(It.Is<UpdateUserCommand>(c => c.Id == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateUser_NonExistingUser_ShouldReturnNotFound()
    {

        var userId = Guid.NewGuid();
        var updateUserDto = new UpdateUserDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "987-654-3210",
            DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc)
        };

        var command = new UpdateUserCommand { Id = userId };
        _mockMapper.Setup(m => m.Map<UpdateUserCommand>(updateUserDto)).Returns(command);
        _mockMediator.Setup(m => m.Send(It.IsAny<UpdateUserCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException());


        var result = await _controller.UpdateUser(userId, updateUserDto);


        var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().Be($"User with ID {userId} not found");
    }

    [Fact]
    public async Task DeleteUser_ExistingUser_ShouldReturnNoContent()
    {

        var userId = Guid.NewGuid();
        _mockMediator.Setup(m => m.Send(It.IsAny<DeleteUserCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);


        var result = await _controller.DeleteUser(userId);


        result.Should().BeOfType<NoContentResult>();

        _mockMediator.Verify(m => m.Send(It.Is<DeleteUserCommand>(c => c.Id == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteUser_NonExistingUser_ShouldReturnNotFound()
    {

        var userId = Guid.NewGuid();
        _mockMediator.Setup(m => m.Send(It.IsAny<DeleteUserCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);


        var result = await _controller.DeleteUser(userId);


        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().Be($"User with ID {userId} not found");
    }

    [Fact]
    public async Task SearchUsers_WithSearchTerm_ShouldReturnMatchingUsers()
    {

        var searchTerm = "john";
        var users = new List<UserDto>
        {
            new UserDto
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Role = UserRole.User,
                IsActive = true
            }
        };

        _mockMediator.Setup(m => m.Send(It.IsAny<SearchUsersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);


        var result = await _controller.SearchUsers(searchTerm);


        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUsers = okResult.Value.Should().BeAssignableTo<IEnumerable<UserDto>>().Subject;
        returnedUsers.Should().HaveCount(1);

        _mockMediator.Verify(m => m.Send(It.Is<SearchUsersQuery>(q => q.SearchTerm == searchTerm), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SearchUsers_WithNullSearchTerm_ShouldUseEmptyString()
    {

        var users = new List<UserDto>();
        _mockMediator.Setup(m => m.Send(It.IsAny<SearchUsersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);


        await _controller.SearchUsers(null!);


        _mockMediator.Verify(m => m.Send(It.Is<SearchUsersQuery>(q => q.SearchTerm == string.Empty), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ToggleUserStatus_ExistingUser_ShouldReturnOkWithUpdatedUser()
    {

        var userId = Guid.NewGuid();
        var isActive = false;
        var updatedUser = new UserDto
        {
            Id = userId,
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            IsActive = isActive
        };

        _mockMediator.Setup(m => m.Send(It.IsAny<ToggleUserStatusCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUser);


        var result = await _controller.ToggleUserStatus(userId, isActive);


        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUser = okResult.Value.Should().BeOfType<UserDto>().Subject;
        returnedUser.IsActive.Should().Be(isActive);

        _mockMediator.Verify(m => m.Send(It.Is<ToggleUserStatusCommand>(c => c.Id == userId && c.IsActive == isActive), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ToggleUserStatus_NonExistingUser_ShouldReturnNotFound()
    {

        var userId = Guid.NewGuid();
        var isActive = false;

        _mockMediator.Setup(m => m.Send(It.IsAny<ToggleUserStatusCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException());


        var result = await _controller.ToggleUserStatus(userId, isActive);


        var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().Be($"User with ID {userId} not found");
    }
}
