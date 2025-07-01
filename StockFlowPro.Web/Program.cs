using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Mappings;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Application.Services;
using StockFlowPro.Web.Services;
using StockFlowPro.Web.Authorization;
using StockFlowPro.Web.Middleware;
using FluentValidation;
using MediatR;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using DotNetEnv;
using StockFlowPro.Web.Configuration;

// Load environment variables from .env file
Env.Load();

// Validate configuration
EnvironmentConfig.ValidateConfiguration();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSignalR();

// Configure database connection using environment variables
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), 
        b => b.MigrationsAssembly("StockFlowPro.Infrastructure")));

builder.Services.AddMediatR(typeof(StockFlowPro.Application.Commands.Users.CreateUserCommand).Assembly);
builder.Services.AddAutoMapper(typeof(UserMappingProfile), typeof(StockFlowPro.Application.Mappings.ProductMappingProfile));
builder.Services.AddValidatorsFromAssembly(typeof(StockFlowPro.Application.Validators.CreateUserCommandValidator).Assembly);
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.IInvoiceRepository, StockFlowPro.Infrastructure.Repositories.InvoiceRepository>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IMockDataStorageService, JsonMockDataStorageService>();
builder.Services.AddScoped<IDataSourceService, HybridDataSourceService>();
builder.Services.AddScoped<IDualDataService, DualDataService>();
builder.Services.AddScoped<IUserAuthenticationService, UserAuthenticationService>();
builder.Services.AddScoped<IUserSynchronizationService, UserSynchronizationService>();
builder.Services.AddScoped<IUserSecurityService, UserSecurityService>();
builder.Services.AddScoped<StockFlowPro.Web.Services.IAuthorizationService, StockFlowPro.Web.Services.AuthorizationService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IPasswordService, PasswordService>();
builder.Services.AddScoped<IInvoiceExportService, InvoiceExportService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IReportService, StockFlowPro.Application.Services.ReportService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IEnhancedRoleService, StockFlowPro.Infrastructure.Services.EnhancedRoleService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.INotificationService, StockFlowPro.Web.Services.NotificationService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IRealTimeService, StockFlowPro.Web.Services.RealTimeService>();
// ADD THIS LINE - Missing IUserService registration
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IUserService, StockFlowPro.Application.Services.UserService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IRoleUpgradeRequestService, StockFlowPro.Application.Services.RoleUpgradeRequestService>();
builder.Services.AddScoped<StockFlowPro.Application.Services.ProductNotificationService>();
builder.Services.AddScoped<ISecurityAuditService, SecurityAuditService>();
builder.Services.AddHostedService<DatabaseInitializationService>();

builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    foreach (var permission in RolePermissions.GetAllPermissions())
    {
        options.AddPolicy(permission, policy =>
            policy.Requirements.Add(new PermissionRequirement(permission)));
    }
    
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
    options.AddPolicy("AllRoles", policy => policy.RequireRole("User", "Manager", "Admin"));
});

// Configure authentication using environment variables with enhanced security
builder.Services.AddAuthentication(EnvironmentConfig.CookieAuthName)
    .AddCookie(EnvironmentConfig.CookieAuthName, options =>
    {
        options.LoginPath = "/Login";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        options.Cookie.SecurePolicy = EnvironmentConfig.CookieSecure ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = EnvironmentConfig.CookieSameSite;
        options.Cookie.HttpOnly = true; // Prevent XSS attacks
        options.Cookie.Name = EnvironmentConfig.CookieAuthName;
        options.Cookie.IsEssential = true;
        
        // Enhanced security settings
        options.Events.OnRedirectToLogin = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = 401;
                return Task.CompletedTask;
            }
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        };
    });

var app = builder.Build();

// Security middleware should be added early in the pipeline
app.UseSecurityHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // Enhanced HSTS configuration for production
    app.UseHsts();
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add input validation and rate limiting middleware
app.UseInputValidation();
app.UseRateLimiting();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Add security headers for static files
        ctx.Context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        ctx.Context.Response.Headers["X-Frame-Options"] = "DENY";
        
        // Cache static files for performance but with security considerations
        var pathValue = ctx.Context.Request.Path.Value;
        if (!string.IsNullOrEmpty(pathValue) && !pathValue.Contains("/api/"))
        {
            ctx.Context.Response.Headers["Cache-Control"] = "public,max-age=31536000";
        }
    }
});

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();
app.MapHub<StockFlowPro.Web.Hubs.StockFlowHub>("/stockflowhub");

await app.RunAsync();

public partial class Program 
{ 
    protected Program() { }
}