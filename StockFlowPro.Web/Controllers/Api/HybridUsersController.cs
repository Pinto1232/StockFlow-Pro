using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Web.Services;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/hybrid/[controller]")]
public class HybridUsersController : ControllerBase
{
    private readonly IDataSourceService _dataSourceService;

    public HybridUsersController(IDataSourceService dataSourceService)
    {
        _dataSourceService = dataSourceService;
    }

    [HttpGet("datasource")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult GetDataSourceInfo()
    {
        return Ok(new { DataSource = _dataSourceService.GetCurrentDataSource() });
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers([FromQuery] bool activeOnly = false)
    {
        var users = await _dataSourceService.GetAllUsersAsync(activeOnly);
        return Ok(users);
    }

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

    [HttpGet("search")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string searchTerm)
    {
        var users = await _dataSourceService.SearchUsersAsync(searchTerm ?? string.Empty);
        return Ok(users);
    }

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
