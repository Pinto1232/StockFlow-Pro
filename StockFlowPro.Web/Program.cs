using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Mappings;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories;
using StockFlowPro.Web.Services;
using StockFlowPro.Web.Authorization;
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

// Configure database connection using environment variables
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(EnvironmentConfig.DatabaseConnectionString));

builder.Services.AddMediatR(typeof(StockFlowPro.Application.Commands.Users.CreateUserCommand).Assembly);
builder.Services.AddAutoMapper(typeof(UserMappingProfile), typeof(StockFlowPro.Application.Mappings.ProductMappingProfile));
builder.Services.AddValidatorsFromAssembly(typeof(StockFlowPro.Application.Validators.CreateUserCommandValidator).Assembly);
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<StockFlowPro.Domain.Repositories.IInvoiceRepository, StockFlowPro.Infrastructure.Repositories.InvoiceRepository>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IInvoiceService, StockFlowPro.Application.Services.InvoiceService>();
builder.Services.AddScoped<IMockDataStorageService, JsonMockDataStorageService>();
builder.Services.AddScoped<IDataSourceService, HybridDataSourceService>();
builder.Services.AddScoped<IDualDataService, DualDataService>();
builder.Services.AddScoped<IUserAuthenticationService, UserAuthenticationService>();
builder.Services.AddScoped<IUserSynchronizationService, UserSynchronizationService>();
builder.Services.AddScoped<IUserSecurityService, UserSecurityService>();
builder.Services.AddScoped<StockFlowPro.Web.Services.IAuthorizationService, StockFlowPro.Web.Services.AuthorizationService>();
builder.Services.AddScoped<StockFlowPro.Application.Interfaces.IPasswordService, PasswordService>();
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

// Configure authentication using environment variables
builder.Services.AddAuthentication(EnvironmentConfig.CookieAuthName)
    .AddCookie(EnvironmentConfig.CookieAuthName, options =>
    {
        options.LoginPath = "/Login";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        options.Cookie.SecurePolicy = EnvironmentConfig.CookieSecure ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = EnvironmentConfig.CookieSameSite;
    });

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

await app.RunAsync();

public partial class Program 
{ 
    protected Program() { }
}
