using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Web.Configuration;
using StockFlowPro.Web.Services;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserAuthenticationService _authenticationService;

    public AuthController(IUserAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var user = await _authenticationService.AuthenticateAsync(request.Username, request.Password);
        if (user != null)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            var claimsIdentity = new ClaimsIdentity(claims, EnvironmentConfig.CookieAuthName);
            var authProperties = new AuthenticationProperties { IsPersistent = true };
            await HttpContext.SignInAsync(EnvironmentConfig.CookieAuthName, new ClaimsPrincipal(claimsIdentity), authProperties);

            return Ok(new 
            { 
                message = "Login successful",
                user = new
                {
                    id = user.Id,
                    name = user.FullName,
                    email = user.Email,
                    role = user.Role.ToString()
                }
            });
        }

        return Unauthorized(new { message = "Invalid credentials" });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(EnvironmentConfig.CookieAuthName);
        return Ok(new { message = "Logout successful" });
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}