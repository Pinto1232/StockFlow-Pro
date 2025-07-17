using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Shared.Models;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// Base controller for API endpoints providing common functionality
/// </summary>
[ApiController]
public abstract class ApiBaseController : ControllerBase
{
    /// <summary>
    /// Gets a value indicating whether the current user is authenticated
    /// </summary>
    protected bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    /// <summary>
    /// Gets the current user's ID from claims
    /// </summary>
    protected Guid? CurrentUserId
    {
        get
        {
            var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    /// <summary>
    /// Checks if the current user can access the specified user's data
    /// </summary>
    /// <param name="userId">The user ID to check access for</param>
    /// <returns>True if the user can access the data, false otherwise</returns>
    protected bool CanAccessUser(Guid userId)
    {
        return CurrentUserId == userId;
    }

    /// <summary>
    /// Creates a successful API response
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="data">The data to return</param>
    /// <param name="message">Optional success message</param>
    /// <returns>A successful API response</returns>
    protected ActionResult<ApiResponse<T>> SuccessResponse<T>(T data, string message = "Operation completed successfully")
    {
        return Ok(new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Creates an unauthorized API response
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="message">The error message</param>
    /// <returns>An unauthorized API response</returns>
    protected ActionResult<ApiResponse<T>> UnauthorizedResponse<T>(string message = "Unauthorized access")
    {
        return Unauthorized(new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Creates a forbidden API response
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="message">The error message</param>
    /// <returns>A forbidden API response</returns>
    protected ActionResult<ApiResponse<T>> ForbiddenResponse<T>(string message = "Access forbidden")
    {
        return StatusCode(403, new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Creates a not found API response
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="message">The error message</param>
    /// <returns>A not found API response</returns>
    protected ActionResult<ApiResponse<T>> NotFoundResponse<T>(string message = "Resource not found")
    {
        return NotFound(new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Creates a bad request API response
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="message">The error message</param>
    /// <returns>A bad request API response</returns>
    protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message = "Bad request")
    {
        return BadRequest(new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Handles exceptions and returns appropriate error responses
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="ex">The exception that occurred</param>
    /// <param name="message">Custom error message</param>
    /// <returns>An error API response</returns>
    protected ActionResult<ApiResponse<T>> HandleException<T>(Exception ex, string message = "An error occurred")
    {
        // Log the exception (you might want to inject ILogger here)
        // For now, we'll just return a generic error response
        
        return StatusCode(500, new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Timestamp = DateTime.UtcNow,
            // In development, you might want to include the exception details
            // Error = ex.Message // Only include in development
        });
    }

    /// <summary>
    /// Creates a validation error response
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <param name="errors">List of validation errors</param>
    /// <returns>A validation error API response</returns>
    protected ActionResult<ApiResponse<T>> ValidationErrorResponse<T>(List<string> errors)
    {
        return BadRequest(new ApiResponse<T>
        {
            Success = false,
            Message = "Validation failed",
            Timestamp = DateTime.UtcNow,
            Errors = errors
        });
    }

    /// <summary>
    /// Creates a validation error response from ModelState
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    /// <returns>A validation error API response</returns>
    protected ActionResult<ApiResponse<T>> ValidationErrorResponse<T>()
    {
        var errors = ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value?.Errors.Select(e => $"{kvp.Key}: {e.ErrorMessage}") ?? Enumerable.Empty<string>())
            .ToList();

        return ValidationErrorResponse<T>(errors);
    }
}