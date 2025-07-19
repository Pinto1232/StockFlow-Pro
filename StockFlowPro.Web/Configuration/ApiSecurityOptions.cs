namespace StockFlowPro.Web.Configuration;

/// <summary>
/// Configuration options for enhanced API security
/// </summary>
public class ApiSecurityOptions
{
    public const string SectionName = "ApiSecurity";
    
    // API Key Configuration
    public bool RequireApiKey { get; set; } = false;
    public string ApiKeyHeaderName { get; set; } = "X-API-Key";
    public string ApiKeyQueryParam { get; set; } = "api_key";
    public bool AllowApiKeyInQuery { get; set; } = false;
    public List<string> ValidApiKeys { get; set; } = new();
    
    // Request Validation
    public bool RequireUserAgent { get; set; } = true;
    public int MaxRequestBodySize { get; set; } = 1024 * 1024; // 1MB
    public bool ValidateContentType { get; set; } = true;
    public List<string> AllowedContentTypes { get; set; } = new()
    {
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data"
    };
    
    // Rate Limiting
    public int RateLimitWindowMinutes { get; set; } = 60;
    public int DefaultRateLimit { get; set; } = 1000;
    public Dictionary<string, int> EndpointRateLimits { get; set; } = new()
    {
        { "/api/auth/login", 5 },
        { "/api/auth/register", 3 },
        { "/api/auth/forgot-password", 3 },
        { "/api/users", 100 }
    };
    
    // Bot Detection
    public bool EnableBotDetection { get; set; } = true;
    public bool BlockBots { get; set; } = false;
    public List<string> BotUserAgentPatterns { get; set; } = new()
    {
        @"bot|crawler|spider|scraper",
        @"curl|wget|python|java|go-http",
        @"postman|insomnia|httpie",
        @"scanner|exploit|attack"
    };
    
    // Threat Detection
    public bool EnableThreatDetection { get; set; } = true;
    public int ThreatScoreThreshold { get; set; } = 100;
    public int BlockDurationMinutes { get; set; } = 60;
    public bool AutoBlockSuspiciousIps { get; set; } = true;
    
    // IP Filtering
    public List<string> BlockedIps { get; set; } = new();
    public List<string> AllowedIps { get; set; } = new();
    public bool EnableGeoBlocking { get; set; } = false;
    public List<string> BlockedCountries { get; set; } = new();
    
    // Security Headers
    public bool AddSecurityHeaders { get; set; } = true;
    public string ContentSecurityPolicy { get; set; } = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
    public bool EnableHsts { get; set; } = true;
    public int HstsMaxAge { get; set; } = 31536000; // 1 year
    
    // Logging and Monitoring
    public bool LogSecurityEvents { get; set; } = true;
    public bool LogAllRequests { get; set; } = false;
    public bool EnableMetrics { get; set; } = true;
    public string LogLevel { get; set; } = "Warning";
    
    // CORS Configuration
    public bool EnableCors { get; set; } = true;
    public List<string> AllowedOrigins { get; set; } = new();
    public List<string> AllowedMethods { get; set; } = new() { "GET", "POST", "PUT", "DELETE" };
    public List<string> AllowedHeaders { get; set; } = new() { "Content-Type", "Authorization", "X-API-Key" };
    public bool AllowCredentials { get; set; } = true;
    
    // Input Validation
    public bool EnableInputValidation { get; set; } = true;
    public int MaxStringLength { get; set; } = 1000;
    public int MaxArrayLength { get; set; } = 100;
    public bool BlockSqlInjection { get; set; } = true;
    public bool BlockXss { get; set; } = true;
    public bool BlockPathTraversal { get; set; } = true;
    public bool BlockCommandInjection { get; set; } = true;
    
    // Performance Settings
    public bool EnableCompression { get; set; } = true;
    public bool EnableCaching { get; set; } = true;
    public int CacheDurationMinutes { get; set; } = 5;
    public int MaxConcurrentRequests { get; set; } = 1000;
    
    // Validation method
    public void Validate()
    {
        if (RequireApiKey && !ValidApiKeys.Any())
        {
            throw new InvalidOperationException("API keys are required but none are configured");
        }
        
        if (RateLimitWindowMinutes <= 0)
        {
            throw new InvalidOperationException("Rate limit window must be greater than 0");
        }
        
        if (MaxRequestBodySize <= 0)
        {
            throw new InvalidOperationException("Max request body size must be greater than 0");
        }
        
        if (ThreatScoreThreshold <= 0)
        {
            throw new InvalidOperationException("Threat score threshold must be greater than 0");
        }
    }
}

/// <summary>
/// Security metrics for monitoring
/// </summary>
public class SecurityMetrics
{
    public int TotalRequests { get; set; }
    public int BlockedRequests { get; set; }
    public int SuspiciousRequests { get; set; }
    public int RateLimitedRequests { get; set; }
    public int InvalidApiKeyRequests { get; set; }
    public int MaliciousContentRequests { get; set; }
    public Dictionary<string, int> ThreatsByType { get; set; } = new();
    public Dictionary<string, int> RequestsByEndpoint { get; set; } = new();
    public DateTime LastReset { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Security event types for logging
/// </summary>
public enum SecurityEventType
{
    RequestBlocked,
    SuspiciousActivity,
    RateLimitExceeded,
    InvalidApiKey,
    MaliciousContent,
    BotDetected,
    IpBlocked,
    AuthenticationFailed,
    AuthorizationFailed,
    InputValidationFailed,
    SecurityHeaderViolation,
    ThreatDetected
}