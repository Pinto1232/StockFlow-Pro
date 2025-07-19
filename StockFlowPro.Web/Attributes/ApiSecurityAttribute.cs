using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace StockFlowPro.Web.Attributes;

/// <summary>
/// Attribute to enforce API security at the controller/action level
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ApiSecurityAttribute : ActionFilterAttribute
{
    public bool RequireApiKey { get; set; } = false;
    public bool RequireAuthentication { get; set; } = true;
    public bool ValidateInput { get; set; } = true;
    public bool RequireHttps { get; set; } = true;
    public string[] AllowedRoles { get; set; } = Array.Empty<string>();
    public int MaxRequestsPerMinute { get; set; } = 60;
    public bool LogSecurityEvents { get; set; } = true;

    private static readonly Dictionary<string, List<DateTime>> _requestCounts = new();
    private static readonly object _lockObject = new();

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var logger = context.HttpContext.RequestServices.GetService<ILogger<ApiSecurityAttribute>>();
        var clientIp = GetClientIpAddress(context.HttpContext);
        var actionName = $"{context.Controller.GetType().Name}.{context.ActionDescriptor.DisplayName}";

        try
        {
            // 1. HTTPS Enforcement
            if (RequireHttps && !context.HttpContext.Request.IsHttps && 
                !IsLocalhost(context.HttpContext.Request.Host.Host))
            {
                logger?.LogWarning("HTTPS required for {Action} from {ClientIp}", actionName, clientIp);
                await RejectRequest(context, "HTTPS required", HttpStatusCode.UpgradeRequired);
                return;
            }

            // 2. Authentication Check
            if (RequireAuthentication && !context.HttpContext.User.Identity?.IsAuthenticated == true)
            {
                logger?.LogWarning("Authentication required for {Action} from {ClientIp}", actionName, clientIp);
                await RejectRequest(context, "Authentication required", HttpStatusCode.Unauthorized);
                return;
            }

            // 3. Role-based Authorization
            if (AllowedRoles.Length > 0 && context.HttpContext.User.Identity?.IsAuthenticated == true)
            {
                var userRoles = context.HttpContext.User.Claims
                    .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToArray();

                if (!AllowedRoles.Any(role => userRoles.Contains(role)))
                {
                    logger?.LogWarning("Insufficient permissions for {Action} from {ClientIp}. Required: {RequiredRoles}, User: {UserRoles}", 
                        actionName, clientIp, string.Join(",", AllowedRoles), string.Join(",", userRoles));
                    await RejectRequest(context, "Insufficient permissions", HttpStatusCode.Forbidden);
                    return;
                }
            }

            // 4. API Key Validation
            if (RequireApiKey)
            {
                var apiKey = ExtractApiKey(context.HttpContext.Request);
                if (string.IsNullOrEmpty(apiKey) || !IsValidApiKey(apiKey, context.HttpContext))
                {
                    logger?.LogWarning("Invalid or missing API key for {Action} from {ClientIp}", actionName, clientIp);
                    await RejectRequest(context, "Valid API key required", HttpStatusCode.Unauthorized);
                    return;
                }
            }

            // 5. Rate Limiting
            if (!CheckRateLimit(clientIp, actionName))
            {
                logger?.LogWarning("Rate limit exceeded for {Action} from {ClientIp}", actionName, clientIp);
                context.HttpContext.Response.Headers["Retry-After"] = "60";
                await RejectRequest(context, "Rate limit exceeded", HttpStatusCode.TooManyRequests);
                return;
            }

            // 6. Input Validation
            if (ValidateInput && !await ValidateActionInputs(context, logger, clientIp, actionName))
            {
                return;
            }

            // 7. Add security headers
            AddSecurityHeaders(context.HttpContext);

            // Log successful security check
            if (LogSecurityEvents)
            {
                logger?.LogInformation("Security validation passed for {Action} from {ClientIp}", actionName, clientIp);
            }

            await next();
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Security validation error for {Action} from {ClientIp}", actionName, clientIp);
            await RejectRequest(context, "Security validation failed", HttpStatusCode.InternalServerError);
        }
    }

    private async Task<bool> ValidateActionInputs(ActionExecutingContext context, ILogger? logger, string clientIp, string actionName)
    {
        // Validate action parameters
        foreach (var parameter in context.ActionArguments)
        {
            if (parameter.Value == null){ continue;}

            var parameterValue = parameter.Value.ToString();
            if (ContainsMaliciousContent(parameterValue))
            {
                logger?.LogWarning("Malicious content detected in parameter {ParameterName} for {Action} from {ClientIp}", 
                    parameter.Key, actionName, clientIp);
                await RejectRequest(context, "Invalid input detected", HttpStatusCode.BadRequest);
                return false;
            }

            // Validate complex objects
            if (parameter.Value.GetType().IsClass && parameter.Value.GetType() != typeof(string))
            {
                var json = JsonSerializer.Serialize(parameter.Value);
                if (ContainsMaliciousContent(json))
                {
                    logger?.LogWarning("Malicious content detected in object parameter {ParameterName} for {Action} from {ClientIp}", 
                        parameter.Key, actionName, clientIp);
                    await RejectRequest(context, "Invalid input detected", HttpStatusCode.BadRequest);
                    return false;
                }
            }
        }

        // Validate model state
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            logger?.LogWarning("Model validation failed for {Action} from {ClientIp}: {Errors}", 
                actionName, clientIp, string.Join(", ", errors));
            
            await RejectRequest(context, "Validation failed", HttpStatusCode.BadRequest, errors);
            return false;
        }

        return true;
    }

    private bool ContainsMaliciousContent(string? input)
    {
        if (string.IsNullOrEmpty(input)) {return false;}

        var maliciousPatterns = new[]
        {
            @"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)", // SQL Injection
            @"<script[^>]*>.*?</script>", // XSS
            @"javascript:", // XSS
            @"\.\./|\.\.\\|%2e%2e%2f|%2e%2e%5c", // Path Traversal
            @"(eval\s*\(|setTimeout\s*\(|setInterval\s*\()", // Code Injection
            @"(\${|<%|%>|{{|}}})", // Template Injection
            @"(file://|ftp://|ldap://|dict://|gopher://)", // SSRF
            @"(\b(cmd|powershell|bash|sh|exec|system)\b)" // Command Injection
        };

        return maliciousPatterns.Any(pattern => 
            Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase));
    }

    private bool CheckRateLimit(string clientIp, string actionName)
    {
        if (MaxRequestsPerMinute <= 0) {return true;}

        var key = $"{clientIp}:{actionName}";
        var now = DateTime.UtcNow;
        var windowStart = now.AddMinutes(-1);

        lock (_lockObject)
        {
            if (!_requestCounts.ContainsKey(key))
            {
                _requestCounts[key] = new List<DateTime>();
            }

            var requests = _requestCounts[key];
            requests.RemoveAll(r => r < windowStart);

            if (requests.Count >= MaxRequestsPerMinute)
            {
                return false;
            }

            requests.Add(now);
            return true;
        }
    }

    private string? ExtractApiKey(HttpRequest request)
    {
        // Try header first
        if (request.Headers.TryGetValue("X-API-Key", out var headerValue))
        {
            return headerValue.FirstOrDefault();
        }

        // Try authorization header
        if (request.Headers.TryGetValue("Authorization", out var authValue))
        {
            var auth = authValue.FirstOrDefault();
            if (auth?.StartsWith("ApiKey ") == true)
            {
                return auth.Substring(7);
            }
        }

        return null;
    }

    private bool IsValidApiKey(string apiKey, HttpContext context)
    {
        // Get API keys from configuration
        var configuration = context.RequestServices.GetService<IConfiguration>();
        var validKeys = configuration?.GetSection("ApiSecurity:ValidApiKeys").Get<string[]>() ?? Array.Empty<string>();
        
        return validKeys.Contains(apiKey);
    }

    private bool IsLocalhost(string host)
    {
        return host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
               host.Equals("127.0.0.1") ||
               host.Equals("::1");
    }

    private string GetClientIpAddress(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private void AddSecurityHeaders(HttpContext context)
    {
        var response = context.Response;
        
        if (!response.Headers.ContainsKey("X-Content-Type-Options"))
           { response.Headers["X-Content-Type-Options"] = "nosniff";}
        
        if (!response.Headers.ContainsKey("X-Frame-Options"))
           { response.Headers["X-Frame-Options"] = "DENY";}
        
        if (!response.Headers.ContainsKey("X-XSS-Protection"))
            {response.Headers["X-XSS-Protection"] = "1; mode=block";}
        
        if (!response.Headers.ContainsKey("Referrer-Policy"))
           { response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";}
        
        if (!response.Headers.ContainsKey("Cache-Control"))
          {  response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";}
    }

    private Task RejectRequest(ActionExecutingContext context, string message, HttpStatusCode statusCode, List<string>? errors = null)
    {
        context.Result = new ObjectResult(new
        {
            success = false,
            message = message,
            errors = errors,
            timestamp = DateTime.UtcNow
        })
        {
            StatusCode = (int)statusCode
        };
        
        return Task.CompletedTask;
    }
}

/// <summary>
/// Specialized attribute for high-security API endpoints
/// </summary>
public class HighSecurityApiAttribute : ApiSecurityAttribute
{
    public HighSecurityApiAttribute()
    {
        RequireApiKey = true;
        RequireAuthentication = true;
        RequireHttps = true;
        ValidateInput = true;
        MaxRequestsPerMinute = 30;
        LogSecurityEvents = true;
    }
}

/// <summary>
/// Attribute for admin-only API endpoints
/// </summary>
public class AdminOnlyApiAttribute : ApiSecurityAttribute
{
    public AdminOnlyApiAttribute()
    {
        RequireAuthentication = true;
        RequireHttps = true;
        AllowedRoles = new[] { "Admin" };
        MaxRequestsPerMinute = 100;
        LogSecurityEvents = true;
    }
}

/// <summary>
/// Attribute for public API endpoints with basic protection
/// </summary>
public class PublicApiAttribute : ApiSecurityAttribute
{
    public PublicApiAttribute()
    {
        RequireAuthentication = false;
        RequireApiKey = false;
        RequireHttps = false;
        ValidateInput = true;
        MaxRequestsPerMinute = 120;
        LogSecurityEvents = false;
    }
}