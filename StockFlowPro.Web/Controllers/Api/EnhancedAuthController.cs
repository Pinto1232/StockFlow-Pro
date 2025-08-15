using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Web.Services;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/enhanced-auth")]
[PublicApi]
public class EnhancedAuthController : ControllerBase
{
    private readonly IUserAuthenticationService _authenticationService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<EnhancedAuthController> _logger;

    public EnhancedAuthController(
        IUserAuthenticationService authenticationService,
        IUserRepository userRepository,
        ILogger<EnhancedAuthController> logger)
    {
        _authenticationService = authenticationService;
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Enhanced registration endpoint with comprehensive data verification
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Created user information with verification details</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterWithVerification([FromBody] EnhancedRegisterRequest request)
    {
        var registrationId = Guid.NewGuid().ToString("N")[..8];
        
        try
        {
            _logger.LogInformation("Enhanced registration attempt {RegistrationId} for email: {Email}", 
                registrationId, request.Email);

            // Step 1: Validate request
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                _logger.LogWarning("Registration {RegistrationId} validation failed for email: {Email}. Errors: {Errors}", 
                    registrationId, request.Email, string.Join(", ", errors));
                
                return BadRequest(new { 
                    registrationId = registrationId,
                    message = "Validation failed", 
                    errors = errors 
                });
            }

            // Step 2: Check if email already exists BEFORE registration
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration {RegistrationId} failed - email already exists: {Email}", 
                    registrationId, request.Email);
                
                return Conflict(new { 
                    registrationId = registrationId,
                    message = "User with this email already exists",
                    email = request.Email
                });
            }

            _logger.LogInformation("Registration {RegistrationId} - Email verification passed for: {Email}", 
                registrationId, request.Email);

            // Step 3: Convert to RegisterUserDto
            var selectedRole = Domain.Enums.UserRole.User;
            if (!string.IsNullOrWhiteSpace(request.Role)
                && Enum.TryParse<Domain.Enums.UserRole>(request.Role, true, out var parsedRole))
            {
                selectedRole = parsedRole;
            }

            var registerUserDto = new RegisterUserDto
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber ?? string.Empty,
                DateOfBirth = request.DateOfBirth,
                Password = request.Password,
                ConfirmPassword = request.ConfirmPassword,
                Role = selectedRole
            };

            // Step 4: Register the user
            _logger.LogInformation("Registration {RegistrationId} - Starting user creation for: {Email}", 
                registrationId, request.Email);
            
            var createdUser = await _authenticationService.RegisterAsync(registerUserDto);
            
            _logger.LogInformation("Registration {RegistrationId} - User creation completed. UserId: {UserId}, Email: {Email}", 
                registrationId, createdUser.Id, createdUser.Email);

            // Step 5: Verify the user was actually saved to the database
            var verificationUser = await _userRepository.GetByIdAsync(createdUser.Id);
            var emailVerificationUser = await _userRepository.GetByEmailAsync(createdUser.Email);

            var verificationResults = new
            {
                userFoundById = verificationUser != null,
                userFoundByEmail = emailVerificationUser != null,
                dataMatches = verificationUser != null && emailVerificationUser != null && 
                             verificationUser.Id == emailVerificationUser.Id,
                savedUserId = verificationUser?.Id,
                savedEmail = verificationUser?.Email,
                savedFirstName = verificationUser?.FirstName,
                savedLastName = verificationUser?.LastName,
                savedPhoneNumber = verificationUser?.PhoneNumber,
                savedDateOfBirth = verificationUser?.DateOfBirth,
                savedRole = verificationUser?.Role.ToString(),
                savedIsActive = verificationUser?.IsActive,
                savedCreatedAt = verificationUser?.CreatedAt,
                hasPasswordHash = !string.IsNullOrEmpty(verificationUser?.PasswordHash)
            };

            if (!verificationResults.userFoundById || !verificationResults.userFoundByEmail)
            {
                _logger.LogError("Registration {RegistrationId} - CRITICAL: User not found in database after creation! " +
                    "UserId: {UserId}, Email: {Email}, FoundById: {FoundById}, FoundByEmail: {FoundByEmail}", 
                    registrationId, createdUser.Id, createdUser.Email, 
                    verificationResults.userFoundById, verificationResults.userFoundByEmail);
                
                return StatusCode(500, new { 
                    registrationId = registrationId,
                    message = "User creation failed - data not persisted to database",
                    verification = verificationResults
                });
            }

            // At this point, we know verificationUser is not null because we checked above
            _logger.LogInformation("Registration {RegistrationId} - SUCCESS: User verified in database. " +
                "UserId: {UserId}, Email: {Email}, CreatedAt: {CreatedAt}", 
                registrationId, verificationUser!.Id, verificationUser.Email, verificationUser.CreatedAt);

            // Step 6: Return comprehensive success response
            return CreatedAtAction(nameof(RegisterWithVerification), new { id = createdUser.Id }, new
            {
                registrationId = registrationId,
                message = "Registration successful and verified",
                user = new
                {
                    id = createdUser.Id,
                    firstName = createdUser.FirstName,
                    lastName = createdUser.LastName,
                    email = createdUser.Email,
                    phoneNumber = createdUser.PhoneNumber,
                    dateOfBirth = createdUser.DateOfBirth,
                    role = createdUser.Role.ToString(),
                    isActive = createdUser.IsActive,
                    createdAt = verificationUser!.CreatedAt // Safe to use ! because we verified above
                },
                verification = verificationResults,
                databasePersistence = new
                {
                    confirmed = true,
                    verificationMethod = "Direct database query",
                    timestamp = DateTime.UtcNow
                }
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Registration {RegistrationId} failed due to validation: {Email} - {Error}", 
                registrationId, request.Email, ex.Message);
            return BadRequest(new { 
                registrationId = registrationId,
                message = ex.Message 
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration {RegistrationId} failed due to business rule: {Email} - {Error}", 
                registrationId, request.Email, ex.Message);
            return Conflict(new { 
                registrationId = registrationId,
                message = ex.Message 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration {RegistrationId} - Unexpected error for email: {Email}", 
                registrationId, request.Email);
            return StatusCode(500, new { 
                registrationId = registrationId,
                message = "An error occurred during registration. Please try again.",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Verify if a user exists in the database by email
    /// </summary>
    /// <param name="email">Email to check</param>
    /// <returns>User existence verification</returns>
    [HttpGet("verify-user/{email}")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyUserExists(string email)
    {
        try
        {
            _logger.LogInformation("User verification request for email: {Email}", email);

            var userByEmail = await _userRepository.GetByEmailAsync(email);
            var emailExists = await _userRepository.EmailExistsAsync(email);

            var verification = new
            {
                email = email,
                userFound = userByEmail != null,
                emailExists = emailExists,
                userId = userByEmail?.Id,
                firstName = userByEmail?.FirstName,
                lastName = userByEmail?.LastName,
                isActive = userByEmail?.IsActive,
                createdAt = userByEmail?.CreatedAt,
                verificationTimestamp = DateTime.UtcNow
            };

            _logger.LogInformation("User verification completed for email: {Email}. Found: {Found}", 
                email, userByEmail != null);

            return Ok(verification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user verification for email: {Email}", email);
            return StatusCode(500, new { 
                message = "Error during verification",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get database statistics for monitoring
    /// </summary>
    /// <returns>Database statistics</returns>
    [HttpGet("database-stats")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDatabaseStats()
    {
        try
        {
            _logger.LogInformation("Database statistics request");

            var allUsers = await _userRepository.GetAllAsync();
            var activeUsers = await _userRepository.GetActiveUsersAsync();

            var stats = new
            {
                totalUsers = allUsers.Count(),
                activeUsers = activeUsers.Count(),
                inactiveUsers = allUsers.Count() - activeUsers.Count(),
                usersWithPasswords = allUsers.Count(u => !string.IsNullOrEmpty(u.PasswordHash)),
                recentUsers = allUsers
                    .Where(u => u.CreatedAt > DateTime.UtcNow.AddDays(-7))
                    .Count(),
                userRoles = allUsers
                    .GroupBy(u => u.Role)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count()),
                timestamp = DateTime.UtcNow
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving database statistics");
            return StatusCode(500, new { 
                message = "Error retrieving statistics",
                error = ex.Message
            });
        }
    }
}

/// <summary>
/// Enhanced registration request with additional validation
/// </summary>
public class EnhancedRegisterRequest
{
    [Required(ErrorMessage = "First name is required")]
    [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
    [RegularExpression(@"^[a-zA-Z\s\-'\.]+$", ErrorMessage = "First name contains invalid characters")]
    public string FirstName { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Last name is required")]
    [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
    [RegularExpression(@"^[a-zA-Z\s\-'\.]+$", ErrorMessage = "Last name contains invalid characters")]
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

    /// <summary>
    /// Optional role name selected during registration (e.g., User, Manager, Admin, Supervisor)
    /// </summary>
    public string? Role { get; set; }
}