using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Web.Configuration;
using StockFlowPro.Web.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[PublicApi] // Apply basic security for public endpoints
public class AuthController : ControllerBase
{
    private readonly IUserAuthenticationService _authenticationService;
    private readonly IRoleService _roleService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUserAuthenticationService authenticationService, IRoleService roleService, ILogger<AuthController> logger)
    {
        _authenticationService = authenticationService;
        _roleService = roleService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var user = await _authenticationService.AuthenticateAsync(request.Username, request.Password);
        if (user != null)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            var claimsIdentity = new ClaimsIdentity(claims, EnvironmentConfig.CookieAuthName);
            var authProperties = new AuthenticationProperties { IsPersistent = true };
            await HttpContext.SignInAsync(EnvironmentConfig.CookieAuthName, new ClaimsPrincipal(claimsIdentity), authProperties);

            return Ok(new 
            { 
                message = "Login successful",
                user = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    fullName = user.FullName,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    dateOfBirth = user.DateOfBirth.ToString("yyyy-MM-dd"),
                    role = (int)user.Role,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    updatedAt = user.UpdatedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                }
            });
        }

        return Unauthorized(new { message = "Invalid credentials" });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(EnvironmentConfig.CookieAuthName);
        return Ok(new { message = "Logout successful" });
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Created user information</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

            // Validate request
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                _logger.LogWarning("Registration validation failed for email: {Email}. Errors: {Errors}", 
                    request.Email, string.Join(", ", errors));
                
                return BadRequest(new { 
                    message = "Validation failed", 
                    errors = errors 
                });
            }

            // Convert to RegisterUserDto
            var registerUserDto = new RegisterUserDto
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber ?? string.Empty,
                DateOfBirth = request.DateOfBirth,
                Password = request.Password,
                ConfirmPassword = request.ConfirmPassword,
                Role = Domain.Enums.UserRole.User // Default role for public registration
            };

            // Register the user
            var user = await _authenticationService.RegisterAsync(registerUserDto);

            _logger.LogInformation("User registered successfully: {UserId} - {Email}", user.Id, user.Email);

            // Return success response (don't auto-login for security)
            return CreatedAtAction(nameof(Register), new { id = user.Id }, new
            {
                message = "Registration successful",
                user = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    fullName = user.FullName,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    dateOfBirth = user.DateOfBirth.ToString("yyyy-MM-dd"),
                    role = (int)user.Role,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    updatedAt = user.UpdatedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                }
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Registration failed due to validation: {Email} - {Error}", request.Email, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed due to business rule: {Email} - {Error}", request.Email, ex.Message);
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for email: {Email}", request.Email);
            return StatusCode(500, new { message = "An error occurred during registration. Please try again." });
        }
    }

    /// <summary>
    /// Initiate password reset process
    /// </summary>
    /// <param name="request">Email for password reset</param>
    /// <returns>Success message</returns>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            var token = await _authenticationService.GeneratePasswordResetTokenAsync(request.Email);
            
            // Always return success to prevent email enumeration attacks
            return Ok(new { 
                message = "If an account with that email exists, a password reset link has been sent." 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset request for email: {Email}", request.Email);
            return Ok(new { 
                message = "If an account with that email exists, a password reset link has been sent." 
            });
        }
    }

    /// <summary>
    /// Reset password using token
    /// </summary>
    /// <param name="request">Password reset details</param>
    /// <returns>Success message</returns>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(new { 
                    message = "Validation failed", 
                    errors = errors 
                });
            }

            var success = await _authenticationService.ResetPasswordAsync(
                request.Email, 
                request.Token, 
                request.NewPassword);

            if (success)
            {
                _logger.LogInformation("Password reset successful for email: {Email}", request.Email);
                return Ok(new { message = "Password reset successful" });
            }

            _logger.LogWarning("Password reset failed for email: {Email}", request.Email);
            return BadRequest(new { message = "Invalid or expired reset token" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset for email: {Email}", request.Email);
            return StatusCode(500, new { message = "An error occurred during password reset. Please try again." });
        }
    }

    /// <summary>
    /// Change password for authenticated user
    /// </summary>
    /// <param name="request">Password change details</param>
    /// <returns>Success message</returns>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user session" });
            }

            _logger.LogInformation("Password change attempt for user: {UserId}", userId);

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(new { 
                    message = "Validation failed", 
                    errors = errors 
                });
            }

            var success = await _authenticationService.ChangePasswordAsync(
                userId, 
                request.CurrentPassword, 
                request.NewPassword);

            if (success)
            {
                _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
                return Ok(new { message = "Password changed successfully" });
            }

            _logger.LogWarning("Password change failed for user: {UserId}", userId);
            return BadRequest(new { message = "Current password is incorrect" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password change for user");
            return StatusCode(500, new { message = "An error occurred during password change. Please try again." });
        }
    }

    /// <summary>
    /// Get available roles for registration
    /// </summary>
    /// <returns>List of available roles</returns>
    [HttpGet("available-roles")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailableRoles()
    {
        try
        {
            var roleOptions = await _roleService.GetRoleOptionsAsync();
            var roles = roleOptions.Select(r => new { 
                value = r.Name, 
                label = r.DisplayName 
            });

            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving available roles from database");
            
            // Fallback to enum values if database query fails
            var fallbackRoles = Enum.GetNames(typeof(Domain.Enums.UserRole))
                .Select(r => new { value = r, label = r });

            return Ok(fallbackRoles);
        }
    }
}

// Request DTOs
public class LoginRequest
{
    [Required(ErrorMessage = "Username is required")]
    public string Username { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required(ErrorMessage = "First name is required")]
    [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Last name is required")]
    [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
    public string LastName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    public string Email { get; set; } = string.Empty;
    
    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
    public string? PhoneNumber { get; set; }
    
    [Required(ErrorMessage = "Date of birth is required")]
    [DataType(DataType.Date)]
    public DateTime DateOfBirth { get; set; }
    
    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string Password { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare("Password", ErrorMessage = "Password and confirmation password do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Reset token is required")]
    public string Token { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "New password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string NewPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare("NewPassword", ErrorMessage = "Password and confirmation password do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "New password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string NewPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare("NewPassword", ErrorMessage = "Password and confirmation password do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}