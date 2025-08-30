using Microsoft.AspNetCore.Http;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;
using System.Collections.Concurrent;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Secure implementation of user synchronization service
/// </summary>
public class UserSynchronizationService : IUserSynchronizationService
{
    private readonly IDataSourceService _dataSourceService;
    private readonly IUserSecurityService _userSecurityService;
    private readonly ILogger<UserSynchronizationService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    // In-memory audit log (in production, this should be persisted to database)
    private static readonly ConcurrentBag<UserSyncAuditEntry> _auditLog = new();
    
    // Rate limiting: max 5 sync operations per user per hour
    private static readonly ConcurrentDictionary<Guid, List<DateTime>> _syncAttempts = new();
    private const int MaxSyncAttemptsPerHour = 5;
    
    public UserSynchronizationService(
        IDataSourceService dataSourceService,
        IUserSecurityService userSecurityService,
        ILogger<UserSynchronizationService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _dataSourceService = dataSourceService;
        _userSecurityService = userSecurityService;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<UserSyncValidationResult> ValidateUserForSyncAsync(Guid userId, Guid requestingUserId)
    {
        var result = new UserSyncValidationResult();
        
        try
        {
            // Check rate limiting
            if (!CheckRateLimit(requestingUserId))
            {
                result.ErrorMessage = "Rate limit exceeded. Too many synchronization attempts.";
                _logger.LogWarning("Rate limit exceeded for user {RequestingUserId} attempting to sync user {UserId}", 
                    requestingUserId, userId);
                return result;
            }
            
            // Get user existence status
            var existenceStatus = await CheckUserExistenceAsync(userId);
            
            if (!existenceStatus.RequiresSync)
            {
                if (existenceStatus.ExistsInDatabase)
                {
                    result.ErrorMessage = "User already exists in database. No synchronization needed.";
                }
                else if (!existenceStatus.ExistsInMockData)
                {
                    result.ErrorMessage = "User does not exist in any data source.";
                }
                return result;
            }
            
            var mockUser = existenceStatus.MockDataUser!;
            
            // Validate user data integrity
            var validationIssues = ValidateUserData(mockUser);
            if (validationIssues.Any())
            {
                result.ValidationIssues = validationIssues;
                result.ErrorMessage = "User data validation failed.";
                return result;
            }
            
            // ENHANCED SECURITY: Use centralized security service for authorization validation
            if (!await _userSecurityService.ValidateUserSyncAuthorizationAsync(userId, requestingUserId))
            {
                result.ErrorMessage = "Insufficient permissions to perform user synchronization.";
                await _userSecurityService.LogSecurityEventAsync(
                    SecurityEventType.UnauthorizedUserSyncAttempt, 
                    requestingUserId, 
                    $"Attempted to sync user {userId}", 
                    GetClientIpAddress());
                return result;
            }
            
            result.IsValid = true;
            result.UserData = mockUser;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating user {UserId} for sync by user {RequestingUserId}", 
                userId, requestingUserId);
            result.ErrorMessage = "Internal error during validation.";
            return result;
        }
    }

    public async Task<UserDto?> SecureSyncUserAsync(Guid userId, Guid requestingUserId, string reason)
    {
        var auditEntry = new UserSyncAuditEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            RequestingUserId = requestingUserId,
            Operation = "SecureSync",
            Reason = reason,
            Timestamp = DateTime.UtcNow,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent()
        };
        
        try
        {
            // Validate the sync operation
            var validation = await ValidateUserForSyncAsync(userId, requestingUserId);
            if (!validation.IsValid)
            {
                auditEntry.Success = false;
                auditEntry.ErrorMessage = validation.ErrorMessage;
                _auditLog.Add(auditEntry);
                
                _logger.LogWarning("Sync validation failed for user {UserId} by {RequestingUserId}: {Error}", 
                    userId, requestingUserId, validation.ErrorMessage);
                return null;
            }
            
            // Get requesting user info for audit
            var requestingUser = await _dataSourceService.GetUserByIdAsync(requestingUserId);
            auditEntry.RequestingUserEmail = requestingUser?.Email ?? "Unknown";
            
            // Record sync attempt for rate limiting
            RecordSyncAttempt(requestingUserId);
            
            // Perform the actual synchronization
            var createUserDto = new CreateUserDto
            {
                FirstName = validation.UserData!.FirstName,
                LastName = validation.UserData.LastName,
                Email = validation.UserData.Email,
                PhoneNumber = validation.UserData.PhoneNumber,
                DateOfBirth = validation.UserData.DateOfBirth,
                Role = validation.UserData.Role,
                PasswordHash = validation.UserData.PasswordHash
            };
            
            var syncedUser = await _dataSourceService.CreateUserAsync(createUserDto);
            
            auditEntry.Success = true;
            _auditLog.Add(auditEntry);
            
            _logger.LogInformation("Successfully synced user {UserId} to database by user {RequestingUserId} for reason: {Reason}", 
                userId, requestingUserId, reason);
            
            return syncedUser;
        }
        catch (Exception ex)
        {
            auditEntry.Success = false;
            auditEntry.ErrorMessage = ex.Message;
            _auditLog.Add(auditEntry);
            
            _logger.LogError(ex, "Failed to sync user {UserId} by user {RequestingUserId}", 
                userId, requestingUserId);
            return null;
        }
    }

    public async Task<UserExistenceStatus> CheckUserExistenceAsync(Guid userId)
    {
        var status = new UserExistenceStatus();
        
        try
        {
            // Check mock data
            var mockUser = await _dataSourceService.GetUserByIdAsync(userId);
            status.ExistsInMockData = mockUser != null;
            status.MockDataUser = mockUser;
            
            // Check database by attempting to get user directly from database
            // This is a simplified check - in a real implementation, you'd have a separate database service
            try
            {
                // Try to create a user with the same ID to see if it already exists
                // This is a workaround since we don't have direct database access here
                var existingUser = await _dataSourceService.GetUserByIdAsync(userId);
                
                // If we can get the user and it has database-specific properties, it exists in DB
                // This is a simplified approach - in production, you'd have better separation
                status.ExistsInDatabase = existingUser != null && !string.IsNullOrEmpty(existingUser.Email);
                status.DatabaseUser = status.ExistsInDatabase ? existingUser : null;
            }
            catch
            {
                status.ExistsInDatabase = false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existence for user {UserId}", userId);
        }
        
        return status;
    }

    public async Task<IEnumerable<UserSyncAuditEntry>> GetSyncAuditLogsAsync(Guid userId)
    {
        return await Task.FromResult(_auditLog.Where(entry => entry.UserId == userId).OrderByDescending(e => e.Timestamp));
    }

    private List<string> ValidateUserData(UserDto user)
    {
        var issues = new List<string>();
        
        if (string.IsNullOrWhiteSpace(user.FirstName)){
            issues.Add("First name is required");

        }

        if (string.IsNullOrWhiteSpace(user.LastName))
        {
            issues.Add("Last name is required");
        }


        if (string.IsNullOrWhiteSpace(user.Email) || !IsValidEmail(user.Email))
        {
            issues.Add("Valid email is required");
        }

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            issues.Add("Password hash is required");
        }


        if (!IsValidRole(user.Role))
        {
            issues.Add("Valid role is required");
        }


        if (user.DateOfBirth == default || user.DateOfBirth > DateTime.Now.AddYears(-13))
        {
            issues.Add("Valid date of birth is required (minimum age 13)");
        }
  
        
        return issues;
    }
    
    private bool IsValidEmail(string email)
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
    
    private bool IsValidRole(UserRole role)
    {
        return Enum.IsDefined(typeof(UserRole), role);
    }
    
    private async Task<bool> ValidateRequestingUserPermissions(Guid requestingUserId)
    {
        try
        {
            var user = await _dataSourceService.GetUserByIdAsync(requestingUserId);
            return user != null; // Basic check - user exists
        }
        catch
        {
            return false;
        }
    }
    
    private bool CheckRateLimit(Guid userId)
    {
        var now = DateTime.UtcNow;
        var oneHourAgo = now.AddHours(-1);
        
        _syncAttempts.AddOrUpdate(userId, 
            new List<DateTime> { now }, 
            (key, existing) =>
            {
                // Remove attempts older than 1 hour
                existing.RemoveAll(attempt => attempt < oneHourAgo);
                existing.Add(now);
                return existing;
            });
        
        return _syncAttempts[userId].Count <= MaxSyncAttemptsPerHour;
    }
    
    private void RecordSyncAttempt(Guid userId)
    {
        var now = DateTime.UtcNow;
        _syncAttempts.AddOrUpdate(userId, 
            new List<DateTime> { now }, 
            (key, existing) =>
            {
                existing.Add(now);
                return existing;
            });
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
    
    private string GetUserAgent()
    {
        var context = _httpContextAccessor.HttpContext;
        return context?.Request.Headers["User-Agent"].FirstOrDefault() ?? "Unknown";
    }
}