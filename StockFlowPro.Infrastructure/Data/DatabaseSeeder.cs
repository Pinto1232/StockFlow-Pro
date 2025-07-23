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
                await SeedNotificationSystemAsync();
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

            // Seed Notification System
            await SeedNotificationSystemAsync();
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

    private async Task SeedNotificationSystemAsync()
    {
        try
        {
            _logger.LogInformation("Starting notification system seeding...");

            // Seed Notification Templates
            await SeedNotificationTemplatesAsync();

            // Seed Notification Preferences for existing users
            await SeedNotificationPreferencesAsync();

            // Seed Sample Notifications
            await SeedSampleNotificationsAsync();

            _logger.LogInformation("Notification system seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding notification system: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException("Failed to seed notification system data", ex);
        }
    }

    private async Task SeedNotificationTemplatesAsync()
    {
        try
        {
            if (await _context.NotificationTemplates.AnyAsync())
            {
                _logger.LogInformation("Notification templates already exist. Skipping template seeding.");
                return;
            }

            _logger.LogInformation("Seeding notification templates...");

            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            if (adminUser == null)
            {
                _logger.LogWarning("No admin user found. Skipping notification template seeding.");
                return;
            }

            var templates = new List<NotificationTemplate>
            {
                // Stock Alert Templates
                new NotificationTemplate(
                    "LowStockAlert",
                    "Alert when product stock is running low",
                    "Low Stock Alert: {ProductName}",
                    "Product '{ProductName}' is running low on stock. Current quantity: {CurrentStock}. Minimum threshold: {MinimumStock}.",
                    NotificationType.StockAlert,
                    adminUser.Id,
                    NotificationPriority.High,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                ),
                new NotificationTemplate(
                    "OutOfStockAlert",
                    "Alert when product is out of stock",
                    "Out of Stock: {ProductName}",
                    "Product '{ProductName}' is now out of stock. Immediate restocking required.",
                    NotificationType.StockAlert,
                    adminUser.Id,
                    NotificationPriority.Critical,
                    NotificationChannel.InApp | NotificationChannel.Email | NotificationChannel.SMS,
                    true,
                    true
                ),
                new NotificationTemplate(
                    "StockRestocked",
                    "Notification when stock is replenished",
                    "Stock Replenished: {ProductName}",
                    "Product '{ProductName}' has been restocked. New quantity: {NewStock}.",
                    NotificationType.StockAlert,
                    adminUser.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp,
                    true,
                    true
                ),

                // Account Templates
                new NotificationTemplate(
                    "WelcomeUser",
                    "Welcome message for new users",
                    "Welcome to StockFlow Pro!",
                    "Welcome {UserName}! Your account has been successfully created. Start managing your inventory efficiently with StockFlow Pro.",
                    NotificationType.Account,
                    adminUser.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                ),
                new NotificationTemplate(
                    "PasswordChanged",
                    "Notification when password is changed",
                    "Password Changed",
                    "Your password has been successfully changed on {ChangeDate}. If you didn't make this change, please contact support immediately.",
                    NotificationType.Security,
                    adminUser.Id,
                    NotificationPriority.High,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    false
                ),
                new NotificationTemplate(
                    "LoginAlert",
                    "Security alert for new login",
                    "New Login Detected",
                    "A new login was detected on your account from {Location} at {LoginTime}. If this wasn't you, please secure your account immediately.",
                    NotificationType.Security,
                    adminUser.Id,
                    NotificationPriority.High,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    false
                ),

                // System Templates
                new NotificationTemplate(
                    "SystemMaintenance",
                    "System maintenance notification",
                    "Scheduled Maintenance: {MaintenanceDate}",
                    "System maintenance is scheduled for {MaintenanceDate} from {StartTime} to {EndTime}. Some features may be temporarily unavailable.",
                    NotificationType.System,
                    adminUser.Id,
                    NotificationPriority.High,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    false
                ),
                new NotificationTemplate(
                    "SystemUpdate",
                    "System update notification",
                    "System Update Available",
                    "A new system update is available with exciting features and improvements. Update will be applied during the next maintenance window.",
                    NotificationType.System,
                    adminUser.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp,
                    true,
                    true
                ),

                // Subscription Templates
                new NotificationTemplate(
                    "SubscriptionExpiring",
                    "Subscription expiration warning",
                    "Subscription Expiring Soon",
                    "Your {PlanName} subscription will expire on {ExpirationDate}. Renew now to continue enjoying all features.",
                    NotificationType.Subscription,
                    adminUser.Id,
                    NotificationPriority.High,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    false
                ),
                new NotificationTemplate(
                    "PaymentSuccessful",
                    "Successful payment notification",
                    "Payment Successful",
                    "Your payment of {Amount} for {PlanName} has been processed successfully. Thank you for your continued subscription.",
                    NotificationType.Payment,
                    adminUser.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                ),
                new NotificationTemplate(
                    "PaymentFailed",
                    "Failed payment notification",
                    "Payment Failed",
                    "We couldn't process your payment of {Amount} for {PlanName}. Please update your payment method to avoid service interruption.",
                    NotificationType.Payment,
                    adminUser.Id,
                    NotificationPriority.Critical,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    false
                ),

                // Report Templates
                new NotificationTemplate(
                    "ReportGenerated",
                    "Report generation completion",
                    "Report Ready: {ReportName}",
                    "Your requested report '{ReportName}' has been generated and is ready for download.",
                    NotificationType.Report,
                    adminUser.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                ),

                // Product Templates
                new NotificationTemplate(
                    "ProductAdded",
                    "New product added notification",
                    "New Product Added: {ProductName}",
                    "A new product '{ProductName}' has been added to the inventory with initial stock of {InitialStock} units.",
                    NotificationType.Product,
                    adminUser.Id,
                    NotificationPriority.Low,
                    NotificationChannel.InApp,
                    true,
                    true
                ),
                new NotificationTemplate(
                    "ProductUpdated",
                    "Product update notification",
                    "Product Updated: {ProductName}",
                    "Product '{ProductName}' has been updated. {UpdateDetails}",
                    NotificationType.Product,
                    adminUser.Id,
                    NotificationPriority.Low,
                    NotificationChannel.InApp,
                    true,
                    true
                )
            };

            // Set action URLs for templates
            templates.First(t => t.Name == "LowStockAlert").SetActionUrl("/products/{ProductId}");
            templates.First(t => t.Name == "OutOfStockAlert").SetActionUrl("/products/{ProductId}");
            templates.First(t => t.Name == "StockRestocked").SetActionUrl("/products/{ProductId}");
            templates.First(t => t.Name == "ReportGenerated").SetActionUrl("/reports/{ReportId}");
            templates.First(t => t.Name == "ProductAdded").SetActionUrl("/products/{ProductId}");
            templates.First(t => t.Name == "ProductUpdated").SetActionUrl("/products/{ProductId}");

            // Set expiration for time-sensitive templates
            templates.First(t => t.Name == "SystemMaintenance").SetExpiration(48); // 48 hours
            templates.First(t => t.Name == "SubscriptionExpiring").SetExpiration(72); // 72 hours
            templates.First(t => t.Name == "PaymentFailed").SetExpiration(168); // 1 week

            await _context.NotificationTemplates.AddRangeAsync(templates);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded {Count} notification templates", templates.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding notification templates: {ErrorMessage}", ex.Message);
            throw;
        }
    }

    private async Task SeedNotificationPreferencesAsync()
    {
        try
        {
            if (await _context.NotificationPreferences.AnyAsync())
            {
                _logger.LogInformation("Notification preferences already exist. Skipping preference seeding.");
                return;
            }

            _logger.LogInformation("Seeding notification preferences...");

            var users = await _context.Users.ToListAsync();
            if (!users.Any())
            {
                _logger.LogWarning("No users found. Skipping notification preference seeding.");
                return;
            }

            var preferences = new List<NotificationPreference>();

            foreach (var user in users)
            {
                // Create preferences for each notification type based on user role
                foreach (NotificationType notificationType in Enum.GetValues<NotificationType>())
                {
                    var channels = GetDefaultChannelsForUserRole(user.Role, notificationType);
                    var minimumPriority = GetDefaultMinimumPriorityForUserRole(user.Role, notificationType);
                    var isEnabled = GetDefaultEnabledStateForUserRole(user.Role, notificationType);

                    var preference = new NotificationPreference(
                        user.Id,
                        notificationType,
                        channels,
                        isEnabled,
                        minimumPriority
                    );

                    // Set quiet hours (10 PM to 7 AM) for non-admin users
                    if (user.Role != UserRole.Admin)
                    {
                        preference.SetQuietHours(new TimeSpan(22, 0, 0), new TimeSpan(7, 0, 0));
                    }

                    // Set batching for low-priority notifications
                    if (notificationType == NotificationType.Info || notificationType == NotificationType.Product)
                    {
                        preference.SetBatching(60); // 1 hour batching
                    }

                    preferences.Add(preference);
                }
            }

            await _context.NotificationPreferences.AddRangeAsync(preferences);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded {Count} notification preferences for {UserCount} users", 
                preferences.Count, users.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding notification preferences: {ErrorMessage}", ex.Message);
            throw;
        }
    }

    private async Task SeedSampleNotificationsAsync()
    {
        try
        {
            if (await _context.Notifications.AnyAsync())
            {
                _logger.LogInformation("Notifications already exist. Skipping sample notification seeding.");
                return;
            }

            _logger.LogInformation("Seeding sample notifications...");

            var users = await _context.Users.ToListAsync();
            var products = await _context.Products.ToListAsync();

            if (!users.Any())
            {
                _logger.LogWarning("No users found. Skipping sample notification seeding.");
                return;
            }

            var notifications = new List<Notification>();
            var adminUser = users.FirstOrDefault(u => u.Role == UserRole.Admin);
            var managerUser = users.FirstOrDefault(u => u.Role == UserRole.Manager);
            var regularUsers = users.Where(u => u.Role == UserRole.User).ToList();

            // Welcome notifications for all users
            foreach (var user in users)
            {
                var welcomeNotification = new Notification(
                    "Welcome to StockFlow Pro!",
                    $"Welcome {user.FirstName}! Your account has been successfully created. Start managing your inventory efficiently with StockFlow Pro.",
                    NotificationType.Account,
                    user.Id,
                    adminUser?.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                );
                welcomeNotification.MarkAsDelivered();
                if (user.Role == UserRole.User) // Regular users have read their welcome message
                {
                    welcomeNotification.MarkAsRead();
                }
                notifications.Add(welcomeNotification);
            }

            // Stock alerts for managers and admins
            if (products.Any())
            {
                var lowStockProduct = products.FirstOrDefault(p => p.NumberInStock <= 10);
                var outOfStockProduct = products.FirstOrDefault(p => p.NumberInStock == 0);

                if (lowStockProduct != null)
                {
                    foreach (var user in users.Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager))
                    {
                        var lowStockAlert = new Notification(
                            $"Low Stock Alert: {lowStockProduct.Name}",
                            $"Product '{lowStockProduct.Name}' is running low on stock. Current quantity: {lowStockProduct.NumberInStock}. Consider restocking soon.",
                            NotificationType.StockAlert,
                            user.Id,
                            adminUser?.Id,
                            NotificationPriority.High,
                            NotificationChannel.InApp | NotificationChannel.Email,
                            true,
                            true
                        );
                        lowStockAlert.SetRelatedEntity(lowStockProduct.Id, "Product");
                        lowStockAlert.SetActionUrl($"/products/{lowStockProduct.Id}");
                        lowStockAlert.MarkAsDelivered();
                        notifications.Add(lowStockAlert);
                    }
                }

                if (outOfStockProduct != null)
                {
                    foreach (var user in users.Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager))
                    {
                        var outOfStockAlert = new Notification(
                            $"Out of Stock: {outOfStockProduct.Name}",
                            $"Product '{outOfStockProduct.Name}' is now out of stock. Immediate restocking required.",
                            NotificationType.StockAlert,
                            user.Id,
                            adminUser?.Id,
                            NotificationPriority.Critical,
                            NotificationChannel.InApp | NotificationChannel.Email | NotificationChannel.SMS,
                            true,
                            true
                        );
                        outOfStockAlert.SetRelatedEntity(outOfStockProduct.Id, "Product");
                        outOfStockAlert.SetActionUrl($"/products/{outOfStockProduct.Id}");
                        outOfStockAlert.MarkAsDelivered();
                        notifications.Add(outOfStockAlert);
                    }
                }
            }

            // System notifications for all users
            var systemNotification = new Notification(
                "System Update Completed",
                "StockFlow Pro has been updated with new features and improvements. Check out the latest enhancements in your dashboard.",
                NotificationType.System,
                null, // System-wide notification
                adminUser?.Id,
                NotificationPriority.Normal,
                NotificationChannel.InApp,
                true,
                true
            );
            systemNotification.MarkAsDelivered();
            notifications.Add(systemNotification);

            // Subscription notifications for users with subscriptions
            var subscriptionUsers = await _context.Subscriptions
                .Select(s => s.UserId)
                .Distinct()
                .ToListAsync();

            foreach (var userId in subscriptionUsers)
            {
                var subscriptionNotification = new Notification(
                    "Payment Successful",
                    "Your subscription payment has been processed successfully. Thank you for your continued subscription to StockFlow Pro.",
                    NotificationType.Payment,
                    userId,
                    adminUser?.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                );
                subscriptionNotification.MarkAsDelivered();
                subscriptionNotification.MarkAsRead(); // Users have seen their payment confirmations
                notifications.Add(subscriptionNotification);
            }

            // Product update notifications
            if (products.Any())
            {
                var sampleProduct = products.First();
                foreach (var user in users.Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager))
                {
                    var productUpdateNotification = new Notification(
                        $"Product Updated: {sampleProduct.Name}",
                        $"Product '{sampleProduct.Name}' has been updated with new pricing and stock information.",
                        NotificationType.Product,
                        user.Id,
                        adminUser?.Id,
                        NotificationPriority.Low,
                        NotificationChannel.InApp,
                        true,
                        true
                    );
                    productUpdateNotification.SetRelatedEntity(sampleProduct.Id, "Product");
                    productUpdateNotification.SetActionUrl($"/products/{sampleProduct.Id}");
                    productUpdateNotification.MarkAsDelivered();
                    productUpdateNotification.MarkAsRead();
                    notifications.Add(productUpdateNotification);
                }
            }

            // Security notifications for admin users
            if (adminUser != null)
            {
                var securityNotification = new Notification(
                    "New Login Detected",
                    $"A new login was detected on your account from Unknown Location at {DateTime.UtcNow.AddHours(-2):yyyy-MM-dd HH:mm} UTC. If this wasn't you, please secure your account immediately.",
                    NotificationType.Security,
                    adminUser.Id,
                    null,
                    NotificationPriority.High,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    false
                );
                securityNotification.MarkAsDelivered();
                notifications.Add(securityNotification);
            }

            // Report notifications for managers and admins
            foreach (var user in users.Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager))
            {
                var reportNotification = new Notification(
                    "Report Ready: Monthly Inventory Summary",
                    "Your requested report 'Monthly Inventory Summary' has been generated and is ready for download.",
                    NotificationType.Report,
                    user.Id,
                    adminUser?.Id,
                    NotificationPriority.Normal,
                    NotificationChannel.InApp | NotificationChannel.Email,
                    true,
                    true
                );
                reportNotification.SetActionUrl("/reports/monthly-summary");
                reportNotification.MarkAsDelivered();
                if (user.Role == UserRole.Manager)
                {
                    reportNotification.MarkAsRead();
                }
                notifications.Add(reportNotification);
            }

            // Add some older notifications with different statuses
            var olderNotification = new Notification(
                "Maintenance Complete",
                "Scheduled system maintenance has been completed successfully. All systems are now fully operational.",
                NotificationType.System,
                null,
                adminUser?.Id,
                NotificationPriority.Normal,
                NotificationChannel.InApp,
                true,
                true
            );
            // Make it older
            var olderNotificationField = typeof(Notification).GetField("CreatedAt", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            olderNotificationField?.SetValue(olderNotification, DateTime.UtcNow.AddDays(-7));
            
            olderNotification.MarkAsDelivered();
            olderNotification.MarkAsRead();
            notifications.Add(olderNotification);

            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded {Count} sample notifications", notifications.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding sample notifications: {ErrorMessage}", ex.Message);
            throw;
        }
    }

    private static NotificationChannel GetDefaultChannelsForUserRole(UserRole role, NotificationType type)
    {
        return role switch
        {
            UserRole.Admin => type switch
            {
                NotificationType.StockAlert => NotificationChannel.InApp | NotificationChannel.Email | NotificationChannel.SMS,
                NotificationType.Security => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.System => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.Payment => NotificationChannel.InApp | NotificationChannel.Email,
                _ => NotificationChannel.InApp | NotificationChannel.Email
            },
            UserRole.Manager => type switch
            {
                NotificationType.StockAlert => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.Security => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.Report => NotificationChannel.InApp | NotificationChannel.Email,
                _ => NotificationChannel.InApp
            },
            _ => type switch
            {
                NotificationType.Account => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.Security => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.Payment => NotificationChannel.InApp | NotificationChannel.Email,
                NotificationType.Subscription => NotificationChannel.InApp | NotificationChannel.Email,
                _ => NotificationChannel.InApp
            }
        };
    }

    private static NotificationPriority GetDefaultMinimumPriorityForUserRole(UserRole role, NotificationType type)
    {
        return role switch
        {
            UserRole.Admin => NotificationPriority.Low,
            UserRole.Manager => type switch
            {
                NotificationType.StockAlert => NotificationPriority.Normal,
                NotificationType.Security => NotificationPriority.Normal,
                _ => NotificationPriority.Normal
            },
            _ => NotificationPriority.Normal
        };
    }

    private static bool GetDefaultEnabledStateForUserRole(UserRole role, NotificationType type)
    {
        return role switch
        {
            UserRole.Admin => true,
            UserRole.Manager => type switch
            {
                NotificationType.StockAlert => true,
                NotificationType.Product => true,
                NotificationType.Report => true,
                NotificationType.System => true,
                NotificationType.Security => true,
                _ => false
            },
            _ => type switch
            {
                NotificationType.Account => true,
                NotificationType.Security => true,
                NotificationType.Payment => true,
                NotificationType.Subscription => true,
                NotificationType.System => true,
                _ => false
            }
        };
    }
}