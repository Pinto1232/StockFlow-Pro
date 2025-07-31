using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Shared.Models;
using StockFlowPro.Web.Authorization;
using StockFlowPro.Web.Extensions;
using StockFlowPro.Web.Attributes;

namespace StockFlowPro.Web.Controllers.Api;

[Route("api/[controller]")]
[ApiDocumentation("User Management", "Comprehensive user management operations including CRUD operations, authentication, and permissions", Category = "User Management")]
public class UsersController : ApiBaseController
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;
    private readonly IPermissionService _permissionService;

    public UsersController(IMediator mediator, IMapper mapper, IPermissionService permissionService)
    {
        _mediator = mediator;
        _mapper = mapper;
        _permissionService = permissionService;
    }

    private static List<UserDto> _mockUsers = new List<UserDto>
    {
        new UserDto { Id = Guid.NewGuid(), FirstName = "Test", LastName = "User", Email = "test@example.com", PhoneNumber = "123", Role = StockFlowPro.Domain.Enums.UserRole.Admin }
    };
    [HttpGet("mock")]
    public ActionResult<IEnumerable<UserDto>> GetAllUsersMock([FromQuery] bool activeOnly = false)
    {
        return Ok(_mockUsers);
    }

    [HttpPost("mock")]
    public ActionResult<UserDto> CreateUserMock([FromBody] CreateUserDto createUserDto)
    {
        var user = new UserDto
        {
            Id = Guid.NewGuid(),
            FirstName = createUserDto.FirstName,
            LastName = createUserDto.LastName,
            Email = createUserDto.Email,
            PhoneNumber = createUserDto.PhoneNumber,
            DateOfBirth = createUserDto.DateOfBirth,
            Role = createUserDto.Role
        };
        _mockUsers.Add(user);
        return CreatedAtAction(nameof(GetAllUsersMock), new { id = user.Id }, user);
    }

    [HttpGet]
    [Permission(Permissions.Users.ViewAll)]
    [ApiDocumentation(
        "Get All Users",
        "Retrieves a list of all users in the system with optional filtering by active status. Supports pagination and role-based access control.",
        RequiredPermissions = new[] { "Users.ViewAll" },
        RateLimit = "100 requests per minute",
        CacheInfo = "Cached for 5 minutes"
    )]
    [ApiExample(ExampleType.Response, "Success Response", @"{
        ""success"": true,
        ""data"": [
            {
                ""id"": ""550e8400-e29b-41d4-a716-446655440000"",
                ""firstName"": ""John"",
                ""lastName"": ""Doe"",
                ""fullName"": ""John Doe"",
                ""email"": ""john.doe@example.com"",
                ""phoneNumber"": ""+1-555-0123"",
                ""dateOfBirth"": ""1990-01-01T00:00:00Z"",
                ""age"": 34,
                ""isActive"": true,
                ""createdAt"": ""2024-01-01T00:00:00Z"",
                ""updatedAt"": ""2024-01-01T00:00:00Z"",
                ""role"": ""User""
            }
        ],
        ""message"": ""Users retrieved successfully"",
        ""timestamp"": ""2024-01-01T00:00:00Z""
    }")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [Permission(Permissions.Users.View)]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
        if (!CanAccessUser(id) && !User.HasPermission(Permissions.Users.ViewAll))
        {
            return Forbid("You can only access your own user information.");
        }

        var query = new GetUserByIdQuery { Id = id };
        var user = await _mediator.Send(query);
        
        if (user == null)
        {
            return NotFound($"User with ID {id} not found");
        }

        return Ok(user);
    }

    [HttpGet("by-email/{email}")]
    [Permission(Permissions.Users.ViewAll)]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
    {
        var query = new GetUserByEmailQuery { Email = email };
        var user = await _mediator.Send(query);
        
        if (user == null)
        {
            return NotFound($"User with email {email} not found");
        }

        return Ok(user);
    }

    [HttpGet("search")]
    [Permission(Permissions.Users.ViewAll)]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        var query = new SearchUsersQuery { SearchTerm = searchTerm ?? string.Empty };
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    [HttpPost]
    [Permission(Permissions.Users.Create)]
    [ApiDocumentation(
        "Create New User",
        "Creates a new user account in the system with the provided information. Validates email uniqueness and enforces business rules.",
        RequiredPermissions = new[] { "Users.Create" },
        Notes = "Email addresses must be unique across the system. Password will be auto-generated and sent via email."
    )]
    [ApiExample(ExampleType.Request, "Create User Request", @"{
        ""firstName"": ""John"",
        ""lastName"": ""Doe"",
        ""email"": ""john.doe@example.com"",
        ""phoneNumber"": ""+1-555-0123"",
        ""dateOfBirth"": ""1990-01-01T00:00:00Z"",
        ""role"": ""User""
    }")]
    [ApiExample(ExampleType.Response, "Created User Response", @"{
        ""success"": true,
        ""data"": {
            ""id"": ""550e8400-e29b-41d4-a716-446655440000"",
            ""firstName"": ""John"",
            ""lastName"": ""Doe"",
            ""fullName"": ""John Doe"",
            ""email"": ""john.doe@example.com"",
            ""phoneNumber"": ""+1-555-0123"",
            ""dateOfBirth"": ""1990-01-01T00:00:00Z"",
            ""age"": 34,
            ""isActive"": true,
            ""createdAt"": ""2024-01-01T00:00:00Z"",
            ""updatedAt"": ""2024-01-01T00:00:00Z"",
            ""role"": ""User""
        },
        ""message"": ""User created successfully"",
        ""timestamp"": ""2024-01-01T00:00:00Z""
    }", StatusCode = 201)]
    [ApiExample(ExampleType.Error, "Validation Error", @"{
        ""success"": false,
        ""message"": ""Validation failed"",
        ""errors"": [
            ""Email address is already in use"",
            ""Phone number format is invalid""
        ],
        ""timestamp"": ""2024-01-01T00:00:00Z""
    }", StatusCode = 422)]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        var command = _mapper.Map<CreateUserCommand>(createUserDto);
        var user = await _mediator.Send(command);
        
        return CreatedAtAction(
            nameof(GetUserById), 
            new { id = user.Id }, 
            user);
    }

    [HttpPut("{id:guid}")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto updateUserDto)
    {
        if (!User.CanAccessUser(id) && !User.HasPermission(Permissions.Users.ViewAll))
        {
            return Forbid("You can only edit your own user information.");
        }

        var command = _mapper.Map<UpdateUserCommand>(updateUserDto);
        command.Id = id;
        
        try
        {
            var user = await _mediator.Send(command);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"User with ID {id} not found");
        }
    }

    [HttpPut("{id:guid}/email")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> UpdateUserEmail(Guid id, [FromBody] UpdateUserEmailDto updateEmailDto)
    {
        var command = _mapper.Map<UpdateUserEmailCommand>(updateEmailDto);
        command.Id = id;
        
        try
        {
            var user = await _mediator.Send(command);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"User with ID {id} not found");
        }
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> ToggleUserStatus(Guid id, [FromBody] bool isActive)
    {
        var command = new ToggleUserStatusCommand { Id = id, IsActive = isActive };
        
        try
        {
            var user = await _mediator.Send(command);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"User with ID {id} not found");
        }
    }

    [HttpDelete("{id:guid}")]
    [Permission(Permissions.Users.Delete)]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var command = new DeleteUserCommand { Id = id };
        var result = await _mediator.Send(command);
        
        if (!result)
        {
            return NotFound($"User with ID {id} not found");
        }

        return NoContent();
    }

    [HttpGet("reporting")]
    [Permission(Permissions.Reports.ViewAdvanced)]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public IActionResult GetReporting()
    {
        return Ok("Reporting data for Manager and Admin");
    }

    [HttpPut("mock/{id}")]
    public ActionResult<UserDto> UpdateUserMock(Guid id, [FromBody] CreateUserDto updateUserDto)
    {
        var user = _mockUsers.FirstOrDefault(u => u.Id == id);
        if (user == null)
        {
            return NotFound();
        }
        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.Email = updateUserDto.Email;
        user.PhoneNumber = updateUserDto.PhoneNumber;
        user.DateOfBirth = updateUserDto.DateOfBirth;
        user.Role = updateUserDto.Role;
        return Ok(user);
    }

    [HttpDelete("mock/{id}")]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can delete mock users
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult DeleteUserMock(Guid id)
    {
        var user = _mockUsers.FirstOrDefault(u => u.Id == id);
        if (user == null)
        {
            return NotFound();
        }
        
        _mockUsers.Remove(user);
        return NoContent();
    }

    /// <summary>
    /// Gets permissions for a specific user.
    /// </summary>
    [HttpGet("{id:guid}/permissions")]
    [Authorize]
    public async Task<ActionResult<UserPermissionsDto>> GetUserPermissions(Guid id)
    {
        try
        {
            // Check if user can access this information
            if (!User.CanAccessUser(id) && !User.HasPermission(Permissions.Users.ViewAll))
            {
                return Forbid("You can only access your own permissions.");
            }

            var permissions = await _permissionService.GetUserPermissionsAsync(id);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve user permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets permissions for the current user.
    /// </summary>
    [HttpGet("me/permissions")]
    [Authorize]
    public async Task<ActionResult<UserPermissionsDto>> GetCurrentUserPermissions()
    {
        try
        {
            var userId = User.GetUserId();
            if (userId == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var permissions = await _permissionService.GetUserPermissionsAsync(userId.Value);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve current user permissions", error = ex.Message });
        }
    }
}
