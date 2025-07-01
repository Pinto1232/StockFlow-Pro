using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Web.Extensions;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AuthTestController : ControllerBase
{
    /// <summary>
    /// Test endpoint that doesn't require authentication
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    public ActionResult GetPublicInfo()
    {
        var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
        var userId = User.GetUserId();
        var userName = User.Identity?.Name;
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();

        return Ok(new
        {
            Message = "This is a public endpoint",
            IsAuthenticated = isAuthenticated,
            UserId = userId,
            UserName = userName,
            ClaimsCount = claims.Count,
            Claims = claims,
            Timestamp = DateTime.UtcNow,
            Instructions = isAuthenticated 
                ? "You are authenticated! You can now access protected endpoints." 
                : "You are not authenticated. Please login at /Login or use /api/auth/login"
        });
    }

    /// <summary>
    /// Test endpoint that requires authentication
    /// </summary>
    [HttpGet("protected")]
    [Authorize]
    public ActionResult GetProtectedInfo()
    {
        var userId = User.GetUserId();
        var userName = User.GetFullName();
        var userRole = User.GetUserRole();

        return Ok(new
        {
            Message = "This is a protected endpoint - you are authenticated!",
            UserId = userId,
            UserName = userName,
            UserRole = userRole?.ToString(),
            Timestamp = DateTime.UtcNow
        });
    }
}