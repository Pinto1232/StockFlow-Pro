using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class DiagnosticsController : ControllerBase
{
    [HttpGet("auth-status")]
    public IActionResult GetAuthStatus()
    {
        var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        
        return Ok(new
        {
            IsAuthenticated = isAuthenticated,
            UserId = userId,
            UserName = userName,
            Email = email,
            Roles = roles,
            // Only include detailed claims for authenticated users
            AllClaims = isAuthenticated ? User.Claims.Select(c => new { c.Type, c.Value }).ToList() : null
        });
    }
}