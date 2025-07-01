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
                        string defaultPassword = user.Email switch
                        {
                            "admin" => "admin",
                            _ => user.Role switch
                            {
                                UserRole.Admin => "admin123",
                                UserRole.Manager => "manager123",
                                _ => "user123"
                            }
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
                await SeedRolesAsync();
                await SeedProductsAsync();
                await SeedSubscriptionSystemAsync();
                return;
            }

            _logger.LogInformation("Seeding database with initial users...");

            var seedUsers = new List<User>
            {
                // Test admin user with simple credentials
                new User(
                    firstName: "Admin",
                    lastName: "User",
                    email: "admin",
                    phoneNumber: "+1-555-0100",
                    dateOfBirth: new DateTime(1980, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Admin,
                    passwordHash: HashPassword("admin", "550e8400-e29b-41d4-a716-446655440000")
                ),
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

            // Seed Roles
            await SeedRolesAsync();

            // Seed Products
            await SeedProductsAsync();

            // Seed Subscription System
            await SeedSubscriptionSystemAsync();
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

    private async Task SeedRolesAsync()
    {
        try
        {
            // Seed Roles if none exist
            if (!await _context.Roles.AnyAsync())
            {
                _logger.LogInformation("Seeding database with initial roles...");

                var seedRoles = new List<Role>
                {
                    new Role(
                        "Admin",
                        "Administrator",
                        "Full system access and user management capabilities",
                        new List<string> { "Users.ViewAll", "Users.Create", "Users.Update", "Users.Delete", "System.ViewAdminPanel", "Reports.ViewAll", "Products.Manage", "Inventory.Manage" },
                        100,
                        true // System role
                    ),
                    new Role(
                        "Manager",
                        "Manager",
                        "Elevated privileges including reporting access and team management",
                        new List<string> { "Users.ViewTeam", "Products.Manage", "Reports.ViewAdvanced", "Inventory.Manage", "Reports.Create" },
                        50,
                        true // System role
                    ),
                    new Role(
                        "User",
                        "User",
                        "Standard user role with basic system access and product viewing",
                        new List<string> { "Products.View", "Reports.ViewBasic", "Profile.Update", "Profile.View" },
                        10,
                        true // System role
                    )
                };

                await _context.Roles.AddRangeAsync(seedRoles);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully seeded database with {Count} roles", seedRoles.Count);
            }
            else
            {
                _logger.LogInformation("Roles already exist in database. Skipping role seed.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding roles: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException("Failed to seed roles data", ex);
        }
    }

    private async Task SeedSubscriptionSystemAsync()
    {
        try
        {
            // Seed Plan Features if none exist
            if (!await _context.PlanFeatures.AnyAsync())
            {
                _logger.LogInformation("Seeding database with plan features...");

                var planFeatures = new List<PlanFeature>
                {
                    new PlanFeature("Advanced Analytics", "Access to advanced analytics and reporting dashboards", "advanced_analytics", "boolean"),
                    new PlanFeature("API Access", "Full REST API access for integrations", "api_access", "boolean"),
                    new PlanFeature("Priority Support", "24/7 priority customer support", "priority_support", "boolean"),
                    new PlanFeature("Custom Branding", "White-label and custom branding options", "custom_branding", "boolean"),
                    new PlanFeature("Data Export", "Export data in various formats (CSV, Excel, PDF)", "data_export", "boolean"),
                    new PlanFeature("Team Collaboration", "Advanced team collaboration features", "team_collaboration", "boolean"),
                    new PlanFeature("Advanced Reporting", "Custom reports and advanced analytics", "advanced_reporting", "boolean"),
                    new PlanFeature("Multi-Location Support", "Support for multiple business locations", "multi_location", "boolean"),
                    new PlanFeature("Inventory Forecasting", "AI-powered inventory forecasting", "inventory_forecasting", "boolean"),
                    new PlanFeature("Automated Workflows", "Custom automated business workflows", "automated_workflows", "boolean")
                };

                // Set sort orders
                for (int i = 0; i < planFeatures.Count; i++)
                {
                    planFeatures[i].SetSortOrder(i + 1);
                }

                await _context.PlanFeatures.AddRangeAsync(planFeatures);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully seeded {Count} plan features", planFeatures.Count);
            }

            // Seed Subscription Plans if none exist
            if (!await _context.SubscriptionPlans.AnyAsync())
            {
                _logger.LogInformation("Seeding database with subscription plans...");

                var basicPlan = new SubscriptionPlan(
                    "Basic",
                    "Perfect for individuals and small teams getting started with inventory management",
                    29.99m,
                    BillingInterval.Monthly,
                    "USD",
                    1,
                    14 // 14-day trial
                );
                basicPlan.UpdateLimits(maxUsers: 5, maxProjects: 10, maxStorageGB: 10);
                basicPlan.SetSortOrder(1);

                var proPlan = new SubscriptionPlan(
                    "Professional",
                    "Ideal for growing businesses with advanced features and team collaboration",
                    79.99m,
                    BillingInterval.Monthly,
                    "USD",
                    1,
                    14 // 14-day trial
                );
                proPlan.UpdateLimits(maxUsers: 25, maxProjects: 50, maxStorageGB: 100);
                proPlan.UpdateFeatures(hasAdvancedReporting: true, hasApiAccess: true, hasPrioritySupport: false);
                proPlan.SetSortOrder(2);

                var enterprisePlan = new SubscriptionPlan(
                    "Enterprise",
                    "For large organizations with unlimited users and premium support",
                    199.99m,
                    BillingInterval.Monthly,
                    "USD",
                    1,
                    14 // 14-day trial
                );
                enterprisePlan.UpdateLimits(maxUsers: null, maxProjects: null, maxStorageGB: null); // Unlimited
                enterprisePlan.UpdateFeatures(hasAdvancedReporting: true, hasApiAccess: true, hasPrioritySupport: true);
                enterprisePlan.SetSortOrder(3);

                // Annual plans with discounts
                var basicAnnual = new SubscriptionPlan(
                    "Basic Annual",
                    "Basic plan with annual billing - Save 20%",
                    287.99m, // 29.99 * 12 * 0.8 = 20% discount
                    BillingInterval.Annual,
                    "USD",
                    1,
                    14
                );
                basicAnnual.UpdateLimits(maxUsers: 5, maxProjects: 10, maxStorageGB: 10);
                basicAnnual.SetSortOrder(4);

                var proAnnual = new SubscriptionPlan(
                    "Professional Annual",
                    "Professional plan with annual billing - Save 20%",
                    767.99m, // 79.99 * 12 * 0.8 = 20% discount
                    BillingInterval.Annual,
                    "USD",
                    1,
                    14
                );
                proAnnual.UpdateLimits(maxUsers: 25, maxProjects: 50, maxStorageGB: 100);
                proAnnual.UpdateFeatures(hasAdvancedReporting: true, hasApiAccess: true, hasPrioritySupport: false);
                proAnnual.SetSortOrder(5);

                var enterpriseAnnual = new SubscriptionPlan(
                    "Enterprise Annual",
                    "Enterprise plan with annual billing - Save 20%",
                    1919.99m, // 199.99 * 12 * 0.8 = 20% discount
                    BillingInterval.Annual,
                    "USD",
                    1,
                    14
                );
                enterpriseAnnual.UpdateLimits(maxUsers: null, maxProjects: null, maxStorageGB: null);
                enterpriseAnnual.UpdateFeatures(hasAdvancedReporting: true, hasApiAccess: true, hasPrioritySupport: true);
                enterpriseAnnual.SetSortOrder(6);

                var subscriptionPlans = new List<SubscriptionPlan>
                {
                    basicPlan, proPlan, enterprisePlan,
                    basicAnnual, proAnnual, enterpriseAnnual
                };

                await _context.SubscriptionPlans.AddRangeAsync(subscriptionPlans);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully seeded {Count} subscription plans", subscriptionPlans.Count);

                // Seed Plan Features relationships
                await SeedPlanFeaturesRelationshipsAsync(subscriptionPlans);
            }

            // Seed sample subscriptions for existing users
            await SeedSampleSubscriptionsAsync();

            _logger.LogInformation("Subscription system seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding subscription system: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException("Failed to seed subscription system data", ex);
        }
    }

    private async Task SeedPlanFeaturesRelationshipsAsync(List<SubscriptionPlan> plans)
    {
        try
        {
            var features = await _context.PlanFeatures.ToListAsync();
            var planFeatureRelationships = new List<SubscriptionPlanFeature>();

            // Basic Plan Features
            var basicPlan = plans.First(p => p.Name == "Basic");
            var basicAnnual = plans.First(p => p.Name == "Basic Annual");
            var basicFeatures = new[] { "data_export" };
            
            foreach (var featureKey in basicFeatures)
            {
                var feature = features.First(f => f.FeatureKey == featureKey);
                planFeatureRelationships.Add(new SubscriptionPlanFeature(basicPlan.Id, feature.Id, "true", true));
                planFeatureRelationships.Add(new SubscriptionPlanFeature(basicAnnual.Id, feature.Id, "true", true));
            }

            // Professional Plan Features
            var proPlan = plans.First(p => p.Name == "Professional");
            var proAnnual = plans.First(p => p.Name == "Professional Annual");
            var proFeatures = new[] { "data_export", "advanced_analytics", "api_access", "team_collaboration", "advanced_reporting" };
            
            foreach (var featureKey in proFeatures)
            {
                var feature = features.First(f => f.FeatureKey == featureKey);
                planFeatureRelationships.Add(new SubscriptionPlanFeature(proPlan.Id, feature.Id, "true", true));
                planFeatureRelationships.Add(new SubscriptionPlanFeature(proAnnual.Id, feature.Id, "true", true));
            }

            // Enterprise Plan Features (all features)
            var enterprisePlan = plans.First(p => p.Name == "Enterprise");
            var enterpriseAnnual = plans.First(p => p.Name == "Enterprise Annual");
            
            foreach (var feature in features)
            {
                planFeatureRelationships.Add(new SubscriptionPlanFeature(enterprisePlan.Id, feature.Id, "true", true));
                planFeatureRelationships.Add(new SubscriptionPlanFeature(enterpriseAnnual.Id, feature.Id, "true", true));
            }

            await _context.SubscriptionPlanFeatures.AddRangeAsync(planFeatureRelationships);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded {Count} plan feature relationships", planFeatureRelationships.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding plan feature relationships: {ErrorMessage}", ex.Message);
            throw;
        }
    }

    private async Task SeedSampleSubscriptionsAsync()
    {
        try
        {
            if (await _context.Subscriptions.AnyAsync())
            {
                _logger.LogInformation("Subscriptions already exist. Skipping sample subscription seeding.");
                return;
            }

            var users = await _context.Users.ToListAsync();
            var plans = await _context.SubscriptionPlans.ToListAsync();

            if (!users.Any() || !plans.Any())
            {
                _logger.LogWarning("No users or plans found. Skipping sample subscription seeding.");
                return;
            }

            var subscriptions = new List<Subscription>();
            var payments = new List<Payment>();

            // Admin user gets Enterprise subscription
            var adminUser = users.FirstOrDefault(u => u.Role == UserRole.Admin);
            if (adminUser != null)
            {
                var enterprisePlan = plans.FirstOrDefault(p => p.Name == "Enterprise");
                if (enterprisePlan != null)
                {
                    var adminSubscription = new Subscription(
                        adminUser.Id,
                        enterprisePlan.Id,
                        DateTime.UtcNow.AddDays(-30), // Started 30 days ago
                        enterprisePlan.Price,
                        enterprisePlan.Currency
                    );
                    adminSubscription.RenewPeriod(); // Make it current
                    subscriptions.Add(adminSubscription);

                    // Add a successful payment
                    var adminPayment = new Payment(
                        adminSubscription.Id,
                        adminUser.Id,
                        enterprisePlan.Price,
                        enterprisePlan.Currency,
                        Domain.Enums.PaymentMethod.CreditCard,
                        "Enterprise subscription payment"
                    );
                    adminPayment.MarkAsCompleted("stripe_ch_test_admin_123", DateTime.UtcNow.AddDays(-30));
                    adminPayment.SetBillingPeriod(adminSubscription.CurrentPeriodStart, adminSubscription.CurrentPeriodEnd);
                    payments.Add(adminPayment);
                }
            }

            // Manager user gets Professional subscription
            var managerUser = users.FirstOrDefault(u => u.Role == UserRole.Manager);
            if (managerUser != null)
            {
                var proPlan = plans.FirstOrDefault(p => p.Name == "Professional");
                if (proPlan != null)
                {
                    var managerSubscription = new Subscription(
                        managerUser.Id,
                        proPlan.Id,
                        DateTime.UtcNow.AddDays(-15), // Started 15 days ago
                        proPlan.Price,
                        proPlan.Currency
                    );
                    subscriptions.Add(managerSubscription);

                    // Add a successful payment
                    var managerPayment = new Payment(
                        managerSubscription.Id,
                        managerUser.Id,
                        proPlan.Price,
                        proPlan.Currency,
                        Domain.Enums.PaymentMethod.PayPal,
                        "Professional subscription payment"
                    );
                    managerPayment.MarkAsCompleted("paypal_txn_manager_456", DateTime.UtcNow.AddDays(-15));
                    managerPayment.SetBillingPeriod(managerSubscription.CurrentPeriodStart, managerSubscription.CurrentPeriodEnd);
                    payments.Add(managerPayment);
                }
            }

            // Regular user gets Basic subscription (trial)
            var regularUser = users.FirstOrDefault(u => u.Role == UserRole.User && u.IsActive);
            if (regularUser != null)
            {
                var basicPlan = plans.FirstOrDefault(p => p.Name == "Basic");
                if (basicPlan != null)
                {
                    var userSubscription = new Subscription(
                        regularUser.Id,
                        basicPlan.Id,
                        DateTime.UtcNow.AddDays(-5), // Started 5 days ago
                        basicPlan.Price,
                        basicPlan.Currency,
                        DateTime.UtcNow.AddDays(9) // Trial ends in 9 days
                    );
                    subscriptions.Add(userSubscription);
                }
            }

            // Add sample payment methods for users
            var paymentMethods = new List<PaymentMethodEntity>();
            
            if (adminUser != null)
            {
                var adminPaymentMethod = new PaymentMethodEntity(
                    adminUser.Id,
                    Domain.Enums.PaymentMethod.CreditCard,
                    "4242",
                    "Visa",
                    12,
                    2025,
                    "John Admin"
                );
                adminPaymentMethod.SetAsDefault();
                paymentMethods.Add(adminPaymentMethod);
            }

            if (managerUser != null)
            {
                var managerPaymentMethod = new PaymentMethodEntity(
                    managerUser.Id,
                    Domain.Enums.PaymentMethod.PayPal,
                    null,
                    null,
                    null,
                    null,
                    "Jane Manager"
                );
                managerPaymentMethod.SetAsDefault();
                paymentMethods.Add(managerPaymentMethod);
            }

            // Save all data
            if (subscriptions.Any())
            {
                await _context.Subscriptions.AddRangeAsync(subscriptions);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully seeded {Count} sample subscriptions", subscriptions.Count);
            }

            if (payments.Any())
            {
                await _context.Payments.AddRangeAsync(payments);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully seeded {Count} sample payments", payments.Count);
            }

            if (paymentMethods.Any())
            {
                await _context.PaymentMethods.AddRangeAsync(paymentMethods);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully seeded {Count} sample payment methods", paymentMethods.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding sample subscriptions: {ErrorMessage}", ex.Message);
            throw;
        }
    }
}