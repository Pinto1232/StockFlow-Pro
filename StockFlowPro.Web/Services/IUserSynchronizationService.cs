using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Service responsible for secure user synchronization between data sources
/// </summary>
public interface IUserSynchronizationService
{
    /// <summary>
    /// Validates if a user can be safely synchronized to the database
    /// </summary>
    /// <param name="userId">The user ID to validate</param>
    /// <param name="requestingUserId">The ID of the user making the request</param>
    /// <returns>Validation result with details</returns>
    Task<UserSyncValidationResult> ValidateUserForSyncAsync(Guid userId, Guid requestingUserId);
    
    /// <summary>
    /// Securely synchronizes a user to the database with proper validation
    /// </summary>
    /// <param name="userId">The user ID to synchronize</param>
    /// <param name="requestingUserId">The ID of the user making the request</param>
    /// <param name="reason">The reason for synchronization (for audit purposes)</param>
    /// <returns>The synchronized user or null if sync failed</returns>
    Task<UserDto?> SecureSyncUserAsync(Guid userId, Guid requestingUserId, string reason);
    
    /// <summary>
    /// Checks if a user exists in both data sources
    /// </summary>
    /// <param name="userId">The user ID to check</param>
    /// <returns>User existence status</returns>
    Task<UserExistenceStatus> CheckUserExistenceAsync(Guid userId);
    
    /// <summary>
    /// Gets synchronization audit logs for a user
    /// </summary>
    /// <param name="userId">The user ID to get logs for</param>
    /// <returns>List of sync audit entries</returns>
    Task<IEnumerable<UserSyncAuditEntry>> GetSyncAuditLogsAsync(Guid userId);
}

/// <summary>
/// Result of user synchronization validation
/// </summary>
public class UserSyncValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> ValidationIssues { get; set; } = new();
    public UserDto? UserData { get; set; }
}

/// <summary>
/// Status of user existence across data sources
/// </summary>
public class UserExistenceStatus
{
    public bool ExistsInMockData { get; set; }
    public bool ExistsInDatabase { get; set; }
    public bool RequiresSync => ExistsInMockData && !ExistsInDatabase;
    public UserDto? MockDataUser { get; set; }
    public UserDto? DatabaseUser { get; set; }
}

/// <summary>
/// Audit entry for user synchronization operations
/// </summary>
public class UserSyncAuditEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid RequestingUserId { get; set; }
    public string RequestingUserEmail { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
}