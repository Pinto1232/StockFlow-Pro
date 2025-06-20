using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Web.Services;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// Hybrid API controller that can switch between mock data and database based on configuration.
/// </summary>
[ApiController]
[Route("api/hybrid/[controller]")]
public class HybridUsersController : ControllerBase
{
    private readonly IDataSourceService _dataSourceService;

    public HybridUsersController(IDataSourceService dataSourceService)
    {
        _dataSourceService = dataSourceService;
    }

    /// <summary>
    /// Gets information about the current data source being used.
    /// </summary>
    /// <returns>Information about the current data source.</returns>
    [HttpGet("datasource")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult GetDataSourceInfo()
    {
        return Ok(new { DataSource = _dataSourceService.GetCurrentDataSource() });
    }

    /// <summary>
    /// Retrieves all users from the configured data source.
    /// </summary>
    /// <param name="activeOnly">If true, returns only active users.</param>
    /// <returns>A collection of user DTOs.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        var users = await _dataSourceService.GetAllUsersAsync(activeOnly);
        return Ok(users);
    }

    /// <summary>
    /// Retrieves a specific user by their unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user.</param>
    /// <returns>The user DTO if found; otherwise, a 404 Not Found response.</returns>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
        var user = await _dataSourceService.GetUserByIdAsync(id);
        
        if (user == null)
        {
            return NotFound($"User with ID {id} not found in {_dataSourceService.GetCurrentDataSource()}");
        }

        return Ok(user);
    }

    /// <summary>
    /// Retrieves a specific user by their email address.
    /// </summary>
    /// <param name="email">The email address of the user.</param>
    /// <returns>The user DTO if found; otherwise, a 404 Not Found response.</returns>
    [HttpGet("by-email/{email}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
    {
        var user = await _dataSourceService.GetUserByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound($"User with email {email} not found in {_dataSourceService.GetCurrentDataSource()}");
        }

        return Ok(user);
    }

    /// <summary>
    /// Searches for users based on a search term.
    /// </summary>
    /// <param name="searchTerm">The search term to filter users by name or email.</param>
    /// <returns>A collection of user DTOs matching the search criteria.</returns>
    [HttpGet("search")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        var users = await _dataSourceService.SearchUsersAsync(searchTerm ?? string.Empty);
        return Ok(users);
    }

    /// <summary>
    /// Creates a new user in the configured data source.
    /// </summary>
    /// <param name="createUserDto">The user data for creation.</param>
    /// <returns>The created user DTO.</returns>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        var user = await _dataSourceService.CreateUserAsync(createUserDto);
        
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
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto updateUserDto)
    {
        var user = await _dataSourceService.UpdateUserAsync(id, updateUserDto);
        
        if (user == null)
        {
            return NotFound($"User with ID {id} not found in {_dataSourceService.GetCurrentDataSource()}");
        }

        return Ok(user);
    }

    /// <summary>
    /// Deletes a user from the configured data source.
    /// </summary>
    /// <param name="id">The unique identifier of the user to delete.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var result = await _dataSourceService.DeleteUserAsync(id);
        
        if (!result)
        {
            return NotFound($"User with ID {id} not found in {_dataSourceService.GetCurrentDataSource()}");
        }

        return NoContent();
    }
}