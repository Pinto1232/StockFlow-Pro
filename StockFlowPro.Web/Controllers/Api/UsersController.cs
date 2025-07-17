using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Shared.Models;
using StockFlowPro.Web.Authorization;
using StockFlowPro.Web.Extensions;

namespace StockFlowPro.Web.Controllers.Api;

[Route("api/[controller]")]
public class UsersController : ApiBaseController
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;

    public UsersController(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }

    private static List<UserDto> _mockUsers = new List<UserDto>
    {
        new UserDto { Id = Guid.NewGuid(), FirstName = "Test", LastName = "User", Email = "test@example.com", PhoneNumber = "123", Role = StockFlowPro.Domain.Enums.UserRole.Admin }
    };
    [HttpGet("mock")]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can access mock data endpoints
    public ActionResult<IEnumerable<UserDto>> GetAllUsersMock([FromQuery] bool activeOnly = false)
    {
        return Ok(_mockUsers);
    }

    [HttpPost("mock")]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can create mock users
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
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        try
        {
            // Check if user is authenticated
            if (!IsAuthenticated)
            {
                return UnauthorizedResponse<IEnumerable<UserDto>>("Authentication required");
            }

            var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
            var users = await _mediator.Send(query);
            
            return SuccessResponse(users, $"Retrieved {users.Count()} users from database");
        }
        catch (Exception ex)
        {
            return HandleException<IEnumerable<UserDto>>(ex, "Failed to retrieve users");
        }
    }

    [HttpGet("{id:guid}")]
    [Permission(Permissions.Users.View)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(Guid id)
    {
        if (!CanAccessUser(id) && !User.HasPermission(Permissions.Users.ViewAll))
        {
            return ForbiddenResponse<UserDto>("You can only access your own user information.");
        }

        try
        {
            var query = new GetUserByIdQuery { Id = id };
            var user = await _mediator.Send(query);
            
            if (user == null)
            {
                return NotFoundResponse<UserDto>($"User with ID {id} not found");
            }

            return SuccessResponse(user, "User retrieved successfully from database");
        }
        catch (Exception ex)
        {
            return HandleException<UserDto>(ex, $"Failed to retrieve user with ID {id}");
        }
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
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can update mock users
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
}
