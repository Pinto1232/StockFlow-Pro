using Microsoft.Extensions.Options;
using StockFlowPro.Web.Configuration;
using System.Text.Json;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Middleware for API key authentication
/// </summary>
public class ApiKeyAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApiKeyOptions _options;
    private readonly ILogger<ApiKeyAuthenticationMiddleware> _logger;

    public ApiKeyAuthenticationMiddleware(
        RequestDelegate next,
        IOptions<ApiKeyOptions> options,
        ILogger<ApiKeyAuthenticationMiddleware> logger)
    {
        _next = next;
        _options = options.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip API key validation if not required
        if (!_options.RequireApiKey)
        {
            await _next(context);
            return;
        }

        // Skip API key validation for non-API endpoints
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            await _next(context);
            return;
        }

        // Skip API key validation for authentication endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth"))
        {
            await _next(context);
            return;
        }

        // Skip API key validation for health checks and swagger
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        var apiKey = ExtractApiKey(context.Request);

        if (string.IsNullOrEmpty(apiKey))
        {
            await HandleUnauthorized(context, "API key is required");
            return;
        }

        if (!IsValidApiKey(apiKey))
        {
            await HandleUnauthorized(context, "Invalid API key");
            return;
        }

        if (_options.LogApiKeyUsage)
        {
            _logger.LogInformation("Valid API key used for {Path} from {IP}", 
                context.Request.Path, 
                context.Connection.RemoteIpAddress);
        }

        await _next(context);
    }

    private string? ExtractApiKey(HttpRequest request)
    {
        // Try to get API key from header first
        if (request.Headers.TryGetValue(_options.HeaderName, out var headerValue))
        {
            return headerValue.FirstOrDefault();
        }

        // Try to get API key from query parameter if allowed
        if (_options.AllowQueryParameter && 
            request.Query.TryGetValue(_options.QueryParameterName, out var queryValue))
        {
            return queryValue.FirstOrDefault();
        }

        return null;
    }

    private bool IsValidApiKey(string apiKey)
    {
        return _options.ValidApiKeys.Contains(apiKey);
    }

    private async Task HandleUnauthorized(HttpContext context, string message)
    {
        context.Response.StatusCode = 401;
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            message = message,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

/// <summary>
/// Extension methods for API key authentication middleware
/// </summary>
public static class ApiKeyAuthenticationMiddlewareExtensions
{
    /// <summary>
    /// Adds API key authentication middleware to the pipeline
    /// </summary>
    /// <param name="builder">The application builder</param>
    /// <returns>The application builder</returns>
    public static IApplicationBuilder UseApiKeyAuthentication(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ApiKeyAuthenticationMiddleware>();
    }
}