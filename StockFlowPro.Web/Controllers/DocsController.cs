using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StockFlowPro.Web.Controllers;

/// <summary>
/// Controller for serving protected documentation pages
/// </summary>
[Authorize] // Require authentication for all documentation pages
public class DocsController : Controller
{
    private readonly ILogger<DocsController> _logger;
    private readonly IWebHostEnvironment _environment;

    public DocsController(ILogger<DocsController> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Serve the documentation archive page (protected)
    /// </summary>
    [HttpGet("/docs")]
    [HttpGet("/docs.html")]
    public async Task<IActionResult> Index()
    {
        try
        {
            // Debug authentication status
            var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            var userName = User.Identity?.Name ?? "Anonymous";
            var userClaims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
            
            _logger.LogInformation("Documentation page request - IsAuthenticated: {IsAuthenticated}, User: {UserName}", 
                isAuthenticated, userName);
            Console.WriteLine($"[DOCS DEBUG] Documentation page request - IsAuthenticated: {isAuthenticated}, User: {userName}");
            Console.WriteLine($"[DOCS DEBUG] User claims: {string.Join(", ", userClaims)}");

            // Read the docs.html file from wwwroot
            var docsPath = Path.Combine(_environment.WebRootPath, "docs.html");
            
            if (!System.IO.File.Exists(docsPath))
            {
                _logger.LogError("Documentation file not found at: {DocsPath}", docsPath);
                return NotFound("Documentation file not found");
            }

            var htmlContent = await System.IO.File.ReadAllTextAsync(docsPath);
            
            // Add authentication info to the page
            htmlContent = htmlContent.Replace(
                "<script>",
                $@"<script>
        // Authentication info injected by server
        window.authInfo = {{
            isAuthenticated: {isAuthenticated.ToString().ToLower()},
            userName: '{userName}',
            timestamp: '{DateTime.UtcNow:yyyy-MM-ddTHH:mm:ss.fffZ}'
        }};
        console.log('[DOCS DEBUG] Authentication info:', window.authInfo);
        "
            );

            return Content(htmlContent, "text/html");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error serving documentation page");
            Console.WriteLine($"[DOCS DEBUG] Error serving documentation page: {ex.Message}");
            return StatusCode(500, "Error loading documentation page");
        }
    }

    /// <summary>
    /// Redirect old docs.html requests to the protected route
    /// </summary>
    [HttpGet("/wwwroot/docs.html")]
    public IActionResult RedirectToProtectedDocs()
    {
        return RedirectToAction(nameof(Index));
    }
}