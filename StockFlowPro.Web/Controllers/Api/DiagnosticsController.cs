using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Web.Attributes;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/diagnostics")]
[PublicApi]
public class DiagnosticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<DiagnosticsController> _logger;

    public DiagnosticsController(
        ApplicationDbContext context,
        IUserRepository userRepository,
        ILogger<DiagnosticsController> logger)
    {
        _context = context;
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Check database connection and basic functionality
    /// </summary>
    /// <returns>Database health status</returns>
    [HttpGet("database-health")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckDatabaseHealth()
    {
        try
        {
            _logger.LogInformation("Database health check started");

            var healthCheck = new
            {
                timestamp = DateTime.UtcNow,
                databaseConnection = "Unknown",
                canConnectToDatabase = false,
                canQueryUsers = false,
                userTableExists = false,
                totalUsers = 0,
                sampleUserEmails = new List<string>(),
                lastUserCreated = (DateTime?)null,
                errors = new List<string>()
            };

            try
            {
                // Test database connection
                await _context.Database.OpenConnectionAsync();
                healthCheck = healthCheck with { 
                    databaseConnection = "Connected",
                    canConnectToDatabase = true
                };
                _logger.LogInformation("Database connection successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection failed");
                healthCheck.errors.Add($"Database connection failed: {ex.Message}");
            }

            try
            {
                // Check if Users table exists and can be queried
                var userCount = await _context.Users.CountAsync();
                healthCheck = healthCheck with { 
                    userTableExists = true,
                    canQueryUsers = true,
                    totalUsers = userCount
                };
                _logger.LogInformation("Users table query successful. Count: {Count}", userCount);

                // Get sample user emails (last 5)
                var sampleUsers = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(5)
                    .Select(u => u.Email)
                    .ToListAsync();
                
                healthCheck = healthCheck with { sampleUserEmails = sampleUsers };

                // Get last user created
                var lastUser = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .FirstOrDefaultAsync();
                
                if (lastUser != null)
                {
                    healthCheck = healthCheck with { lastUserCreated = lastUser.CreatedAt };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Users table query failed");
                healthCheck.errors.Add($"Users table query failed: {ex.Message}");
            }

            var statusCode = healthCheck.errors.Any() ? 500 : 200;
            return StatusCode(statusCode, healthCheck);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return StatusCode(500, new
            {
                timestamp = DateTime.UtcNow,
                message = "Database health check failed",
                error = ex.Message
            });
        }
        finally
        {
            try
            {
                await _context.Database.CloseConnectionAsync();
            }
            catch
            {
                // Ignore connection close errors
            }
        }
    }

    /// <summary>
    /// Test the complete registration flow without actually creating a user
    /// </summary>
    /// <returns>Registration flow test results</returns>
    [HttpPost("test-registration-flow")]
    [AllowAnonymous]
    public async Task<IActionResult> TestRegistrationFlow([FromBody] TestRegistrationRequest request)
    {
        var testId = Guid.NewGuid().ToString("N")[..8];
        
        try
        {
            _logger.LogInformation("Registration flow test {TestId} started for email: {Email}", 
                testId, request.Email);

            var testResults = new
            {
                testId = testId,
                timestamp = DateTime.UtcNow,
                email = request.Email,
                steps = new List<object>(),
                overallSuccess = false,
                errors = new List<string>()
            };

            // Step 1: Check if email already exists
            try
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                var emailExists = await _userRepository.EmailExistsAsync(request.Email);
                
                testResults.steps.Add(new
                {
                    step = 1,
                    name = "Email Existence Check",
                    success = true,
                    userFound = existingUser != null,
                    emailExists = emailExists,
                    details = existingUser != null ? new
                    {
                        userId = existingUser.Id,
                        firstName = existingUser.FirstName,
                        lastName = existingUser.LastName,
                        createdAt = existingUser.CreatedAt
                    } : null
                });

                if (existingUser != null)
                {
                    return Ok(testResults with { 
                        overallSuccess = false,
                        errors = new List<string> { "Email already exists - cannot proceed with test" }
                    });
                }
            }
            catch (Exception ex)
            {
                testResults.steps.Add(new
                {
                    step = 1,
                    name = "Email Existence Check",
                    success = false,
                    error = ex.Message
                });
                testResults.errors.Add($"Step 1 failed: {ex.Message}");
            }

            // Step 2: Test database write capability (dry run)
            try
            {
                // Test if we can start a transaction
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                testResults.steps.Add(new
                {
                    step = 2,
                    name = "Database Transaction Test",
                    success = true,
                    details = "Can create database transactions"
                });

                await transaction.RollbackAsync(); // Don't commit
            }
            catch (Exception ex)
            {
                testResults.steps.Add(new
                {
                    step = 2,
                    name = "Database Transaction Test",
                    success = false,
                    error = ex.Message
                });
                testResults.errors.Add($"Step 2 failed: {ex.Message}");
            }

            // Step 3: Test repository functionality
            try
            {
                var allUsers = await _userRepository.GetAllAsync();
                var activeUsers = await _userRepository.GetActiveUsersAsync();
                
                testResults.steps.Add(new
                {
                    step = 3,
                    name = "Repository Functionality Test",
                    success = true,
                    totalUsers = allUsers.Count(),
                    activeUsers = activeUsers.Count(),
                    details = "Repository methods working correctly"
                });
            }
            catch (Exception ex)
            {
                testResults.steps.Add(new
                {
                    step = 3,
                    name = "Repository Functionality Test",
                    success = false,
                    error = ex.Message
                });
                testResults.errors.Add($"Step 3 failed: {ex.Message}");
            }

            // Step 4: Test validation pipeline
            try
            {
                // This would normally go through FluentValidation
                var validationResults = new
                {
                    emailFormat = IsValidEmail(request.Email),
                    nameFormat = !string.IsNullOrWhiteSpace(request.FirstName) && !string.IsNullOrWhiteSpace(request.LastName),
                    phoneFormat = !string.IsNullOrWhiteSpace(request.PhoneNumber),
                    ageValid = IsValidAge(request.DateOfBirth)
                };

                testResults.steps.Add(new
                {
                    step = 4,
                    name = "Validation Pipeline Test",
                    success = true,
                    validationResults = validationResults,
                    allValid = validationResults.emailFormat && validationResults.nameFormat && 
                              validationResults.phoneFormat && validationResults.ageValid
                });
            }
            catch (Exception ex)
            {
                testResults.steps.Add(new
                {
                    step = 4,
                    name = "Validation Pipeline Test",
                    success = false,
                    error = ex.Message
                });
                testResults.errors.Add($"Step 4 failed: {ex.Message}");
            }

            var overallSuccess = !testResults.errors.Any();
            
            _logger.LogInformation("Registration flow test {TestId} completed. Success: {Success}", 
                testId, overallSuccess);

            return Ok(testResults with { overallSuccess = overallSuccess });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration flow test {TestId} failed", testId);
            return StatusCode(500, new
            {
                testId = testId,
                timestamp = DateTime.UtcNow,
                message = "Registration flow test failed",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get detailed information about the Users table structure
    /// </summary>
    /// <returns>Table structure information</returns>
    [HttpGet("users-table-info")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUsersTableInfo()
    {
        try
        {
            _logger.LogInformation("Users table info request");

            // Get table schema information
            var tableInfo = new
            {
                timestamp = DateTime.UtcNow,
                tableName = "Users",
                connectionString = _context.Database.GetConnectionString()?.Substring(0, 50) + "...",
                databaseProvider = _context.Database.ProviderName,
                columns = new List<object>(),
                indexes = new List<object>(),
                constraints = new List<object>(),
                sampleData = new List<object>()
            };

            // Get sample data (last 3 users)
            var sampleUsers = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(3)
                .Select(u => new
                {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    role = u.Role.ToString(),
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt,
                    hasPasswordHash = !string.IsNullOrEmpty(u.PasswordHash)
                })
                .ToListAsync();

            tableInfo = tableInfo with { sampleData = sampleUsers.Cast<object>().ToList() };

            return Ok(tableInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Users table info request failed");
            return StatusCode(500, new
            {
                timestamp = DateTime.UtcNow,
                message = "Users table info request failed",
                error = ex.Message
            });
        }
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Get current user authentication status and roles
    /// </summary>
    /// <returns>Authentication status information</returns>
    [HttpGet("auth-status")]
    [AllowAnonymous]
    public IActionResult GetAuthStatus()
    {
        try
        {
            _logger.LogInformation("Auth status check requested");

            var authStatus = new
            {
                timestamp = DateTime.UtcNow,
                isAuthenticated = User.Identity?.IsAuthenticated ?? false,
                userId = User.Identity?.IsAuthenticated == true ? 
                    User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? 
                    User.FindFirst("sub")?.Value ?? 
                    User.FindFirst("id")?.Value : null,
                userName = User.Identity?.Name,
                roles = User.Identity?.IsAuthenticated == true ? User.Claims
                    .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role || 
                               c.Type == "role" || 
                               c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                    .Select(c => c.Value)
                    .ToList() : new List<string>(),
                claims = User.Identity?.IsAuthenticated == true ? User.Claims
                    .Select(c => new { type = c.Type, value = c.Value })
                    .Cast<object>()
                    .ToList() : new List<object>()
            };

            _logger.LogInformation("Auth status: Authenticated={IsAuthenticated}, UserId={UserId}, Roles={Roles}", 
                authStatus.isAuthenticated, authStatus.userId, string.Join(",", authStatus.roles));

            return Ok(authStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Auth status check failed");
            return StatusCode(500, new
            {
                timestamp = DateTime.UtcNow,
                message = "Auth status check failed",
                error = ex.Message,
                isAuthenticated = false,
                userId = (string?)null,
                roles = new List<string>()
            });
        }
    }

    /// <summary>
    /// Log client-side errors for debugging purposes
    /// </summary>
    /// <param name="errorInfo">Error information from client</param>
    /// <returns>Acknowledgment of error logging</returns>
    [HttpPost("log-client-error")]
    [AllowAnonymous]
    public IActionResult LogClientError([FromBody] ClientErrorInfo errorInfo)
    {
        try
        {
            _logger.LogError("Client Error: {Message} | URL: {Url} | UserAgent: {UserAgent} | Context: {Context} | Error: {Error}", 
                errorInfo.Message, 
                errorInfo.Url, 
                errorInfo.UserAgent, 
                errorInfo.Context, 
                errorInfo.Error);

            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                message = "Error logged successfully",
                errorId = Guid.NewGuid().ToString("N")[..8]
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log client error");
            return StatusCode(500, new
            {
                timestamp = DateTime.UtcNow,
                message = "Failed to log client error",
                error = ex.Message
            });
        }
    }

    private static bool IsValidAge(DateTime dateOfBirth)
    {
        var age = DateTime.UtcNow.Year - dateOfBirth.Year;
        if (DateTime.UtcNow.DayOfYear < dateOfBirth.DayOfYear)
        {
            age--;
        }
        return age >= 13 && age <= 120;
    }
}

public class TestRegistrationRequest
{
    public string FirstName { get; set; } = "Test";
    public string LastName { get; set; } = "User";
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = "+1234567890";
    public DateTime DateOfBirth { get; set; } = new DateTime(1990, 1, 1);
}

public class ClientErrorInfo
{
    public string Message { get; set; } = string.Empty;
    public string? Error { get; set; }
    public string? Context { get; set; }
    public string? Url { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}