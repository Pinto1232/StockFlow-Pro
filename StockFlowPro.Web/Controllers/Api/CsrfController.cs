using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// Controller for handling CSRF token generation and validation
/// </summary>
[ApiController]
[Route("api/csrf")]
public class CsrfController : ControllerBase
{
    private readonly ILogger<CsrfController> _logger;

    public CsrfController(ILogger<CsrfController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Generates a new CSRF token and sets it as a cookie
    /// </summary>
    /// <returns>The generated CSRF token</returns>
    [HttpGet("token")]
    public IActionResult GetCsrfToken()
    {
        try
        {
            // Generate a random token
            var token = GenerateToken();
            
            // Set the token as a cookie
            Response.Cookies.Append("XSRF-TOKEN", token, new CookieOptions
            {
                HttpOnly = false, // Must be accessible to JavaScript
                Secure = Request.IsHttps, // Only send over HTTPS in production
                SameSite = SameSiteMode.Lax, // Allows the cookie to be sent with same-site requests and top-level navigation
                Path = "/", // Available across the entire site
                MaxAge = TimeSpan.FromHours(1) // Token expires after 1 hour
            });
            
            _logger.LogInformation("CSRF token generated successfully");
            
            // Return the token in the response body as well
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating CSRF token");
            return StatusCode(500, new { message = "Error generating CSRF token" });
        }
    }
    
    /// <summary>
    /// Generates a cryptographically secure random token
    /// </summary>
    private static string GenerateToken()
    {
        var randomBytes = new byte[32]; // 256 bits
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        
        return Convert.ToBase64String(randomBytes);
    }
}