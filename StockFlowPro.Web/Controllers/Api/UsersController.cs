using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// API controller for managing user operations in the StockFlow Pro system.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of the <see cref="UsersController"/> class.
    /// </summary>
    /// <param name="mediator">The mediator for handling commands and queries.</param>
    /// <param name="mapper">The AutoMapper instance for object mapping.</param>
    public UsersController(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }

    private static List<UserDto> _mockUsers = new List<UserDto>
    {
        new UserDto { Id = Guid.NewGuid(), FirstName = "Test", LastName = "User", Email = "test@example.com", PhoneNumber = "123", Role = StockFlowPro.Domain.Enums.UserRole.Admin }
    };
    /// <summary>
    /// Gets all users from mock data for testing purposes.
    /// </summary>
    /// <param name="activeOnly">If true, returns only active users.</param>
    /// <returns>A collection of user DTOs.</returns>
    [HttpGet("mock")]
    public ActionResult<IEnumerable<UserDto>> GetAllUsersMock([FromQuery] bool activeOnly = false)
    {
        return Ok(_mockUsers);
    }

    /// <summary>
    /// Creates a new user in mock data for testing purposes.
    /// </summary>
    /// <param name="createUserDto">The user data for creation.</param>
    /// <returns>The created user DTO.</returns>
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

    /// <summary>
    /// Retrieves all users from the system.
    /// </summary>
    /// <param name="activeOnly">If true, returns only active users; otherwise, returns all users.</param>
    /// <returns>A collection of user DTOs.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    
    /// <summary>
    /// Retrieves a specific user by their unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user.</param>
    /// <returns>The user DTO if found; otherwise, a 404 Not Found response.</returns>
    /// <response code="200">Returns the user information.</response>
    /// <response code="404">If the user is not found.</response>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
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
    /// Retrieves a specific user by their email address.
    /// </summary>
    /// <param name="email">The email address of the user.</param>
    /// <returns>The user DTO if found; otherwise, a 404 Not Found response.</returns>
    /// <response code="200">Returns the user information.</response>
    /// <response code="404">If the user is not found.</response>
    [HttpGet("by-email/{email}")]
    [Authorize(Roles = "User,Manager,Admin")]
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
    /// Searches for users based on a search term.
    /// </summary>
    /// <param name="searchTerm">The search term to filter users by name or email.</param>
    /// <returns>A collection of user DTOs matching the search criteria.</returns>
    /// <response code="200">Returns the matching users.</response>
    [HttpGet("search")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        var query = new SearchUsersQuery { SearchTerm = searchTerm ?? string.Empty };
        var users = await _mediator.Send(query);
        return Ok(users);
    }

    /// <summary>
    /// Creates a new user in the system.
    /// </summary>
    /// <param name="createUserDto">The user data for creation.</param>
    /// <returns>The created user DTO.</returns>
    /// <response code="201">Returns the newly created user.</response>
    /// <response code="400">If the user data is invalid.</response>
    [HttpPost]
    [Authorize(Roles = "Admin")]
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
    /// Updates an existing user's information.
    /// </summary>
    /// <param name="id">The unique identifier of the user to update.</param>
    /// <param name="updateUserDto">The updated user data.</param>
    /// <returns>The updated user DTO.</returns>
    /// <response code="200">Returns the updated user information.</response>
    /// <response code="404">If the user is not found.</response>
    /// <response code="400">If the update data is invalid.</response>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
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
    /// Updates a user's email address.
    /// </summary>
    /// <param name="id">The unique identifier of the user.</param>
    /// <param name="updateEmailDto">The new email data.</param>
    /// <returns>The updated user DTO.</returns>
    /// <response code="200">Returns the updated user information.</response>
    /// <response code="404">If the user is not found.</response>
    /// <response code="400">If the email data is invalid.</response>
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

    /// <summary>
    /// Toggles a user's active status (activate or deactivate).
    /// </summary>
    /// <param name="id">The unique identifier of the user.</param>
    /// <param name="isActive">The new active status for the user.</param>
    /// <returns>The updated user DTO.</returns>
    /// <response code="200">Returns the updated user information.</response>
    /// <response code="404">If the user is not found.</response>
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

    /// <summary>
    /// Deletes a user from the system.
    /// </summary>
    /// <param name="id">The unique identifier of the user to delete.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">If the user was successfully deleted.</response>
    /// <response code="404">If the user is not found.</response>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
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

   
    /// <summary>
    /// Retrieves reporting data for managers and administrators.
    /// </summary>
    /// <returns>Reporting data accessible to managers and administrators.</returns>
    /// <response code="200">Returns the reporting data.</response>
    [HttpGet("reporting")]
    [Authorize(Roles = "Manager,Admin")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public IActionResult GetReporting()
    {
        return Ok("Reporting data for Manager and Admin");
    }

    /// <summary>
    /// Updates a user in mock data for testing purposes.
    /// </summary>
    /// <param name="id">The unique identifier of the user to update.</param>
    /// <param name="updateUserDto">The updated user data.</param>
    /// <returns>The updated user DTO.</returns>
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

    /// <summary>
    /// Deletes a user from mock data for testing purposes.
    /// </summary>
    /// <param name="id">The unique identifier of the user to delete.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("mock/{id}")]
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
