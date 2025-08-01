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
using Microsoft.OpenApi.Models;
using System.Text.Json;
using StockFlowPro.Web.Hubs;

// Load environment variables from .env file
Env.Load();

// Validate configuration
EnvironmentConfig.ValidateConfiguration();

var builder = WebApplication.CreateBuilder(args);

// CSRF protection removed as it's primarily used for Razor Pages

// Add SignalR with detailed logging and configuration
builder.Services.AddSignalR(options => 
{
    options.EnableDetailedErrors = true;
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
    options.KeepAliveInterval = TimeSpan.FromSeconds(10);
});

// Configure JSON options for API responses
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();

// Enhanced Swagger configuration for external API documentation
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "StockFlow Pro API",
        Version = "v1",
        Description = "Comprehensive inventory management API for external applications",
        Contact = new OpenApiContact
        {
            Name = "StockFlow Pro Support",
            Email = "support@stockflowpro.com"
        }
    });

    c.SwaggerDoc("v2", new OpenApiInfo
    {
        Title = "StockFlow Pro API v2",
        Version = "v2",
        Description = "Enhanced API with improved authentication and error handling for mobile applications"
    });

    // Add security definition for API Key
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "API Key needed to access the endpoints. X-API-Key: {API_KEY}",
        In = ParameterLocation.Header,
        Name = "X-API-Key",
        Type = SecuritySchemeType.ApiKey
    });

    // Add security definition for Cookie Authentication
    c.AddSecurityDefinition("Cookie", new OpenApiSecurityScheme
    {
        Description = "Cookie-based authentication",
        In = ParameterLocation.Cookie,
        Name = "StockFlowAuth",
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Cookie"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments if available
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddHttpContextAccessor();

// Add Memory Cache for API Documentation
builder.Services.AddMemoryCache();

// Configure SignalR options
builder.Services.Configure<StockFlowPro.Web.Configuration.SignalROptions>(
    builder.Configuration.GetSection(StockFlowPro.Web.Configuration.SignalROptions.SectionName));

builder.Services.AddSignalR(options =>
{
    var signalRConfig = builder.Configuration
        .GetSection(StockFlowPro.Web.Configuration.SignalROptions.SectionName)
        .Get<StockFlowPro.Web.Configuration.SignalROptions>() ?? new StockFlowPro.Web.Configuration.SignalROptions();

    // Validate configuration
    signalRConfig.Validate();

    // Configure timeout settings to prevent premature disconnections
    options.ClientTimeoutInterval = signalRConfig.ClientTimeoutInterval;
    options.KeepAliveInterval = signalRConfig.KeepAliveInterval;
    options.HandshakeTimeout = signalRConfig.HandshakeTimeout;
    
    // Enable detailed errors in development or if configured
    options.EnableDetailedErrors = builder.Environment.IsDevelopment() || signalRConfig.EnableDetailedErrors;
    
    // Configure maximum message size
    options.MaximumReceiveMessageSize = signalRConfig.MaximumReceiveMessageSize;
    
    // Configure streaming settings
    options.StreamBufferCapacity = signalRConfig.StreamBufferCapacity;
});

// Configure API Key options
builder.Services.Configure<ApiKeyOptions>(builder.Configuration.GetSection(ApiKeyOptions.SectionName));

// Configure Enhanced API Security options
builder.Services.Configure<StockFlowPro.Web.Configuration.ApiSecurityOptions>(builder.Configuration.GetSection(StockFlowPro.Web.Configuration.ApiSecurityOptions.SectionName));

// Enhanced CORS configuration for external applications
builder.Services.AddCors(options =>
{
    // Production CORS policy
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081", 
                "http://localhost:3000", 
                "http://localhost:5173",
                "http://localhost:8081/", // Expo web
                "http://localhost:19000", // Expo DevTools
                "exp://localhost:19000",  // Expo protocol
                "http://127.0.0.1:8081",  // Alternative localhost
                "http://10.0.2.2:8081"    // Android emulator host
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .SetIsOriginAllowedToAllowWildcardSubdomains()
              .WithExposedHeaders("X-Total-Count", "X-Page-Count", "X-Current-Page"); // For pagination
    });
    
    // Development CORS policy - more permissive for React Native development
    options.AddPolicy("DevelopmentCors", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
        {
            if (string.IsNullOrWhiteSpace(origin)) {return false;}
            
            // Allow localhost on any port
            if (origin.StartsWith("http://localhost:") || 
                origin.StartsWith("https://localhost:") ||
                origin.StartsWith("http://127.0.0.1:") ||
                origin.StartsWith("https://127.0.0.1:"))
                {return true;}
                
            // Allow Expo development URLs
            if (origin.StartsWith("exp://") || 
                origin.StartsWith("exps://"))
                {return true;}
                
            // Allow local network IPs for mobile development
            if (origin.StartsWith("http://10.") || 
                origin.StartsWith("http://192.168.") ||
                origin.StartsWith("http://172."))
                {return true;}
                
            // Allow React Native Metro bundler
            if (origin.Contains("metro") || origin.Contains("expo"))
                {return true;}
                
            return false;
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .WithExposedHeaders("X-Total-Count", "X-Page-Count", "X-Current-Page", "X-API-Version");
    });

    // API-only CORS policy for external integrations
    options.AddPolicy("ApiCors", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("X-Total-Count", "X-Page-Count", "X-Current-Page", "X-API-Version", "X-Rate-Limit-Remaining");
    });

    // SignalR CORS policy
    options.AddPolicy("SignalRPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081", 
                "http://localhost:3000", 
                "http://localhost:5173",
                "https://localhost:5173"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), 
        b => b.MigrationsAssembly("StockFlowPro.Infrastructure")));

builder.Services.AddMediatR(typeof(StockFlowPro.Application.Commands.Users.CreateUserCommand).Assembly);
builder.Services.AddAutoMapper(typeof(UserMappingProfile), typeof(StockFlowPro.Application.Mappings.ProductMappingProfile), typeof(StockFlowPro.Application.Mappings.SubscriptionPlanMappingProfile), typeof(StockFlowPro.Application.Mappings.PermissionMappingProfile));
builder.Services.AddValidatorsFromAssembly(typeof(StockFlowPro.Application.Validators.CreateUserCommandValidator).Assembly);
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.IInvoiceRepository, StockFlowPro.Infrastructure.Repositories.InvoiceRepository>();
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.ISubscriptionPlanRepository, StockFlowPro.Infrastructure.Repositories.SubscriptionPlanRepository>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.ISubscriptionPlanService, StockFlowPro.Application.Services.SubscriptionPlanService>();
builder.Services.AddScoped<IMockDataStorageService, JsonMockDataStorageService>();
// Use database-first approach - prioritizes database over mock data
builder.Services.AddScoped<IDataSourceService, DatabaseFirstDataService>();
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

// API Documentation services
builder.Services.AddScoped<IApiDocumentationService, ApiDocumentationService>();


// Documentation Archive services
builder.Services.AddSingleton<IDocumentationArchiveService, DocumentationArchiveService>();

// Enhanced notification system services
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.INotificationRepository, StockFlowPro.Infrastructure.Repositories.NotificationRepository>();
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.INotificationTemplateRepository, StockFlowPro.Infrastructure.Repositories.NotificationTemplateRepository>();
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.INotificationPreferenceRepository, StockFlowPro.Infrastructure.Repositories.NotificationPreferenceRepository>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IEnhancedNotificationService, StockFlowPro.Application.Services.EnhancedNotificationService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.INotificationTemplateService, StockFlowPro.Application.Services.NotificationTemplateService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.INotificationPreferenceService, StockFlowPro.Application.Services.NotificationPreferenceService>();
builder.Services.AddHostedService<DatabaseInitializationService>();
builder.Services.AddHostedService<StockFlowPro.Web.Services.NotificationBackgroundService>();

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
        // Remove login and access denied paths since we're API-only now
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        options.Cookie.SecurePolicy = EnvironmentConfig.CookieSecure ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = EnvironmentConfig.CookieSameSite;
        options.Cookie.HttpOnly = true; // Prevent XSS attacks
        options.Cookie.Name = EnvironmentConfig.CookieAuthName;
        options.Cookie.IsEssential = true;
        
        // Enhanced security settings - return 401 for all unauthorized requests
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        };
        
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = 403;
            return Task.CompletedTask;
        };
    });


var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    // Use developer exception page for API-only application
    app.UseDeveloperExceptionPage();
    // Enhanced HSTS configuration for production
    app.UseHsts();
}
else
{
    // Enhanced Swagger UI for development with authentication protection
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "StockFlow Pro API v1");
        c.SwaggerEndpoint("/swagger/v2/swagger.json", "StockFlow Pro API v2");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "StockFlow Pro API Documentation";
        c.DefaultModelExpandDepth(2);
        c.DefaultModelsExpandDepth(-1);
        c.DisplayOperationId();
        c.DisplayRequestDuration();
    });
}

app.UseHttpsRedirection();

// Default files removed - root route handled by HomeController

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

// Enable CORS - must be before authentication
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevelopmentCors");
}
else
{
    app.UseCors("AllowFrontend");
}

// Security middleware should be added after CORS
app.UseMiddleware<SecurityHeadersMiddleware>();

// Add enhanced API security middleware (before other auth middleware)
app.UseEnhancedApiSecurity();

// Add API key authentication middleware (before other auth middleware)
app.UseApiKeyAuthentication();

// Add input validation and rate limiting middleware
app.UseInputValidation();
app.UseRateLimiting();

app.UseAuthentication();

// Add authentication middleware for Swagger (after authentication, before authorization)
app.Use(async (context, next) =>
{
    // Protect Swagger endpoints
    if (context.Request.Path.StartsWithSegments("/swagger") || 
        context.Request.Path.StartsWithSegments("/swagger-ui"))
    {
        var isAuthenticated = context.User?.Identity?.IsAuthenticated ?? false;
        Console.WriteLine($"[SWAGGER DEBUG] Swagger access attempt - IsAuthenticated: {isAuthenticated}, Path: {context.Request.Path}");
        
        if (!isAuthenticated)
        {
            Console.WriteLine("[SWAGGER DEBUG] Unauthorized access to Swagger - redirecting to login");
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Authentication required to access API documentation. Please login first.");
            return;
        }
    }
    
    await next();
});

app.UseAuthorization();

app.MapControllers();

// Map SignalR hub
app.MapHub<StockFlowHub>("/hubs/stockflowhub");
app.MapHub<StockFlowPro.Web.Hubs.StockFlowHub>("/stockflowhub");

await app.RunAsync();

public partial class Program 
{ 
    protected Program() { }
}