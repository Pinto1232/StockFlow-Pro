using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Data;

public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await _context.Database.EnsureCreatedAsync();

            if (await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Database already contains users. Skipping seed.");
                return;
            }

            _logger.LogInformation("Seeding database with initial users...");

            var seedUsers = new List<User>
            {
                new User(
                    firstName: "John",
                    lastName: "Admin",
                    email: "admin@stockflowpro.com",
                    phoneNumber: "+1-555-0101",
                    dateOfBirth: new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Admin
                ),
                new User(
                    firstName: "Jane",
                    lastName: "Manager",
                    email: "manager@stockflowpro.com",
                    phoneNumber: "+1-555-0102",
                    dateOfBirth: new DateTime(1990, 8, 22, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Manager
                ),
                new User(
                    firstName: "Bob",
                    lastName: "User",
                    email: "user@stockflowpro.com",
                    phoneNumber: "+1-555-0103",
                    dateOfBirth: new DateTime(1992, 12, 10, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.User
                ),
                new User(
                    firstName: "Alice",
                    lastName: "Smith",
                    email: "alice.smith@stockflowpro.com",
                    phoneNumber: "+1-555-0104",
                    dateOfBirth: new DateTime(1988, 3, 7, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.User
                )
            };

            seedUsers[seedUsers.Count - 1].Deactivate();

            await _context.Users.AddRangeAsync(seedUsers);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded database with {Count} users", seedUsers.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw new InvalidOperationException("Failed to seed database with initial data", ex);
        }
    }
}