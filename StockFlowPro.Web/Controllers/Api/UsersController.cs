using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;

    public UsersController(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    /// <param name="activeOnly">Filter to show only active users</param>
    /// <returns>List of users</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
        var query = new GetUserByIdQuery { Id = id };
        var user = await _mediator.Send(query);
        
        if (user == null)
        {
            return NotFound($"User with ID {id} not found");
        }

        return Ok(user);
    }

    /// <summary>
    /// Get user by email
    /// </summary>
    /// <param name="email">User email</param>
    /// <returns>User details</returns>
    [HttpGet("by-email/{email}")]
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

    /// <summary>
    /// Search users
    /// </summary>
    /// <param name="searchTerm">Search term to filter users</param>
    /// <returns>List of matching users</returns>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        var query = new SearchUsersQuery { SearchTerm = searchTerm ?? string.Empty };
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <param name="createUserDto">User creation data</param>
    /// <returns>Created user</returns>
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        var command = _mapper.Map<CreateUserCommand>(createUserDto);
        var user = await _mediator.Send(command);
        
        return CreatedAtAction(
            nameof(GetUserById), 
            new { id = user.Id }, 
            user);
    }

    /// <summary>
    /// Update user personal information
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="updateUserDto">User update data</param>
    /// <returns>Updated user</returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto updateUserDto)
    {
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

    /// <summary>
    /// Update user email
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="updateEmailDto">Email update data</param>
    /// <returns>Updated user</returns>
    [HttpPut("{id:guid}/email")]
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

    /// <summary>
    /// Toggle user active status
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="isActive">New active status</param>
    /// <returns>Updated user</returns>
    [HttpPatch("{id:guid}/status")]
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

    /// <summary>
    /// Delete a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:guid}")]
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
}