using Microsoft.AspNetCore.Http;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;
using System.Collections.Concurrent;
using System.Net.Mail;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Implementation of user security validation service
/// </summary>
public class UserSecurityService : IUserSecurityService
{
    private readonly IDualDataService _dualDataService;
    private readonly ILogger<UserSecurityService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    // Security monitoring: Track creation attempts per IP/User
    private static readonly ConcurrentDictionary<string, List<DateTime>> _creationAttemptsByIp = new();
    private static readonly ConcurrentDictionary<Guid, List<DateTime>> _creationAttemptsByUser = new();
    
    // Security thresholds
    private const int MaxCreationAttemptsPerHour = 3;
    private const int MaxCreationAttemptsPerIpPerHour = 10;
    
    public UserSecurityService(
        IDualDataService dualDataService,
        ILogger<UserSecurityService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _dualDataService = dualDataService;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<UserSecurityValidationResult> ValidateUserCreationAsync(CreateUserDto createUserDto, Guid requestingUserId)
    {
        var result = new UserSecurityValidationResult();
        var ipAddress = GetClientIpAddress();
        
        try
        {
            // 1. Validate requesting user permissions
            var requestingUser = await _dualDataService.GetUserByIdAsync(requestingUserId);
            if (requestingUser == null)
            {
                result.SecurityIssues.Add("Requesting user not found");
                result.RiskLevel = SecurityRiskLevel.High;
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserCreationAttempt, requestingUserId, 
                    "User creation attempted by non-existent user", ipAddress);
                return result;
            }

            // 2. Check if requesting user has permission to create users
            if (requestingUser.Role != UserRole.Admin && requestingUser.Role != UserRole.Manager)
            {
                result.SecurityIssues.Add("Insufficient permissions to create users");
                result.RiskLevel = SecurityRiskLevel.High;
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserCreationAttempt, requestingUserId, 
                    $"User creation attempted by user with role: {requestingUser.Role}", ipAddress);
                return result;
            }

            // 3. Check rate limiting
            if (!CheckUserCreationRateLimit(requestingUserId, ipAddress))
            {
                result.SecurityIssues.Add("Rate limit exceeded for user creation");
                result.RiskLevel = SecurityRiskLevel.Medium;
                await LogSecurityEventAsync(SecurityEventType.RateLimitExceeded, requestingUserId, 
                    "User creation rate limit exceeded", ipAddress);
                return result;
            }

            // 4. Validate user data integrity
            var dataValidationIssues = ValidateUserDataSecurity(createUserDto);
            if (dataValidationIssues.Any())
            {
                result.SecurityIssues.AddRange(dataValidationIssues);
                result.RiskLevel = SecurityRiskLevel.Medium;
                await LogSecurityEventAsync(SecurityEventType.InvalidUserDataSubmission, requestingUserId, 
                    $"Invalid user data: {string.Join(", ", dataValidationIssues)}", ipAddress);
                return result;
            }

            // 5. Check for duplicate users
            var existingUser = await _dualDataService.GetUserByEmailAsync(createUserDto.Email);
            if (existingUser != null)
            {
                result.SecurityIssues.Add("User with this email already exists");
                result.RiskLevel = SecurityRiskLevel.Medium;
                return result;
            }

            // 6. Validate role assignment permissions
            if (!ValidateRoleAssignmentPermission(requestingUser.Role, createUserDto.Role))
            {
                result.SecurityIssues.Add("Insufficient permissions to assign the specified role");
                result.RiskLevel = SecurityRiskLevel.High;
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserCreationAttempt, requestingUserId, 
                    $"Attempted to assign unauthorized role: {createUserDto.Role}", ipAddress);
                return result;
            }

            // Record successful validation attempt
            RecordCreationAttempt(requestingUserId, ipAddress);
            
            result.IsValid = true;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user creation security validation for requesting user {RequestingUserId}", requestingUserId);
            result.SecurityIssues.Add("Internal security validation error");
            result.RiskLevel = SecurityRiskLevel.High;
            return result;
        }
    }

    public async Task<bool> ValidateUserSyncAuthorizationAsync(Guid targetUserId, Guid requestingUserId)
    {
        try
        {
            // Allow users to sync themselves
            if (targetUserId == requestingUserId)
            {
                return true;
            }

            // Check if requesting user has admin/manager privileges
            var requestingUser = await _dualDataService.GetUserByIdAsync(requestingUserId);
            if (requestingUser == null)
            {
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserSyncAttempt, requestingUserId, 
                    "Sync attempted by non-existent user", GetClientIpAddress());
                return false;
            }

            if (requestingUser.Role != UserRole.Admin && requestingUser.Role != UserRole.Manager)
            {
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserSyncAttempt, requestingUserId, 
                    $"Sync attempted by user with insufficient role: {requestingUser.Role}", GetClientIpAddress());
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating user sync authorization for target {TargetUserId} by {RequestingUserId}", 
                targetUserId, requestingUserId);
            return false;
        }
    }

    public async Task<bool> ValidateUserModificationAuthorizationAsync(Guid targetUserId, Guid requestingUserId)
    {
        try
        {
            // Allow users to modify themselves (with restrictions)
            if (targetUserId == requestingUserId)
            {
                return true;
            }

            // Check if requesting user has admin/manager privileges
            var requestingUser = await _dualDataService.GetUserByIdAsync(requestingUserId);
            if (requestingUser == null)
            {
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserModificationAttempt, requestingUserId, 
                    "Modification attempted by non-existent user", GetClientIpAddress());
                return false;
            }

            if (requestingUser.Role != UserRole.Admin && requestingUser.Role != UserRole.Manager)
            {
                await LogSecurityEventAsync(SecurityEventType.UnauthorizedUserModificationAttempt, requestingUserId, 
                    $"Modification attempted by user with insufficient role: {requestingUser.Role}", GetClientIpAddress());
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating user modification authorization for target {TargetUserId} by {RequestingUserId}", 
                targetUserId, requestingUserId);
            return false;
        }
    }

    public async Task LogSecurityEventAsync(SecurityEventType eventType, Guid userId, string details, string ipAddress)
    {
        try
        {
            _logger.LogWarning("SECURITY EVENT: {EventType} - User: {UserId}, IP: {IpAddress}, Details: {Details}", 
                eventType, userId, ipAddress, details);
            
            // In a production environment, this should be stored in a dedicated security audit table
            // For now, we're using structured logging which can be ingested by security monitoring tools
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log security event {EventType} for user {UserId}", eventType, userId);
        }
        
        await Task.CompletedTask;
    }

    private List<string> ValidateUserDataSecurity(CreateUserDto createUserDto)
    {
        var issues = new List<string>();

        // Validate email format
        if (string.IsNullOrWhiteSpace(createUserDto.Email) || !IsValidEmail(createUserDto.Email))
        {
            issues.Add("Invalid email format");
        }

        // Validate name fields for potential injection attacks
        if (ContainsSuspiciousContent(createUserDto.FirstName) || ContainsSuspiciousContent(createUserDto.LastName))
        {
            issues.Add("Name fields contain suspicious content");
        }

        // Validate phone number format
        if (!string.IsNullOrWhiteSpace(createUserDto.PhoneNumber) && ContainsSuspiciousContent(createUserDto.PhoneNumber))
        {
            issues.Add("Phone number contains suspicious content");
        }

        // Validate date of birth
        if (createUserDto.DateOfBirth == default || createUserDto.DateOfBirth > DateTime.Now.AddYears(-13))
        {
            issues.Add("Invalid date of birth (minimum age 13)");
        }

        // Validate password hash exists
        if (string.IsNullOrWhiteSpace(createUserDto.PasswordHash))
        {
            issues.Add("Password hash is required");
        }

        return issues;
    }

    private bool ValidateRoleAssignmentPermission(UserRole requestingUserRole, UserRole targetRole)
    {
        // Only admins can create other admins
        if (targetRole == UserRole.Admin && requestingUserRole != UserRole.Admin)
        {
            return false;
        }

        // Managers can create users and other managers, but not admins
        if (requestingUserRole == UserRole.Manager && targetRole != UserRole.Admin)
        {
            return true;
        }

        // Admins can create any role
        if (requestingUserRole == UserRole.Admin)
        {
            return true;
        }

        return false;
    }

    private bool CheckUserCreationRateLimit(Guid userId, string ipAddress)
    {
        var now = DateTime.UtcNow;
        var oneHourAgo = now.AddHours(-1);

        // Check user-based rate limit
        _creationAttemptsByUser.AddOrUpdate(userId,
            new List<DateTime> { now },
            (key, existing) =>
            {
                existing.RemoveAll(attempt => attempt < oneHourAgo);
                existing.Add(now);
                return existing;
            });

        if (_creationAttemptsByUser[userId].Count > MaxCreationAttemptsPerHour)
        {
            return false;
        }

        // Check IP-based rate limit
        _creationAttemptsByIp.AddOrUpdate(ipAddress,
            new List<DateTime> { now },
            (key, existing) =>
            {
                existing.RemoveAll(attempt => attempt < oneHourAgo);
                existing.Add(now);
                return existing;
            });

        return _creationAttemptsByIp[ipAddress].Count <= MaxCreationAttemptsPerIpPerHour;
    }

    private void RecordCreationAttempt(Guid userId, string ipAddress)
    {
        var now = DateTime.UtcNow;
        
        _creationAttemptsByUser.AddOrUpdate(userId,
            new List<DateTime> { now },
            (key, existing) =>
            {
                existing.Add(now);
                return existing;
            });

        _creationAttemptsByIp.AddOrUpdate(ipAddress,
            new List<DateTime> { now },
            (key, existing) =>
            {
                existing.Add(now);
                return existing;
            });
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private bool ContainsSuspiciousContent(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return false;
        }

        // Check for common injection patterns
        var suspiciousPatterns = new[]
        {
            "<script", "javascript:", "vbscript:", "onload=", "onerror=",
            "SELECT ", "INSERT ", "UPDATE ", "DELETE ", "DROP ",
            "UNION ", "OR 1=1", "' OR '", "\" OR \"",
            "../", "..\\", "%2e%2e", "%252e%252e"
        };

        var lowerInput = input.ToLower();
        return suspiciousPatterns.Any(pattern => lowerInput.Contains(pattern.ToLower()));
    }

    private string GetClientIpAddress()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null)
        {
            return "Unknown";
        }

        var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (string.IsNullOrEmpty(ipAddress))
        {
            ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        }
        if (string.IsNullOrEmpty(ipAddress))
        {
            ipAddress = context.Connection.RemoteIpAddress?.ToString();
        }

        return ipAddress ?? "Unknown";
    }
}