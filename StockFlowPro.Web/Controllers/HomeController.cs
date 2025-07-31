using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StockFlowPro.Web.Controllers;

/// <summary>
/// Controller for handling root route and authentication-based redirects
/// </summary>
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IWebHostEnvironment _environment;

    public HomeController(ILogger<HomeController> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Handle root route - redirect to appropriate page based on authentication
    /// </summary>
    [HttpGet("/")]
    public IActionResult Index()
    {
        var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
        
        _logger.LogInformation("Root route access - IsAuthenticated: {IsAuthenticated}", isAuthenticated);
        Console.WriteLine($"[HOME DEBUG] Root route access - IsAuthenticated: {isAuthenticated}");

        if (!isAuthenticated)
        {
            // Not authenticated, redirect to login
            Console.WriteLine("[HOME DEBUG] User not authenticated, redirecting to login");
            return Redirect("/login.html");
        }

        // User is authenticated, redirect to dashboard
        Console.WriteLine("[HOME DEBUG] User authenticated, redirecting to dashboard");
        return Redirect("/dashboard");
    }

    /// <summary>
    /// Handle dashboard route explicitly - requires authentication
    /// </summary>
    [HttpGet("/dashboard")]
    [Authorize]
    public async Task<IActionResult> Dashboard()
    {
        // User is authenticated (enforced by [Authorize]), serve the dashboard
        Console.WriteLine("[HOME DEBUG] Dashboard route - user authenticated, serving dashboard");
        
        var dashboardPath = Path.Combine(_environment.WebRootPath, "index.html");
        
        if (!System.IO.File.Exists(dashboardPath))
        {
            _logger.LogError("Dashboard file not found at: {DashboardPath}", dashboardPath);
            return NotFound("Dashboard file not found");
        }

        var htmlContent = await System.IO.File.ReadAllTextAsync(dashboardPath);
        
        var userName = User.Identity?.Name ?? "User";
        
        // Add authentication info to the page
        htmlContent = htmlContent.Replace(
            "<script>",
            $@"<script>
        // Authentication info injected by server
        window.authInfo = {{
            isAuthenticated: true,
            userName: '{userName}',
            timestamp: '{DateTime.UtcNow:yyyy-MM-ddTHH:mm:ss.fffZ}'
        }};
        console.log('[DASHBOARD DEBUG] Authentication info:', window.authInfo);
        "
        );

        return Content(htmlContent, "text/html");
    }

    /// <summary>
    /// Handle explicit login route
    /// </summary>
    [HttpGet("/login")]
    [HttpGet("/login.html")]
    public async Task<IActionResult> Login()
    {
        // If already authenticated, redirect to dashboard
        if (User.Identity?.IsAuthenticated == true)
        {
            Console.WriteLine("[HOME DEBUG] User already authenticated, redirecting to dashboard");
            return Redirect("/dashboard");
        }

        Console.WriteLine("[HOME DEBUG] Serving login page");
        
        var loginPath = Path.Combine(_environment.WebRootPath, "login.html");
        
        if (!System.IO.File.Exists(loginPath))
        {
            _logger.LogError("Login file not found at: {LoginPath}", loginPath);
            return NotFound("Login file not found");
        }

        var loginContent = await System.IO.File.ReadAllTextAsync(loginPath);
        return Content(loginContent, "text/html");
    }
}