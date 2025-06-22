using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

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

    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var saltedPassword = password + salt;
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
        var hashedPassword = Convert.ToBase64String(hashedBytes);
        return $"{hashedPassword}:{salt}";
    }

    public async Task SeedAsync()
    {
        try
        {
            await _context.Database.EnsureCreatedAsync();

            if (await _context.Users.AnyAsync())
            {
                var usersWithoutPasswords = await _context.Users
                    .Where(u => string.IsNullOrEmpty(u.PasswordHash))
                    .ToListAsync();
                
                if (usersWithoutPasswords.Any())
                {
                    _logger.LogInformation("Found {Count} users without password hashes. Updating them...", usersWithoutPasswords.Count);
                    
                    foreach (var user in usersWithoutPasswords)
                    {
                        string defaultPassword = user.Role switch
                        {
                            UserRole.Admin => "admin123",
                            UserRole.Manager => "manager123",
                            _ => "user123"
                        };
                        
                        user.UpdatePasswordHash(HashPassword(defaultPassword, user.Id.ToString()));
                    }
                    
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Updated password hashes for {Count} users", usersWithoutPasswords.Count);
                }
                else
                {
                    _logger.LogInformation("Database already contains users with password hashes. Skipping user seed.");
                }
                
                // Check and seed products separately
                await SeedProductsAsync();
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
                    role: UserRole.Admin,
                    passwordHash: HashPassword("admin123", "550e8400-e29b-41d4-a716-446655440001")
                ),
                new User(
                    firstName: "Jane",
                    lastName: "Manager",
                    email: "manager@stockflowpro.com",
                    phoneNumber: "+1-555-0102",
                    dateOfBirth: new DateTime(1990, 8, 22, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Manager,
                    passwordHash: HashPassword("manager123", "550e8400-e29b-41d4-a716-446655440002")
                ),
                new User(
                    firstName: "Bob",
                    lastName: "User",
                    email: "user@stockflowpro.com",
                    phoneNumber: "+1-555-0103",
                    dateOfBirth: new DateTime(1992, 12, 10, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.User,
                    passwordHash: HashPassword("user123", "550e8400-e29b-41d4-a716-446655440003")
                ),
                new User(
                    firstName: "Alice",
                    lastName: "Smith",
                    email: "alice.smith@stockflowpro.com",
                    phoneNumber: "+1-555-0104",
                    dateOfBirth: new DateTime(1988, 3, 7, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.User,
                    passwordHash: HashPassword("alice123", "550e8400-e29b-41d4-a716-446655440004")
                )
            };

            seedUsers[seedUsers.Count - 1].Deactivate();

            await _context.Users.AddRangeAsync(seedUsers);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded database with {Count} users", seedUsers.Count);

            // Seed Products
            await SeedProductsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw new InvalidOperationException("Failed to seed database with initial data", ex);
        }
    }

    private async Task SeedProductsAsync()
    {
        try
        {
            // Seed Products if none exist
            if (!await _context.Products.AnyAsync())
            {
                _logger.LogInformation("Seeding database with initial products...");

                var seedProducts = new List<Product>
                {
                    new Product("Laptop Computer", 999.99m, 25),
                    new Product("Wireless Mouse", 29.99m, 150),
                    new Product("Mechanical Keyboard", 89.99m, 75),
                    new Product("USB-C Cable", 19.99m, 200),
                    new Product("Monitor Stand", 49.99m, 50),
                    new Product("Webcam HD", 79.99m, 30),
                    new Product("Desk Lamp", 39.99m, 40),
                    new Product("Office Chair", 299.99m, 15),
                    new Product("Smartphone", 699.99m, 60),
                    new Product("Tablet", 399.99m, 35)
                };

                // Set one product as low stock for testing
                seedProducts[5].UpdateStock(5); 
                
                // Set one product as out of stock for testing
                seedProducts[7].UpdateStock(0); 

                await _context.Products.AddRangeAsync(seedProducts);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully seeded database with {Count} products", seedProducts.Count);
            }
            else
            {
                _logger.LogInformation("Products already exist in database. Skipping product seed.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding products: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException("Failed to seed products data", ex);
        }
    }
}
