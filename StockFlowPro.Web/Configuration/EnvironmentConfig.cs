using System.Security.Cryptography;

namespace StockFlowPro.Web.Configuration;

/// <summary>
/// Centralized configuration helper for environment variables
/// </summary>
public static class EnvironmentConfig
{
    // Database Configuration
    public static string DatabaseConnectionString => 
        Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? "Server=localhost;Database=StockFlowProDB;Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true;";

    // Application Settings
    public static string AspNetCoreEnvironment => 
        Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
    
    public static string AspNetCoreUrls => 
        Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "https://localhost:7001;http://localhost:5001";
    
    public static bool UseMockData => 
        bool.Parse(Environment.GetEnvironmentVariable("USE_MOCK_DATA") ?? "true");

    // Security Configuration
    public static string JwtSecretKey => 
        Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? GenerateSecureRandomKey(64);
    
    public static string JwtIssuer => 
        Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "StockFlowPro";
    
    public static string JwtAudience => 
        Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "StockFlowPro-Users";
    
    public static int JwtExpiryMinutes => 
        int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES") ?? "60");

    // Cookie Authentication
    public static string CookieAuthName => 
        Environment.GetEnvironmentVariable("COOKIE_AUTH_NAME") ?? "StockFlowProAuth";
    
    public static bool CookieSecure => 
        bool.Parse(Environment.GetEnvironmentVariable("COOKIE_SECURE") ?? "false");
    
    public static SameSiteMode CookieSameSite => 
        Enum.Parse<SameSiteMode>(Environment.GetEnvironmentVariable("COOKIE_SAME_SITE") ?? "Lax");

    // Password Security - Enhanced requirements
    public static int PasswordMinLength => 
        int.Parse(Environment.GetEnvironmentVariable("PASSWORD_MIN_LENGTH") ?? "12");
    
    public static bool PasswordRequireUppercase => 
        bool.Parse(Environment.GetEnvironmentVariable("PASSWORD_REQUIRE_UPPERCASE") ?? "true");
    
    public static bool PasswordRequireLowercase => 
        bool.Parse(Environment.GetEnvironmentVariable("PASSWORD_REQUIRE_LOWERCASE") ?? "true");
    
    public static bool PasswordRequireNumbers => 
        bool.Parse(Environment.GetEnvironmentVariable("PASSWORD_REQUIRE_NUMBERS") ?? "true");
    
    public static bool PasswordRequireSpecialChars => 
        bool.Parse(Environment.GetEnvironmentVariable("PASSWORD_REQUIRE_SPECIAL_CHARS") ?? "true");

    // Rate Limiting
    public static int RateLimitUserCreationPerHour => 
        int.Parse(Environment.GetEnvironmentVariable("RATE_LIMIT_USER_CREATION_PER_HOUR") ?? "3");
    
    public static int RateLimitIpCreationPerHour => 
        int.Parse(Environment.GetEnvironmentVariable("RATE_LIMIT_IP_CREATION_PER_HOUR") ?? "10");
    
    public static int RateLimitSyncPerHour => 
        int.Parse(Environment.GetEnvironmentVariable("RATE_LIMIT_SYNC_PER_HOUR") ?? "5");

    // Email Configuration
    public static string SmtpHost => 
        Environment.GetEnvironmentVariable("SMTP_HOST") ?? "localhost";
    
    public static int SmtpPort => 
        int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
    
    public static string SmtpUsername => 
        Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? "dev@stockflowpro.com";
    
    public static string SmtpPassword => 
        Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "dev-password";
    
    public static bool SmtpUseSsl => 
        bool.Parse(Environment.GetEnvironmentVariable("SMTP_USE_SSL") ?? "false");
    
    public static string SmtpFromEmail => 
        Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? "noreply@stockflowpro.local";
    
    public static string SmtpFromName => 
        Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? "StockFlow Pro Dev";

    // Logging Configuration
    public static string LogLevelDefault => 
        Environment.GetEnvironmentVariable("LOG_LEVEL_DEFAULT") ?? "Information";
    
    public static string LogLevelMicrosoft => 
        Environment.GetEnvironmentVariable("LOG_LEVEL_MICROSOFT") ?? "Warning";
    
    public static string LogLevelSystem => 
        Environment.GetEnvironmentVariable("LOG_LEVEL_SYSTEM") ?? "Warning";

    // Storage Configuration
    public static string StorageType => 
        Environment.GetEnvironmentVariable("STORAGE_TYPE") ?? "Local";
    
    public static string StorageConnectionString => 
        Environment.GetEnvironmentVariable("STORAGE_CONNECTION_STRING") ?? "./uploads";

    // Development Settings
    public static bool DetailedErrors => 
        bool.Parse(Environment.GetEnvironmentVariable("DETAILED_ERRORS") ?? "true");
    
    public static bool DeveloperExceptionPage => 
        bool.Parse(Environment.GetEnvironmentVariable("DEVELOPER_EXCEPTION_PAGE") ?? "true");
    
    public static string MockDataFilePath => 
        Environment.GetEnvironmentVariable("MOCK_DATA_FILE_PATH") ?? "./App_Data/mock-users.json";

    // Security Settings
    public static bool ForceHttps => 
        bool.Parse(Environment.GetEnvironmentVariable("FORCE_HTTPS") ?? "false");
    
    public static int HstsMaxAgeSeconds => 
        int.Parse(Environment.GetEnvironmentVariable("HSTS_MAX_AGE_SECONDS") ?? "0");
    
    public static bool HstsIncludeSubdomains => 
        bool.Parse(Environment.GetEnvironmentVariable("HSTS_INCLUDE_SUBDOMAINS") ?? "false");

    // Content Security Policy
    public static string CspDefaultSrc => 
        Environment.GetEnvironmentVariable("CSP_DEFAULT_SRC") ?? "'self' 'unsafe-inline' 'unsafe-eval'";
    
    public static string CspScriptSrc => 
        Environment.GetEnvironmentVariable("CSP_SCRIPT_SRC") ?? "'self' 'unsafe-inline' 'unsafe-eval'";
    
    public static string CspStyleSrc => 
        Environment.GetEnvironmentVariable("CSP_STYLE_SRC") ?? "'self' 'unsafe-inline'";

    /// <summary>
    /// Generates a cryptographically secure random key
    /// </summary>
    /// <param name="length">Length of the key in characters</param>
    /// <returns>Base64 encoded random key</returns>
    private static string GenerateSecureRandomKey(int length)
    {
        try
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[length];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }
        catch (Exception ex)
        {
            // Fallback to a more secure default if random generation fails
            throw new InvalidOperationException("Failed to generate secure random key", ex);
        }
    }

    /// <summary>
    /// Validates that all required environment variables are set
    /// </summary>
    public static void ValidateConfiguration()
    {
        var requiredVars = new[]
        {
            ("DATABASE_CONNECTION_STRING", DatabaseConnectionString),
            ("JWT_SECRET_KEY", JwtSecretKey)
        };

        var missingVars = requiredVars
            .Where(var => string.IsNullOrWhiteSpace(var.Item2))
            .Select(var => var.Item1)
            .ToList();

        if (missingVars.Any())
        {
            throw new InvalidOperationException(
                $"Missing required environment variables: {string.Join(", ", missingVars)}");
        }

        // Validate JWT secret key length
        if (JwtSecretKey.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT_SECRET_KEY must be at least 32 characters long for security.");
        }
    }

    /// <summary>
    /// Gets all configuration values for debugging (excludes sensitive data)
    /// </summary>
    public static Dictionary<string, object> GetConfigurationSummary()
    {
        return new Dictionary<string, object>
        {
            ["Environment"] = AspNetCoreEnvironment,
            ["UseMockData"] = UseMockData,
            ["DatabaseType"] = DatabaseConnectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase) ? "SQL Server" : "Other",
            ["CookieSecure"] = CookieSecure,
            ["CookieSameSite"] = CookieSameSite.ToString(),
            ["PasswordMinLength"] = PasswordMinLength,
            ["RateLimitUserCreation"] = RateLimitUserCreationPerHour,
            ["RateLimitIpCreation"] = RateLimitIpCreationPerHour,
            ["StorageType"] = StorageType,
            ["DetailedErrors"] = DetailedErrors,
            ["ForceHttps"] = ForceHttps,
            ["HstsEnabled"] = HstsMaxAgeSeconds > 0
        };
    }
}