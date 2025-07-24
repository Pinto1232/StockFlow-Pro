using System.Collections.Concurrent;
using System.Net;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Middleware to implement rate limiting for API endpoints
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    
    // Store request counts per IP address
    private static readonly ConcurrentDictionary<string, RequestCounter> _requestCounts = new();
    
    // Rate limiting rules
    private static readonly Dictionary<string, RateLimitRule> _rateLimitRules = new()
    {
        { "/api/auth/login", new RateLimitRule { MaxRequests = 5, WindowMinutes = 15 } },
        { "/api/auth/register", new RateLimitRule { MaxRequests = 3, WindowMinutes = 60 } },
        { "/api/auth/forgot-password", new RateLimitRule { MaxRequests = 3, WindowMinutes = 60 } },
        { "/api/users", new RateLimitRule { MaxRequests = 100, WindowMinutes = 60 } },
        { "/api/", new RateLimitRule { MaxRequests = 1000, WindowMinutes = 60 } } // General API limit
    };

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip rate limiting for CORS preflight requests
        if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var clientIp = GetClientIpAddress(context);
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Find applicable rate limit rule
        var rule = GetApplicableRule(path);
        if (rule != null)
        {
            var key = $"{clientIp}:{path}";
            var isAllowed = CheckRateLimit(key, rule);

            if (!isAllowed)
            {
                _logger.LogWarning("Rate limit exceeded for IP {ClientIp} on path {Path}", clientIp, path);
                
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = (rule.WindowMinutes * 60).ToString();
                
                await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
                return;
            }
        }

        await _next(context);
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

    private RateLimitRule? GetApplicableRule(string path)
    {
        // Find the most specific rule that matches
        return _rateLimitRules
            .Where(kvp => path.StartsWith(kvp.Key))
            .OrderByDescending(kvp => kvp.Key.Length)
            .FirstOrDefault().Value;
    }

    private bool CheckRateLimit(string key, RateLimitRule rule)
    {
        var now = DateTime.UtcNow;
        var windowStart = now.AddMinutes(-rule.WindowMinutes);

        _requestCounts.AddOrUpdate(key, 
            new RequestCounter { Requests = new List<DateTime> { now } },
            (k, counter) =>
            {
                lock (counter)
                {
                    // Remove old requests outside the window
                    counter.Requests.RemoveAll(r => r < windowStart);
                    
                    // Check if we're within the limit
                    if (counter.Requests.Count < rule.MaxRequests)
                    {
                        counter.Requests.Add(now);
                        return counter;
                    }
                    
                    return counter;
                }
            });

        var currentCounter = _requestCounts[key];
        lock (currentCounter)
        {
            return currentCounter.Requests.Count <= rule.MaxRequests;
        }
    }

    // Cleanup old entries periodically (this would be better as a background service)
    private static void CleanupOldEntries()
    {
        var cutoff = DateTime.UtcNow.AddHours(-24);
        var keysToRemove = new List<string>();

        foreach (var kvp in _requestCounts)
        {
            lock (kvp.Value)
            {
                kvp.Value.Requests.RemoveAll(r => r < cutoff);
                if (!kvp.Value.Requests.Any())
                {
                    keysToRemove.Add(kvp.Key);
                }
            }
        }

        foreach (var key in keysToRemove)
        {
            _requestCounts.TryRemove(key, out _);
        }
    }
}

/// <summary>
/// Rate limiting rule configuration
/// </summary>
public class RateLimitRule
{
    public int MaxRequests { get; set; }
    public int WindowMinutes { get; set; }
}

/// <summary>
/// Request counter for tracking requests per client
/// </summary>
public class RequestCounter
{
    public List<DateTime> Requests { get; set; } = new();
}

/// <summary>
/// Extension method to register the rate limiting middleware
/// </summary>
public static class RateLimitingMiddlewareExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RateLimitingMiddleware>();
    }
}