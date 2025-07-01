using StockFlowPro.Application.Interfaces;
using System.Collections.Concurrent;
using System.Text.Json;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Service for security auditing and monitoring
/// </summary>
public interface ISecurityAuditService
{
    Task LogSecurityEventAsync(SecurityAuditEvent auditEvent);
    Task<IEnumerable<SecurityAuditEvent>> GetSecurityEventsAsync(DateTime? from = null, DateTime? to = null);
    Task<SecurityMetrics> GetSecurityMetricsAsync();
    Task AlertOnSuspiciousActivityAsync(string activity, string details);
}

public class SecurityAuditService : ISecurityAuditService
{
    private readonly ILogger<SecurityAuditService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    // In-memory storage for demo - in production, use a database
    private static readonly ConcurrentQueue<SecurityAuditEvent> _auditEvents = new();
    private static readonly ConcurrentDictionary<string, int> _failedLoginAttempts = new();

    public SecurityAuditService(ILogger<SecurityAuditService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogSecurityEventAsync(SecurityAuditEvent auditEvent)
    {
        try
        {
            // Enrich the event with additional context
            auditEvent.Timestamp = DateTime.UtcNow;
            auditEvent.IpAddress ??= GetClientIpAddress();
            auditEvent.UserAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString();
            auditEvent.SessionId = _httpContextAccessor.HttpContext?.Session?.Id;

            // Store the event
            _auditEvents.Enqueue(auditEvent);

            // Log to structured logging
            _logger.LogWarning("SECURITY AUDIT: {EventType} - User: {UserId}, IP: {IpAddress}, Details: {Details}",
                auditEvent.EventType, auditEvent.UserId, auditEvent.IpAddress, auditEvent.Details);

            // Check for suspicious patterns
            await CheckForSuspiciousActivityAsync(auditEvent);

            // Cleanup old events (keep last 10000)
            while (_auditEvents.Count > 10000)
            {
                _auditEvents.TryDequeue(out _);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log security audit event");
        }
    }

    public Task<IEnumerable<SecurityAuditEvent>> GetSecurityEventsAsync(DateTime? from = null, DateTime? to = null)
    {
        var events = _auditEvents.ToArray().AsEnumerable();

        if (from.HasValue)
           { events = events.Where(e => e.Timestamp >= from.Value);}

        if (to.HasValue)
           { events = events.Where(e => e.Timestamp <= to.Value);}

        return Task.FromResult(events.OrderByDescending(e => e.Timestamp).AsEnumerable());
    }

    public Task<SecurityMetrics> GetSecurityMetricsAsync()
    {
        var events = _auditEvents.ToArray();
        var last24Hours = DateTime.UtcNow.AddHours(-24);
        var recentEvents = events.Where(e => e.Timestamp >= last24Hours).ToArray();

        var metrics = new SecurityMetrics
        {
            TotalEvents = events.Length,
            EventsLast24Hours = recentEvents.Length,
            FailedLoginAttempts = recentEvents.Count(e => e.EventType == SecurityEventType.LoginFailed),
            SuspiciousActivities = recentEvents.Count(e => e.RiskLevel == SecurityRiskLevel.High),
            UniqueIpAddresses = recentEvents.Select(e => e.IpAddress).Distinct().Count(),
            MostCommonEventTypes = recentEvents
                .GroupBy(e => e.EventType)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .ToDictionary(g => g.Key.ToString(), g => g.Count())
        };

        return Task.FromResult(metrics);
    }

    public async Task AlertOnSuspiciousActivityAsync(string activity, string details)
    {
        _logger.LogCritical("SECURITY ALERT: {Activity} - {Details}", activity, details);

        // In production, send email alerts, notifications, etc.
        await Task.CompletedTask;
    }

    private async Task CheckForSuspiciousActivityAsync(SecurityAuditEvent auditEvent)
    {
        // Check for brute force attacks
        if (auditEvent.EventType == SecurityEventType.LoginFailed)
        {
            var key = $"{auditEvent.IpAddress}:{auditEvent.UserId}";
            var attempts = _failedLoginAttempts.AddOrUpdate(key, 1, (k, v) => v + 1);

            if (attempts >= 5)
            {
                await AlertOnSuspiciousActivityAsync("Potential Brute Force Attack", 
                    $"Multiple failed login attempts from IP {auditEvent.IpAddress} for user {auditEvent.UserId}");
            }
        }

        // Check for rapid successive requests from same IP
        var recentEvents = _auditEvents
            .Where(e => e.IpAddress == auditEvent.IpAddress && 
                       e.Timestamp >= DateTime.UtcNow.AddMinutes(-5))
            .Count();

        if (recentEvents > 50)
        {
            await AlertOnSuspiciousActivityAsync("High Request Volume", 
                $"Unusually high request volume from IP {auditEvent.IpAddress}");
        }

        // Check for privilege escalation attempts
        if (auditEvent.EventType == SecurityEventType.UnauthorizedAccess && 
            auditEvent.RiskLevel == SecurityRiskLevel.High)
        {
            await AlertOnSuspiciousActivityAsync("Privilege Escalation Attempt", 
                $"Unauthorized access attempt: {auditEvent.Details}");
        }
    }

    private string GetClientIpAddress()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) {return "unknown";}

        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

/// <summary>
/// Security audit event model
/// </summary>
public class SecurityAuditEvent
{
    public DateTime Timestamp { get; set; }
    public SecurityEventType EventType { get; set; }
    public string? UserId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? SessionId { get; set; }
    public string Details { get; set; } = string.Empty;
    public SecurityRiskLevel RiskLevel { get; set; } = SecurityRiskLevel.Low;
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

/// <summary>
/// Security metrics model
/// </summary>
public class SecurityMetrics
{
    public int TotalEvents { get; set; }
    public int EventsLast24Hours { get; set; }
    public int FailedLoginAttempts { get; set; }
    public int SuspiciousActivities { get; set; }
    public int UniqueIpAddresses { get; set; }
    public Dictionary<string, int> MostCommonEventTypes { get; set; } = new();
}

/// <summary>
/// Security event types for auditing
/// </summary>
public enum SecurityEventType
{
    LoginSuccess,
    LoginFailed,
    Logout,
    PasswordChanged,
    PasswordResetRequested,
    AccountLocked,
    UnauthorizedAccess,
    PrivilegeEscalation,
    SuspiciousActivity,
    DataAccess,
    DataModification,
    ConfigurationChanged,
    SecurityPolicyViolation,
    MaliciousInputDetected,
    RateLimitExceeded,
    UnauthorizedUserCreationAttempt,
    UnauthorizedUserSyncAttempt,
    UnauthorizedUserModificationAttempt,
    SuspiciousUserCreationPattern,
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