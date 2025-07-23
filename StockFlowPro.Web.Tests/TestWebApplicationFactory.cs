using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using StockFlowPro.Web.Configuration;

namespace StockFlowPro.Web.Tests;

public class TestWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove specific authentication handlers but keep core authorization services
            var authHandlers = services.Where(d => 
                d.ServiceType.Name.Contains("AuthenticationHandler") ||
                d.ServiceType.Name.Contains("CookieAuthentication")).ToList();
            
            foreach (var service in authHandlers)
            {
                services.Remove(service);
            }

            // Add authorization services if not already present
            services.AddAuthorization(options =>
            {
                // Create a permissive default policy for testing
                options.DefaultPolicy = new AuthorizationPolicyBuilder()
                    .RequireAssertion(_ => true)
                    .Build();
                
                // Override all existing policies to be permissive
                options.AddPolicy("AdminOnly", policy => policy.RequireAssertion(_ => true));
                options.AddPolicy("ManagerOrAdmin", policy => policy.RequireAssertion(_ => true));
                options.AddPolicy("AllRoles", policy => policy.RequireAssertion(_ => true));
            });

            // Add test authentication with default scheme
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
                options.DefaultSignInScheme = "Test";
                options.DefaultSignOutScheme = "Test";
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>("Test", options => { });

            // Add a permissive authorization handler for testing
            services.AddSingleton<IAuthorizationHandler, AllowAnonymousAuthorizationHandler>();

            // Configure API security options for testing - disable strict requirements
            services.Configure<ApiSecurityOptions>(options =>
            {
                options.RequireUserAgent = false;
                options.RequireApiKey = false;
                options.EnableBotDetection = false;
                options.EnableThreatDetection = false;
                options.EnableInputValidation = false;
                options.AllowedIps = new List<string> { "127.0.0.1", "::1", "localhost" };
                options.DefaultRateLimit = 10000; // Very high limit for tests
                options.RateLimitWindowMinutes = 60;
                options.BlockBots = false;
                options.AutoBlockSuspiciousIps = false;
            });
        });

        builder.UseEnvironment("Testing");
    }
}

public class TestAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public class AllowAnonymousAuthorizationHandler : IAuthorizationHandler
{
    public Task HandleAsync(AuthorizationHandlerContext context)
    {
        foreach (var requirement in context.PendingRequirements.ToList())
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}