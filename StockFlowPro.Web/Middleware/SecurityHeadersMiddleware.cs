using Microsoft.Extensions.Primitives;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Middleware to configure security headers including CSP for iframe embedding
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;

    public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Configure security headers based on the request path
        ConfigureSecurityHeaders(context);

        await _next(context);
    }

    private void ConfigureSecurityHeaders(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        try
        {
            // For observability iframe content, allow same-origin embedding
            if (path.Contains("/api/observability/grafana-placeholder"))
            {
                context.Response.Headers.Remove("X-Frame-Options");
                context.Response.Headers.Remove("Content-Security-Policy");
                
                context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
                context.Response.Headers["Content-Security-Policy"] = 
                    "default-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "frame-ancestors 'self'; " +
                    "img-src 'self' data:; " +
                    "font-src 'self'";
                
                _logger.LogDebug("Applied iframe-friendly CSP headers for observability content");
            }
            // For the main dashboard page, allow iframe embedding from same origin
            else if (path.Contains("/index.html") || path == "/" || path == "")
            {
                context.Response.Headers.Remove("X-Frame-Options");
                context.Response.Headers.Remove("Content-Security-Policy");
                
                context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
                context.Response.Headers["Content-Security-Policy"] = 
                    "default-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "frame-src 'self'; " +
                    "frame-ancestors 'self'; " +
                    "img-src 'self' data: blob: https://images.unsplash.com https://api.dicebear.com; " +
                    "font-src 'self'; " +
                    "connect-src 'self'; " +
                    "media-src 'self'";
                
                _logger.LogDebug("Applied dashboard CSP headers allowing iframe embedding");
            }
            // For API endpoints, use standard security headers
            else if (path.StartsWith("/api/"))
            {
                context.Response.Headers.Remove("X-Frame-Options");
                context.Response.Headers.Remove("Content-Security-Policy");
                
                context.Response.Headers["X-Frame-Options"] = "DENY";
                context.Response.Headers["Content-Security-Policy"] = "default-src 'none'";
                
                _logger.LogDebug("Applied strict CSP headers for API endpoints");
            }
            // Default security headers for other content
            else
            {
                context.Response.Headers.Remove("X-Frame-Options");
                context.Response.Headers.Remove("Content-Security-Policy");
                
                context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
                context.Response.Headers["Content-Security-Policy"] = 
                    "default-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "frame-src 'self'; " +
                    "frame-ancestors 'self'; " +
                    "img-src 'self' data: https://images.unsplash.com https://api.dicebear.com; " +
                    "font-src 'self'";
                
                _logger.LogDebug("Applied default CSP headers");
            }

            // Add other security headers
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error configuring security headers for path: {Path}", path);
        }
    }
}