using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api.V2
{
    /// <summary>
    /// Enhanced Users API Controller for Hexagonal Architecture integration
    /// Provides comprehensive user management endpoints with improved error handling and validation
    /// </summary>
    [ApiController]
    [Route("api/v2/users")]
    [Authorize]
    [Produces("application/json")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IMediator mediator, ILogger<UsersController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Get paginated list of users with filtering and sorting
        /// </summary>
        /// <param name="search">Search term for username, email, first name, or last name</param>
        /// <param name="roleId">Filter by role ID</param>
        /// <param name="isActive">Filter by active status</param>
        /// <param name="page">Page number (1-based)</param>
        /// <param name="pageSize">Number of items per page (max 100)</param>
        /// <param name="sortBy">Sort field (username, email, firstName, lastName, createdAt)</param>
        /// <param name="sortOrder">Sort order (asc, desc)</param>
        /// <returns>Paginated list of users</returns>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<UserDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<PaginatedResponseDto<UserDto>>> GetUsers(
            [FromQuery] string? search = null,
            [FromQuery] int? roleId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "firstName",
            [FromQuery] string sortOrder = "asc")
        {
            try
            {
                // Validate pagination parameters
                if (page < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0" });
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100" });
                }

                // Validate sort parameters
                var validSortFields = new[] { "username", "email", "firstName", "lastName", "createdAt" };
                if (!validSortFields.Contains(sortBy.ToLower()))
                {
                    return BadRequest(new { message = $"Invalid sort field. Valid fields: {string.Join(", ", validSortFields)}" });
                }

                var validSortOrders = new[] { "asc", "desc" };
                if (!validSortOrders.Contains(sortOrder.ToLower()))
                {
                    return BadRequest(new { message = "Sort order must be 'asc' or 'desc'" });
                }

                // Convert roleId to UserRole enum if provided
                UserRole? role = null;
                if (roleId.HasValue)
                {
                    role = (UserRole)roleId.Value;
                }

                var query = new GetUsersQuery
                {
                    Search = search,
                    Role = role,
                    IsActive = isActive,
                    Page = page,
                    PageSize = pageSize,
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var result = await _mediator.Send(query);

                // Add pagination headers
                Response.Headers["X-Total-Count"] = result.TotalCount.ToString();
                Response.Headers["X-Page-Count"] = result.TotalPages.ToString();
                Response.Headers["X-Current-Page"] = result.CurrentPage.ToString();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "An error occurred while retrieving users" });
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User details</returns>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(UserDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<UserDto>> GetUser(Guid id)
        {
            try
            {
                var query = new GetUserByIdQuery { Id = id };
                var user = await _mediator.Send(query);

                if (user == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the user" });
            }
        }

        /// <summary>
        /// Get current authenticated user
        /// </summary>
        /// <returns>Current user details</returns>
        [HttpGet("current")]
        [ProducesResponseType(typeof(UserDto), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                {
                    return Unauthorized(new { message = "Invalid user session" });
                }

                var query = new GetUserByIdQuery { Id = userId };
                var user = await _mediator.Send(query);

                if (user == null)
                {
                    return Unauthorized(new { message = "User session is invalid" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, new { message = "An error occurred while retrieving user information" });
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        /// <param name="request">User creation request</param>
        /// <returns>Created user</returns>
        [HttpPost]
        [ProducesResponseType(typeof(UserDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(409)]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var command = new CreateUserCommand
                {
                    Username = request.Username,
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Password = request.Password,
                    RoleId = request.RoleId,
                    Role = (UserRole)request.RoleId,
                    DateOfBirth = request.DateOfBirth ?? DateTime.Now.AddYears(-18)
                };

                var user = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "An error occurred while creating the user" });
            }
        }

        /// <summary>
        /// Update an existing user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="request">User update request</param>
        /// <returns>Updated user</returns>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(UserDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var command = new UpdateUserCommand
                {
                    Id = id,
                    Username = request.Username,
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    RoleId = request.RoleId,
                    IsActive = request.IsActive
                };

                var user = await _mediator.Send(command);
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the user" });
            }
        }

        /// <summary>
        /// Delete a user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>No content</returns>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                // Prevent users from deleting themselves
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (Guid.TryParse(userIdClaim, out Guid currentUserId) && currentUserId == id)
                {
                    return BadRequest(new { message = "You cannot delete your own account" });
                }

                var command = new DeleteUserCommand { Id = id };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the user" });
            }
        }

        /// <summary>
        /// Activate a user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>No content</returns>
        [HttpPatch("{id:guid}/activate")]
        [ProducesResponseType(204)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            try
            {
                var command = new UpdateUserCommand { Id = id, IsActive = true };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating user {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while activating the user" });
            }
        }

        /// <summary>
        /// Deactivate a user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>No content</returns>
        [HttpPatch("{id:guid}/deactivate")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            try
            {
                // Prevent users from deactivating themselves
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (Guid.TryParse(userIdClaim, out Guid currentUserId) && currentUserId == id)
                {
                    return BadRequest(new { message = "You cannot deactivate your own account" });
                }

                var command = new UpdateUserCommand { Id = id, IsActive = false };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while deactivating the user" });
            }
        }
    }

    /// <summary>
    /// Request model for creating a user
    /// </summary>
    public class CreateUserRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Range(1, 3)]
        public int RoleId { get; set; }

        public DateTime? DateOfBirth { get; set; }
    }

    /// <summary>
    /// Request model for updating a user
    /// </summary>
    public class UpdateUserRequest
    {
        [StringLength(50, MinimumLength = 3)]
        public string? Username { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [Range(1, 3)]
        public int? RoleId { get; set; }

        public bool? IsActive { get; set; }
    }
}