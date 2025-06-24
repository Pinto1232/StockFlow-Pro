using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Service responsible for user security validation and authorization
/// </summary>
public interface IUserSecurityService
{
    /// <summary>
    /// Validates if a user creation request is authorized and secure
    /// </summary>
    /// <param name="createUserDto">User creation data</param>
    /// <param name="requestingUserId">ID of the user making the request</param>
    /// <returns>Validation result with security checks</returns>
    Task<UserSecurityValidationResult> ValidateUserCreationAsync(CreateUserDto createUserDto, Guid requestingUserId);
    
    /// <summary>
    /// Validates if a user synchronization request is authorized
    /// </summary>
    /// <param name="targetUserId">User to be synchronized</param>
    /// <param name="requestingUserId">User making the request</param>
    /// <returns>True if authorized, false otherwise</returns>
    Task<bool> ValidateUserSyncAuthorizationAsync(Guid targetUserId, Guid requestingUserId);
    
    /// <summary>
    /// Validates if a user modification request is authorized
    /// </summary>
    /// <param name="targetUserId">User to be modified</param>
    /// <param name="requestingUserId">User making the request</param>
    /// <returns>True if authorized, false otherwise</returns>
    Task<bool> ValidateUserModificationAuthorizationAsync(Guid targetUserId, Guid requestingUserId);
    
    /// <summary>
    /// Logs security events for audit purposes
    /// </summary>
    /// <param name="eventType">Type of security event</param>
    /// <param name="userId">User involved in the event</param>
    /// <param name="details">Additional event details</param>
    /// <param name="ipAddress">IP address of the request</param>
    Task LogSecurityEventAsync(SecurityEventType eventType, Guid userId, string details, string ipAddress);
}

/// <summary>
/// Result of user security validation
/// </summary>
public class UserSecurityValidationResult
{
    public bool IsValid { get; set; }
    public List<string> SecurityIssues { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public SecurityRiskLevel RiskLevel { get; set; } = SecurityRiskLevel.Low;
}

/// <summary>
/// Types of security events for audit logging
/// </summary>
public enum SecurityEventType
{
    UnauthorizedUserCreationAttempt,
    UnauthorizedUserSyncAttempt,
    UnauthorizedUserModificationAttempt,
    SuspiciousUserCreationPattern,
    RateLimitExceeded,
    InvalidUserDataSubmission
}

/// <summary>
/// Security risk levels
/// </summary>
public enum SecurityRiskLevel
{
    Low,
    Medium,
    High,
    Critical
}