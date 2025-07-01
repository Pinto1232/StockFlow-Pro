using StockFlowPro.Web.Configuration;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Middleware to add security headers to HTTP responses
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
        // Add security headers before processing the request
        AddSecurityHeaders(context);

        await _next(context);
    }

    private void AddSecurityHeaders(HttpContext context)
    {
        var response = context.Response;

        try
        {
            // Content Security Policy
            if (!response.Headers.ContainsKey("Content-Security-Policy"))
            {
                var csp = BuildContentSecurityPolicy();
                response.Headers["Content-Security-Policy"] = csp;
            }

            // X-Frame-Options - Prevent clickjacking
            if (!response.Headers.ContainsKey("X-Frame-Options"))
            {
                response.Headers["X-Frame-Options"] = "DENY";
            }

            // X-Content-Type-Options - Prevent MIME type sniffing
            if (!response.Headers.ContainsKey("X-Content-Type-Options"))
            {
                response.Headers["X-Content-Type-Options"] = "nosniff";
            }

            // X-XSS-Protection - Enable XSS filtering
            if (!response.Headers.ContainsKey("X-XSS-Protection"))
            {
                response.Headers["X-XSS-Protection"] = "1; mode=block";
            }

            // Referrer-Policy - Control referrer information
            if (!response.Headers.ContainsKey("Referrer-Policy"))
            {
                response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            }

            // Permissions-Policy - Control browser features
            if (!response.Headers.ContainsKey("Permissions-Policy"))
            {
                response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=()";
            }

            // Remove server information
            response.Headers.Remove("Server");
            response.Headers.Remove("X-Powered-By");
            response.Headers.Remove("X-AspNet-Version");
            response.Headers.Remove("X-AspNetMvc-Version");

            // Cache-Control for sensitive pages
            if (IsSensitivePage(context.Request.Path))
            {
                response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                response.Headers["Pragma"] = "no-cache";
                response.Headers["Expires"] = "0";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding security headers");
        }
    }

    private string BuildContentSecurityPolicy()
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        if (isDevelopment)
        {
            // More permissive CSP for development - includes unpkg.com for SignalR
            return "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; " +
                   "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; " +
                   "img-src 'self' data: https:; " +
                   "font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; " +
                   "connect-src 'self' ws: wss:; " +
                   "frame-ancestors 'none'; " +
                   "base-uri 'self'; " +
                   "form-action 'self';";
        }
        else
        {
            // Strict CSP for production
            return "default-src 'self'; " +
                   "script-src 'self' 'nonce-{nonce}'; " +
                   "style-src 'self' 'nonce-{nonce}'; " +
                   "img-src 'self' data: https:; " +
                   "font-src 'self'; " +
                   "connect-src 'self' wss:; " +
                   "frame-ancestors 'none'; " +
                   "base-uri 'self'; " +
                   "form-action 'self'; " +
                   "upgrade-insecure-requests;";
        }
    }

    private bool IsSensitivePage(PathString path)
    {
        var sensitivePaths = new[]
        {
            "/login",
            "/register",
            "/admin",
            "/users",
            "/api/auth",
            "/systemsettings",
            "/changepassword"
        };

        return sensitivePaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }
}

/// <summary>
/// Extension method to register the security headers middleware
/// </summary>
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SecurityHeadersMiddleware>();
    }
}