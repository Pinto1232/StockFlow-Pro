using Microsoft.AspNetCore.Authentication;

namespace StockFlowPro.Web.Middleware;

/// <summary>
/// Middleware to handle authentication redirects before serving any content
/// </summary>
public class AuthenticationRedirectMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthenticationRedirectMiddleware> _logger;

    public AuthenticationRedirectMiddleware(RequestDelegate next, ILogger<AuthenticationRedirectMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";
        
        // Skip middleware for API endpoints, static files, and login pages
        if (path.StartsWith("/api/") || 
            path.StartsWith("/swagger") ||
            path.Contains(".") || // Static files (css, js, html, etc.)
            path.StartsWith("/login") ||
            path == "/login.html")
        {
            await _next(context);
            return;
        }

        // For root path, check authentication before proceeding
        if (path == "/" || path == "/dashboard")
        {
            var isAuthenticated = context.User?.Identity?.IsAuthenticated ?? false;
            
            _logger.LogInformation("Authentication check for path {Path} - IsAuthenticated: {IsAuthenticated}", 
                path, isAuthenticated);
            Console.WriteLine($"[AUTH MIDDLEWARE] Path: {path}, IsAuthenticated: {isAuthenticated}");

            if (!isAuthenticated)
            {
                Console.WriteLine("[AUTH MIDDLEWARE] Redirecting to login");
                context.Response.Redirect("/login.html");
                return;
            }
        }

        await _next(context);
    }
}

/// <summary>
/// Extension method to register the authentication redirect middleware
/// </summary>
public static class AuthenticationRedirectMiddlewareExtensions
{
    public static IApplicationBuilder UseAuthenticationRedirect(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AuthenticationRedirectMiddleware>();
    }
}