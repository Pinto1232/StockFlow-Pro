using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Middleware to validate and sanitize input to prevent injection attacks
/// </summary>
public class InputValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<InputValidationMiddleware> _logger;

    // Patterns for detecting potential injection attacks
    private static readonly Regex[] SqlInjectionPatterns = new[]
    {
        new Regex(@"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)", RegexOptions.IgnoreCase),
        new Regex(@"(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)", RegexOptions.IgnoreCase),
        new Regex(@"('|('')|;|--|\*|\|)", RegexOptions.IgnoreCase),
        new Regex(@"(\b(SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|ONCLICK)\b)", RegexOptions.IgnoreCase)
    };

    private static readonly Regex[] XssPatterns = new[]
    {
        new Regex(@"<script[^>]*>.*?</script>", RegexOptions.IgnoreCase | RegexOptions.Singleline),
        new Regex(@"javascript:", RegexOptions.IgnoreCase),
        new Regex(@"on\w+\s*=", RegexOptions.IgnoreCase),
        new Regex(@"<iframe[^>]*>.*?</iframe>", RegexOptions.IgnoreCase | RegexOptions.Singleline),
        new Regex(@"<object[^>]*>.*?</object>", RegexOptions.IgnoreCase | RegexOptions.Singleline),
        new Regex(@"<embed[^>]*>", RegexOptions.IgnoreCase),
        new Regex(@"<link[^>]*>", RegexOptions.IgnoreCase),
        new Regex(@"<meta[^>]*>", RegexOptions.IgnoreCase)
    };

    private static readonly Regex[] PathTraversalPatterns = new[]
    {
        new Regex(@"\.\./", RegexOptions.IgnoreCase),
        new Regex(@"\.\.\\", RegexOptions.IgnoreCase),
        new Regex(@"%2e%2e%2f", RegexOptions.IgnoreCase),
        new Regex(@"%2e%2e%5c", RegexOptions.IgnoreCase)
    };

    public InputValidationMiddleware(RequestDelegate next, ILogger<InputValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip validation for certain content types and paths
        if (ShouldSkipValidation(context))
        {
            await _next(context);
            return;
        }

        var originalBody = context.Request.Body;
        var clientIp = GetClientIpAddress(context);

        try
        {
            _logger.LogDebug("Validating request from {ClientIp} to {Path}", clientIp, context.Request.Path);
            // Validate query parameters
            if (context.Request.Query.Any())
            {
                foreach (var param in context.Request.Query)
                {
                    if (ContainsMaliciousContent(param.Value))
                    {
                        _logger.LogWarning("Malicious content detected in query parameter {ParamName} from IP {ClientIp}", 
                            param.Key, clientIp);
                        await RejectRequest(context, "Invalid request parameters");
                        return;
                    }
                }
            }

            // Validate form data
            if (context.Request.HasFormContentType)
            {
                var form = await context.Request.ReadFormAsync();
                foreach (var field in form)
                {
                    // Skip validation for known safe fields
                    if (IsSafeFormField(field.Key))
                    {
                        continue;
                    }

                    if (ContainsMaliciousContent(field.Value))
                    {
                        _logger.LogWarning("Malicious content detected in form field {FieldName} from IP {ClientIp}", 
                            field.Key, clientIp);
                        await RejectRequest(context, "Invalid form data");
                        return;
                    }
                }
            }

            // Validate JSON body for API requests
            if (context.Request.ContentType?.Contains("application/json") == true)
            {
                context.Request.EnableBuffering();
                var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
                context.Request.Body.Position = 0;

                if (!string.IsNullOrEmpty(body) && ContainsMaliciousContent(body))
                {
                    _logger.LogWarning("Malicious content detected in JSON body from IP {ClientIp}", clientIp);
                    await RejectRequest(context, "Invalid request body");
                    return;
                }
            }

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during input validation for IP {ClientIp}", clientIp);
            await RejectRequest(context, "Request validation failed");
        }
        finally
        {
            context.Request.Body = originalBody;
        }
    }

    private bool ShouldSkipValidation(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        var contentType = context.Request.ContentType?.ToLowerInvariant() ?? "";

        // Skip validation for static files
        var staticExtensions = new[] { ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf" };
        if (staticExtensions.Any(ext => path.EndsWith(ext)))
        {
            return true;
        }

        // Skip validation for file uploads
        if (contentType.Contains("multipart/form-data"))
        {
            return true;
        }

        // Skip validation for SignalR
        if (path.Contains("/stockflowhub"))
        {
            return true;
        }

        // Skip validation for authentication endpoints
        if (path.Contains("/login") || path.Contains("/auth") || path.Contains("/account"))
        {
            return true;
        }

        // Skip validation for API endpoints (they have their own validation)
        if (path.StartsWith("/api/"))
        {
            return true;
        }

        // Skip validation for home page and basic GET requests
        if (context.Request.Method == "GET" && (path == "/" || path == "" || path == "/home"))
        {
            return true;
        }

        // Skip validation for Razor Pages
        if (path.Contains(".cshtml") || context.Request.Query.ContainsKey("handler"))
        {
            return true;
        }

        return false;
    }

    private bool IsSafeFormField(string fieldName)
    {
        var safeFields = new[]
        {
            "__RequestVerificationToken",
            "__VIEWSTATE",
            "__VIEWSTATEGENERATOR",
            "__EVENTVALIDATION",
            "ReturnUrl",
            "handler"
        };

        return safeFields.Contains(fieldName, StringComparer.OrdinalIgnoreCase);
    }

    private bool ContainsMaliciousContent(string input)
    {
        if (string.IsNullOrEmpty(input))
            {return false;}

        // Check for SQL injection patterns
        foreach (var pattern in SqlInjectionPatterns)
        {
            if (pattern.IsMatch(input))
               { return true;}
        }

        // Check for XSS patterns
        foreach (var pattern in XssPatterns)
        {
            if (pattern.IsMatch(input))
               { return true;}
        }

        // Check for path traversal patterns
        foreach (var pattern in PathTraversalPatterns)
        {
            if (pattern.IsMatch(input))
                {return true;}
        }

        return false;
    }

    private bool ContainsMaliciousContent(Microsoft.Extensions.Primitives.StringValues values)
    {
        return values.Any(value => !string.IsNullOrEmpty(value) && ContainsMaliciousContent(value));
    }

    private string GetClientIpAddress(HttpContext context)
    {
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

    private async Task RejectRequest(HttpContext context, string message)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        
        var response = new { error = message, timestamp = DateTime.UtcNow };
        var json = JsonSerializer.Serialize(response);
        
        await context.Response.WriteAsync(json);
    }
}

/// <summary>
/// Extension method to register the input validation middleware
/// </summary>
public static class InputValidationMiddlewareExtensions
{
    public static IApplicationBuilder UseInputValidation(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<InputValidationMiddleware>();
    }
}