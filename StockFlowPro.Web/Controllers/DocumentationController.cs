using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Web.Services;
using System.Text.Json;

namespace StockFlowPro.Web.Controllers;

/// <summary>
/// Controller for managing and serving documentation archive
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication for all documentation endpoints
public class DocumentationController : ControllerBase
{
    private readonly IDocumentationArchiveService _documentationService;
    private readonly ILogger<DocumentationController> _logger;

    public DocumentationController(
        IDocumentationArchiveService documentationService,
        ILogger<DocumentationController> logger)
    {
        _documentationService = documentationService;
        _logger = logger;
    }

    /// <summary>
    /// Get all documentation files organized by category
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDocumentationArchive()
    {
        try
        {
            // Debug authentication status
            var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            var userName = User.Identity?.Name ?? "Anonymous";
            var userClaims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
            
            _logger.LogInformation("Documentation archive request - IsAuthenticated: {IsAuthenticated}, User: {UserName}", 
                isAuthenticated, userName);
            Console.WriteLine($"[DOCS DEBUG] Documentation archive request - IsAuthenticated: {isAuthenticated}, User: {userName}");
            Console.WriteLine($"[DOCS DEBUG] User claims: {string.Join(", ", userClaims)}");
            Console.WriteLine($"[DOCS DEBUG] Request headers: {string.Join(", ", Request.Headers.Select(h => $"{h.Key}: {h.Value}"))}");

            var archive = await _documentationService.GetDocumentationArchiveAsync();
            return Ok(archive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documentation archive");
            Console.WriteLine($"[DOCS DEBUG] Error retrieving documentation archive: {ex.Message}");
            return StatusCode(500, new { error = "Failed to retrieve documentation archive" });
        }
    }

    /// <summary>
    /// Get a specific documentation file content
    /// </summary>
    [HttpGet("{fileName}")]
    public async Task<IActionResult> GetDocumentationFile(string fileName)
    {
        try
        {
            var content = await _documentationService.GetDocumentationContentAsync(fileName);
            if (content == null)
            {
                return NotFound(new { error = $"Documentation file '{fileName}' not found" });
            }

            return Ok(new { fileName, content });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documentation file: {FileName}", fileName);
            return StatusCode(500, new { error = "Failed to retrieve documentation file" });
        }
    }

    /// <summary>
    /// Search documentation content
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchDocumentation([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { error = "Search query is required" });
        }

        try
        {
            var results = await _documentationService.SearchDocumentationAsync(query);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documentation with query: {Query}", query);
            return StatusCode(500, new { error = "Failed to search documentation" });
        }
    }

    /// <summary>
    /// Get documentation statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetDocumentationStats()
    {
        try
        {
            var stats = await _documentationService.GetDocumentationStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documentation statistics");
            return StatusCode(500, new { error = "Failed to retrieve documentation statistics" });
        }
    }

    /// <summary>
    /// Refresh documentation archive (scan for new files)
    /// </summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshDocumentationArchive()
    {
        try
        {
            await _documentationService.RefreshArchiveAsync();
            return Ok(new { message = "Documentation archive refreshed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing documentation archive");
            return StatusCode(500, new { error = "Failed to refresh documentation archive" });
        }
    }
}