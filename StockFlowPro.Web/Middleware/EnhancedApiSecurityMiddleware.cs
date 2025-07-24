using Microsoft.Extensions.Options;
using StockFlowPro.Web.Configuration;
using System.Collections.Concurrent;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Enhanced API security middleware with multiple layers of protection
/// </summary>
public class EnhancedApiSecurityMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<EnhancedApiSecurityMiddleware> _logger;
    private readonly StockFlowPro.Web.Configuration.ApiSecurityOptions _options;
    
    // Threat detection storage
    private static readonly ConcurrentDictionary<string, ThreatProfile> _threatProfiles = new();
    private static readonly ConcurrentDictionary<string, List<DateTime>> _suspiciousActivity = new();
    
    // Security patterns
    private static readonly Regex[] MaliciousPatterns = new[]
    {
        new Regex(@"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)", RegexOptions.IgnoreCase),
        new Regex(@"<script[^>]*>.*?</script>", RegexOptions.IgnoreCase | RegexOptions.Singleline),
        new Regex(@"javascript:", RegexOptions.IgnoreCase),
        new Regex(@"\.\./|\.\.\\|%2e%2e%2f|%2e%2e%5c", RegexOptions.IgnoreCase),
        new Regex(@"(eval\s*\(|setTimeout\s*\(|setInterval\s*\()", RegexOptions.IgnoreCase),
        new Regex(@"(\${|<%|%>|{{|}}})", RegexOptions.IgnoreCase), // Template injection
        new Regex(@"(file://|ftp://|ldap://|dict://|gopher://)", RegexOptions.IgnoreCase), // SSRF
        new Regex(@"(\b(cmd|powershell|bash|sh|exec|system)\b)", RegexOptions.IgnoreCase) // Command injection
    };

    public EnhancedApiSecurityMiddleware(
        RequestDelegate next,
        ILogger<EnhancedApiSecurityMiddleware> logger,
        IOptions<ApiSecurityOptions> options)
    {
        _next = next;
        _logger = logger;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip security checks for non-API endpoints
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            await _next(context);
            return;
        }

        // Skip security checks for CORS preflight requests
        if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var clientIp = GetClientIpAddress(context);
        var userAgent = context.Request.Headers["User-Agent"].ToString();
        var requestId = Guid.NewGuid().ToString("N")[..8];

        try
        {
            _logger.LogDebug("API Security check started for {RequestId} from {ClientIp}", requestId, clientIp);

            // 1. Check if IP is allowed (skip security checks for allowed IPs in development)
            if (IsIpAllowed(clientIp))
            {
                _logger.LogDebug("Allowed IP {ClientIp} - skipping security checks - Request {RequestId}", clientIp, requestId);
                await _next(context);
                return;
            }

            // 2. Check if IP is blocked
            if (await IsIpBlocked(clientIp))
            {
                _logger.LogWarning("Blocked IP {ClientIp} attempted access - Request {RequestId}", clientIp, requestId);
                await RejectRequest(context, "Access denied", HttpStatusCode.Forbidden);
                return;
            }

            // 2. Validate request headers
            if (!await ValidateRequestHeaders(context, clientIp, requestId))
            {
                return;
            }

            // 3. Check for suspicious patterns in request
            if (!await ValidateRequestContent(context, clientIp, requestId))
            {
                return;
            }

            // 4. Rate limiting with adaptive thresholds
            if (!await CheckAdaptiveRateLimit(context, clientIp, requestId))
            {
                return;
            }

            // 5. Validate API key if required
            if (!await ValidateApiKey(context, clientIp, requestId))
            {
                return;
            }

            // 6. Check for bot/automated traffic
            if (!await ValidateBotDetection(context, clientIp, userAgent, requestId))
            {
                return;
            }

            // 7. Update threat profile
            UpdateThreatProfile(clientIp, false);

            // Add security headers to response
            AddSecurityHeaders(context);

            await _next(context);

            _logger.LogDebug("API Security check passed for {RequestId}", requestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in API security middleware for {RequestId}", requestId);
            await RejectRequest(context, "Security validation failed", HttpStatusCode.InternalServerError);
        }
    }

    private async Task<bool> ValidateRequestHeaders(HttpContext context, string clientIp, string requestId)
    {
        var headers = context.Request.Headers;

        // Check for missing required headers
        if (_options.RequireUserAgent && !headers.ContainsKey("User-Agent"))
        {
            _logger.LogWarning("Missing User-Agent header from {ClientIp} - Request {RequestId}", clientIp, requestId);
            UpdateThreatProfile(clientIp, true);
            await RejectRequest(context, "Missing required headers", HttpStatusCode.BadRequest);
            return false;
        }

        // Check for suspicious header values
        foreach (var header in headers)
        {
            if (ContainsMaliciousContent(header.Value.ToString()))
            {
                _logger.LogWarning("Malicious content in header {HeaderName} from {ClientIp} - Request {RequestId}", 
                    header.Key, clientIp, requestId);
                UpdateThreatProfile(clientIp, true);
                await RejectRequest(context, "Invalid request headers", HttpStatusCode.BadRequest);
                return false;
            }
        }

        // Check for header injection attempts
        var suspiciousHeaders = new[] { "X-Forwarded-For", "X-Real-IP", "X-Originating-IP" };
        foreach (var suspiciousHeader in suspiciousHeaders)
        {
            if (headers.ContainsKey(suspiciousHeader))
            {
                var value = headers[suspiciousHeader].ToString();
                if (ContainsMaliciousContent(value) || value.Split(',').Length > 5)
                {
                    _logger.LogWarning("Suspicious {HeaderName} header from {ClientIp} - Request {RequestId}", 
                        suspiciousHeader, clientIp, requestId);
                    UpdateThreatProfile(clientIp, true);
                }
            }
        }

        return true;
    }

    private async Task<bool> ValidateRequestContent(HttpContext context, string clientIp, string requestId)
    {
        // Validate query parameters
        foreach (var param in context.Request.Query)
        {
            if (ContainsMaliciousContent(param.Value.ToString()))
            {
                _logger.LogWarning("Malicious query parameter {ParamName} from {ClientIp} - Request {RequestId}", 
                    param.Key, clientIp, requestId);
                UpdateThreatProfile(clientIp, true);
                await RejectRequest(context, "Invalid request parameters", HttpStatusCode.BadRequest);
                return false;
            }
        }

        // Validate JSON body for POST/PUT requests
        if (context.Request.ContentLength > 0 && 
            context.Request.ContentType?.Contains("application/json") == true)
        {
            context.Request.EnableBuffering();
            var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
            context.Request.Body.Position = 0;

            if (ContainsMaliciousContent(body))
            {
                _logger.LogWarning("Malicious JSON content from {ClientIp} - Request {RequestId}", clientIp, requestId);
                UpdateThreatProfile(clientIp, true);
                await RejectRequest(context, "Invalid request content", HttpStatusCode.BadRequest);
                return false;
            }

            // Check for oversized payloads
            if (body.Length > _options.MaxRequestBodySize)
            {
                _logger.LogWarning("Oversized request body ({Size} bytes) from {ClientIp} - Request {RequestId}", 
                    body.Length, clientIp, requestId);
                await RejectRequest(context, "Request too large", HttpStatusCode.RequestEntityTooLarge);
                return false;
            }
        }

        return true;
    }

    private async Task<bool> CheckAdaptiveRateLimit(HttpContext context, string clientIp, string requestId)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        var threatProfile = _threatProfiles.GetValueOrDefault(clientIp, new ThreatProfile());
        
        // Adjust rate limits based on threat level
        var baseLimit = GetBaseLimitForPath(path);
        var adjustedLimit = threatProfile.ThreatLevel switch
        {
            ThreatLevel.Low => baseLimit,
            ThreatLevel.Medium => (int)(baseLimit * 0.7),
            ThreatLevel.High => (int)(baseLimit * 0.3),
            ThreatLevel.Critical => 1,
            _ => baseLimit
        };

        var key = $"{clientIp}:{path}";
        var windowStart = DateTime.UtcNow.AddMinutes(-_options.RateLimitWindowMinutes);
        
        var requests = _suspiciousActivity.GetOrAdd(key, _ => new List<DateTime>());
        
        bool rateLimitExceeded;
        
        // Perform synchronous operations inside lock
        lock (requests)
        {
            requests.RemoveAll(r => r < windowStart);
            rateLimitExceeded = requests.Count >= adjustedLimit;
            
            if (!rateLimitExceeded)
            {
                requests.Add(DateTime.UtcNow);
            }
        }
        
        // Handle rate limit exceeded outside of lock
        if (rateLimitExceeded)
        {
            _logger.LogWarning("Rate limit exceeded for {ClientIp} on {Path} - Request {RequestId} (Limit: {Limit})", 
                clientIp, path, requestId, adjustedLimit);
            
            context.Response.Headers["Retry-After"] = (_options.RateLimitWindowMinutes * 60).ToString();
            
            UpdateThreatProfile(clientIp, true);
            await RejectRequest(context, "Rate limit exceeded", HttpStatusCode.TooManyRequests);
            return false;
        }

        return true;
    }

    private async Task<bool> ValidateApiKey(HttpContext context, string clientIp, string requestId)
    {
        if (!_options.RequireApiKey)
           { return true;}

        // Skip API key validation for auth endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth"))
           { return true;}

        var apiKey = ExtractApiKey(context.Request);
        
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Missing API key from {ClientIp} - Request {RequestId}", clientIp, requestId);
            UpdateThreatProfile(clientIp, true);
            await RejectRequest(context, "API key required", HttpStatusCode.Unauthorized);
            return false;
        }

        if (!IsValidApiKey(apiKey))
        {
            _logger.LogWarning("Invalid API key from {ClientIp} - Request {RequestId}", clientIp, requestId);
            UpdateThreatProfile(clientIp, true);
            await RejectRequest(context, "Invalid API key", HttpStatusCode.Unauthorized);
            return false;
        }

        return true;
    }

    private async Task<bool> ValidateBotDetection(HttpContext context, string clientIp, string userAgent, string requestId)
    {
        if (!_options.EnableBotDetection)
            {return true;}

        // Check for bot patterns in User-Agent
        var botPatterns = new[]
        {
            @"bot|crawler|spider|scraper",
            @"curl|wget|python|java|go-http",
            @"postman|insomnia|httpie",
            @"scanner|exploit|attack"
        };

        foreach (var pattern in botPatterns)
        {
            if (Regex.IsMatch(userAgent, pattern, RegexOptions.IgnoreCase))
            {
                _logger.LogWarning("Bot detected: {UserAgent} from {ClientIp} - Request {RequestId}", 
                    userAgent, clientIp, requestId);
                
                if (_options.BlockBots)
                {
                    UpdateThreatProfile(clientIp, true);
                    await RejectRequest(context, "Automated traffic not allowed", HttpStatusCode.Forbidden);
                    return false;
                }
            }
        }

        // Check for missing common browser headers
        var browserHeaders = new[] { "Accept", "Accept-Language", "Accept-Encoding" };
        var missingHeaders = browserHeaders.Count(h => !context.Request.Headers.ContainsKey(h));
        
        if (missingHeaders >= 2)
        {
            _logger.LogWarning("Suspicious request pattern from {ClientIp} - Request {RequestId} (Missing {Count} browser headers)", 
                clientIp, requestId, missingHeaders);
            UpdateThreatProfile(clientIp, true);
        }

        return true;
    }

    private bool ContainsMaliciousContent(string input)
    {
        if (string.IsNullOrEmpty(input))
           { return false;}

        return MaliciousPatterns.Any(pattern => pattern.IsMatch(input));
    }

    private string GetClientIpAddress(HttpContext context)
    {
        // Check for forwarded IP first (for load balancers/proxies)
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

    private string? ExtractApiKey(HttpRequest request)
    {
        // Try header first
        if (request.Headers.TryGetValue(_options.ApiKeyHeaderName, out var headerValue))
        {
            return headerValue.FirstOrDefault();
        }

        // Try query parameter if allowed
        if (_options.AllowApiKeyInQuery && 
            request.Query.TryGetValue(_options.ApiKeyQueryParam, out var queryValue))
        {
            return queryValue.FirstOrDefault();
        }

        return null;
    }

    private bool IsValidApiKey(string apiKey)
    {
        return _options.ValidApiKeys.Contains(apiKey);
    }

    private int GetBaseLimitForPath(string path)
    {
        // Use configured endpoint rate limits if available
        if (_options.EndpointRateLimits.TryGetValue(path, out var configuredLimit))
        {
            return configuredLimit;
        }

        return path switch
        {
            var p when p.Contains("/auth/login") => _options.EndpointRateLimits.GetValueOrDefault("/api/auth/login", 5),
            var p when p.Contains("/auth/register") => _options.EndpointRateLimits.GetValueOrDefault("/api/auth/register", 3),
            var p when p.Contains("/auth/") => 10,
            var p when p.Contains("/users") => _options.EndpointRateLimits.GetValueOrDefault("/api/users", 100),
            _ => _options.DefaultRateLimit
        };
    }

    private bool IsIpAllowed(string clientIp)
    {
        if (_options.AllowedIps == null || !_options.AllowedIps.Any())
        {
            return false;
        }

        // Check for exact match
        if (_options.AllowedIps.Contains(clientIp))
        {
            return true;
        }

        // Check for localhost variations
        var localhostIps = new[] { "127.0.0.1", "::1", "localhost" };
        if (localhostIps.Contains(clientIp) && _options.AllowedIps.Any(ip => localhostIps.Contains(ip)))
        {
            return true;
        }

        return false;
    }

    private Task<bool> IsIpBlocked(string clientIp)
    {
        var threatProfile = _threatProfiles.GetValueOrDefault(clientIp);
        if (threatProfile?.ThreatLevel == ThreatLevel.Critical)
        {
            var blockDuration = TimeSpan.FromMinutes(_options.BlockDurationMinutes);
            return Task.FromResult(DateTime.UtcNow - threatProfile.LastActivity < blockDuration);
        }
        return Task.FromResult(false);
    }

    private void UpdateThreatProfile(string clientIp, bool isSuspicious)
    {
        _threatProfiles.AddOrUpdate(clientIp,
            new ThreatProfile 
            { 
                ThreatLevel = isSuspicious ? ThreatLevel.Low : ThreatLevel.None,
                SuspiciousActivityCount = isSuspicious ? 1 : 0,
                LastActivity = DateTime.UtcNow
            },
            (key, existing) =>
            {
                existing.LastActivity = DateTime.UtcNow;
                
                if (isSuspicious)
                {
                    existing.SuspiciousActivityCount++;
                    existing.ThreatLevel = existing.SuspiciousActivityCount switch
                    {
                        >= 10 => ThreatLevel.Critical,
                        >= 5 => ThreatLevel.High,
                        >= 2 => ThreatLevel.Medium,
                        _ => ThreatLevel.Low
                    };
                }
                else if (existing.SuspiciousActivityCount > 0)
                {
                    existing.SuspiciousActivityCount = Math.Max(0, existing.SuspiciousActivityCount - 1);
                }
                
                return existing;
            });
    }

    private void AddSecurityHeaders(HttpContext context)
    {
        var response = context.Response;
        
        // API-specific security headers
        response.Headers["X-Content-Type-Options"] = "nosniff";
        response.Headers["X-Frame-Options"] = "DENY";
        response.Headers["X-XSS-Protection"] = "1; mode=block";
        response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        response.Headers["X-API-Version"] = "1.0";
        response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        
        // Remove server information
        response.Headers.Remove("Server");
        response.Headers.Remove("X-Powered-By");
    }

    private async Task RejectRequest(HttpContext context, string message, HttpStatusCode statusCode)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            message = message,
            timestamp = DateTime.UtcNow,
            requestId = Guid.NewGuid().ToString("N")[..8]
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

// Supporting classes - using the main ApiSecurityOptions from Configuration namespace

public class ThreatProfile
{
    public ThreatLevel ThreatLevel { get; set; } = ThreatLevel.None;
    public int SuspiciousActivityCount { get; set; } = 0;
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
}

public enum ThreatLevel
{
    None = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

public static class EnhancedApiSecurityMiddlewareExtensions
{
    public static IApplicationBuilder UseEnhancedApiSecurity(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<EnhancedApiSecurityMiddleware>();
    }
}