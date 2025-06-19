using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
public class OptimizedUsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;
    private readonly ILogger<OptimizedUsersController> _logger;

    public OptimizedUsersController(
        IMediator mediator, 
        IMapper mapper, 
        IMemoryCache cache,
        ILogger<OptimizedUsersController> logger)
    {
        _mediator = mediator;
        _mapper = mapper;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers(
        [FromQuery] bool activeOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            var cacheKey = $"users_active_{activeOnly}_page_{page}_size_{pageSize}";
            
            if (_cache.TryGetValue(cacheKey, out IEnumerable<UserDto>? cachedUsers))
            {
                _logger.LogInformation("Returning cached users for key: {CacheKey}", cacheKey);
                return Ok(cachedUsers);
            }

            var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
            var users = await _mediator.Send(query, cancellationToken);
            
            var paginatedUsers = users
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                SlidingExpiration = TimeSpan.FromMinutes(2)
            };
            
            _cache.Set(cacheKey, paginatedUsers, cacheOptions);

            Response.Headers["X-Total-Count"] = users.Count().ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(paginatedUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, "An error occurred while retrieving users");
        }
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> GetUserById(
        Guid id, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = $"user_{id}";
            
            if (_cache.TryGetValue(cacheKey, out UserDto? cachedUser))
            {
                return Ok(cachedUser);
            }

            var query = new GetUserByIdQuery { Id = id };
            var user = await _mediator.Send(query, cancellationToken);
            
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            _cache.Set(cacheKey, user, TimeSpan.FromMinutes(10));

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, "An error occurred while retrieving the user");
        }
    }

    [HttpGet("search")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers(
        [FromQuery, Required, MinLength(2)] string searchTerm,
        [FromQuery] int maxResults = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2)
            {
                return BadRequest("Search term must be at least 2 characters long");
            }

            if (maxResults < 1 || maxResults > 50) maxResults = 20;

            var cacheKey = $"search_{searchTerm.ToLowerInvariant()}_{maxResults}";
            
            if (_cache.TryGetValue(cacheKey, out IEnumerable<UserDto>? cachedResults))
            {
                return Ok(cachedResults);
            }

            var query = new SearchUsersQuery { SearchTerm = searchTerm };
            var users = await _mediator.Send(query, cancellationToken);
            
            var limitedResults = users.Take(maxResults).ToList();

            _cache.Set(cacheKey, limitedResults, TimeSpan.FromMinutes(2));

            return Ok(limitedResults);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users with term: {SearchTerm}", searchTerm);
            return StatusCode(500, "An error occurred while searching users");
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserDto createUserDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var command = _mapper.Map<CreateUserCommand>(createUserDto);
            var user = await _mediator.Send(command, cancellationToken);
            
            InvalidateUserCaches();
            
            return CreatedAtAction(
                nameof(GetUserById), 
                new { id = user.Id }, 
                user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, "An error occurred while creating the user");
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "User,Manager,Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(
        Guid id, 
        [FromBody] UpdateUserDto updateUserDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var command = _mapper.Map<UpdateUserCommand>(updateUserDto);
            command.Id = id;
            
            var user = await _mediator.Send(command, cancellationToken);
            
            _cache.Remove($"user_{id}");
            InvalidateUserCaches();
            
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"User with ID {id} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, "An error occurred while updating the user");
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var command = new DeleteUserCommand { Id = id };
            var result = await _mediator.Send(command, cancellationToken);
            
            if (!result)
            {
                return NotFound($"User with ID {id} not found");
            }

            _cache.Remove($"user_{id}");
            InvalidateUserCaches();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, "An error occurred while deleting the user");
        }
    }

    [HttpGet("statistics")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<object>> GetUserStatistics(CancellationToken cancellationToken = default)
    {
        try
        {
            const string cacheKey = "user_statistics";
            
            if (_cache.TryGetValue(cacheKey, out object? cachedStats))
            {
                return Ok(cachedStats);
            }

            var query = new GetAllUsersQuery { ActiveOnly = false };
            var users = await _mediator.Send(query, cancellationToken);
            
            var stats = new
            {
                TotalUsers = users.Count(),
                ActiveUsers = users.Count(u => u.IsActive),
                InactiveUsers = users.Count(u => !u.IsActive),
                AdminUsers = users.Count(u => u.Role == Domain.Enums.UserRole.Admin),
                ManagerUsers = users.Count(u => u.Role == Domain.Enums.UserRole.Manager),
                RegularUsers = users.Count(u => u.Role == Domain.Enums.UserRole.User),
                LastUpdated = DateTime.UtcNow
            };

            _cache.Set(cacheKey, stats, TimeSpan.FromMinutes(15));

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user statistics");
            return StatusCode(500, "An error occurred while retrieving statistics");
        }
    }

    private void InvalidateUserCaches()
    {
        var cacheKeys = new[]
        {
            "user_statistics"
        };

        foreach (var key in cacheKeys)
        {
            _cache.Remove(key);
        }
    }
}
