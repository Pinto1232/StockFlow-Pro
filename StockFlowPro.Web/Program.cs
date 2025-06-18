using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Mappings;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories;
using FluentValidation;
using MediatR;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

// Add API Controllers
builder.Services.AddControllers();

// Add API Explorer for Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext for EF Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Add MediatR
builder.Services.AddMediatR(typeof(StockFlowPro.Application.Commands.Users.CreateUserCommand).Assembly);

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(UserMappingProfile));

// Add FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(StockFlowPro.Application.Validators.CreateUserCommandValidator).Assembly);

// Add Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Add Authentication (Cookie)
builder.Services.AddAuthentication("MyCookieAuth")
    .AddCookie("MyCookieAuth", options =>
    {
        options.LoginPath = "/Login";
        options.AccessDeniedPath = "/AccessDenied";
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
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

app.Run();
