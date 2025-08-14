using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Infrastructure.Data;

public class DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<DatabaseSeeder> _logger = logger;

    private static string HashPassword(string password, string salt)
    {
        var saltedPassword = password + salt;
        var hashedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(saltedPassword));
        var hashedPassword = Convert.ToBase64String(hashedBytes);
        return $"{hashedPassword}:{salt}";
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Starting database initialization...");
            
            // First, try to apply migrations
            try
            {
                _logger.LogInformation("Applying database migrations...");
                await _context.Database.MigrateAsync();
                _logger.LogInformation("Database migrations applied successfully.");
            }
            catch (Exception migrationEx)
            {
                _logger.LogWarning(migrationEx, "Migration failed, attempting to ensure database is created...");
                await _context.Database.EnsureCreatedAsync();
                _logger.LogInformation("Database created using EnsureCreatedAsync.");
            }
            
            // Verify database is ready
            if (!await _context.Database.CanConnectAsync())
            {
                throw new InvalidOperationException("Cannot connect to database after initialization");
            }

            // Check if Users table exists and is accessible
            bool usersTableExists = false;
            try
            {
                var userCount = await _context.Users.CountAsync();
                usersTableExists = true;
                _logger.LogInformation("Users table exists with {Count} records", userCount);
            }
            catch (Exception)
            {
                _logger.LogWarning("Users table does not exist or is not accessible");
                usersTableExists = false;
            }

            if (usersTableExists && await _context.Users.CountAsync() > 0)
            {
                var usersWithoutPasswords = await _context.Users
                    .Where(u => string.IsNullOrEmpty(u.PasswordHash))
                    .ToListAsync();
                
                if (usersWithoutPasswords.Count > 0)
                {
                    _logger.LogInformation("Found {Count} users without password hashes. Updating them...", usersWithoutPasswords.Count);
                    
                    foreach (var user in usersWithoutPasswords)
                    {
                        string defaultPassword = user.Email switch
                        {
                            "admin" => "admin",
                            _ => user.Role switch
                            {
                                UserRole.Admin => "SecureAdmin2024!",
                                UserRole.Manager => "SecureManager2024!",
                                _ => "SecureUser2024!"
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
                await SeedPermissionsAsync();
                await SeedProductsAsync();
                await SeedEmployeesAsync();
                await SeedSubscriptionSystemAsync();
                await SeedNotificationSystemAsync();
                await SeedLandingContentAsync();
                return;
            }
            else if (!usersTableExists)
            {
                _logger.LogWarning("Users table does not exist. Database schema may not be properly initialized.");
                _logger.LogInformation("Attempting to create database schema...");
                
                // Try to ensure database and schema are created
                await _context.Database.EnsureCreatedAsync();
                
                // Verify the Users table now exists
                try
                {
                    await _context.Users.CountAsync();
                    _logger.LogInformation("Database schema created successfully. Proceeding with seeding...");
                }
                catch (Exception schemaEx)
                {
                    _logger.LogError(schemaEx, "Failed to create database schema");
                    throw new InvalidOperationException("Could not create database schema", schemaEx);
                }
            }

            _logger.LogInformation("Seeding database with initial users...");

            var seedUsers = new List<User>
            {
                // Test admin user with simple credentials
                new(
                    firstName: "Admin",
                    lastName: "User",
                    email: "admin",
                    phoneNumber: "+1-555-0100",
                    dateOfBirth: new DateTime(1980, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Admin,
                    passwordHash: HashPassword("admin", "550e8400-e29b-41d4-a716-446655440000")
                ),
                new(
                    firstName: "John",
                    lastName: "Admin",
                    email: "admin@stockflowpro.com",
                    phoneNumber: "+1-555-0101",
                    dateOfBirth: new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Admin,
                    passwordHash: HashPassword("SecureAdmin2024!", "550e8400-e29b-41d4-a716-446655440001")
                ),
                new(
                    firstName: "Jane",
                    lastName: "Manager",
                    email: "manager@stockflow.com",
                    phoneNumber: "+1-555-0102",
                    dateOfBirth: new DateTime(1990, 8, 22, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.Manager,
                    passwordHash: HashPassword("SecureManager2024!", "550e8400-e29b-41d4-a716-446655440002")
                ),
                new(
                    firstName: "Bob",
                    lastName: "User",
                    email: "user@stockflow.com",
                    phoneNumber: "+1-555-0103",
                    dateOfBirth: new DateTime(1992, 12, 10, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.User,
                    passwordHash: HashPassword("SecureUser2024!", "550e8400-e29b-41d4-a716-446655440003")
                ),
                new(
                    firstName: "Alice",
                    lastName: "Smith",
                    email: "alice.smith@stockflowpro.com",
                    phoneNumber: "+1-555-0104",
                    dateOfBirth: new DateTime(1988, 3, 7, 0, 0, 0, DateTimeKind.Utc),
                    role: UserRole.User,
                    passwordHash: HashPassword("alice123", "550e8400-e29b-41d4-a716-446655440004")
                )
            };

            seedUsers[^1].Deactivate();

            await _context.Users.AddRangeAsync(seedUsers);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded database with {Count} users", seedUsers.Count);

            // Seed Roles
            await SeedRolesAsync();

            // Seed Permissions and Role Permissions
            await SeedPermissionsAsync();

            // Seed Products
            await SeedProductsAsync();

            // Seed Employees
            await SeedEmployeesAsync();

            // Seed Subscription System
            await SeedSubscriptionSystemAsync();

            // Seed Notification System
            await SeedNotificationSystemAsync();

            // Seed Landing Content
            await SeedLandingContentAsync();
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
                    new("Laptop Computer", 999.99m, 25),
                    new("Wireless Mouse", 29.99m, 150),
                    new("Mechanical Keyboard", 89.99m, 75),
                    new("USB-C Cable", 19.99m, 200),
                    new("Monitor Stand", 49.99m, 50),
                    new("Webcam HD", 79.99m, 30),
                    new("Desk Lamp", 39.99m, 40),
                    new("Office Chair", 299.99m, 15),
                    new("Smartphone", 699.99m, 60),
                    new("Tablet", 399.99m, 35)
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

    private async Task SeedEmployeesAsync()
    {
        try
        {
            if (await _context.Employees.AnyAsync())
            {
                _logger.LogInformation("Employees already exist in database. Skipping employee seed.");
                return;
            }

            _logger.LogInformation("Seeding database with initial employees...");

            var now = DateTime.UtcNow;
            var employees = new List<Employee>();

            // Onboarding employee (not yet active)
            var onboardingEmp = new Employee(
                firstName: "Ethan",
                lastName: "Onboard",
                email: "ethan.onboard@company.com",
                phoneNumber: "+1-555-1001",
                jobTitle: "Junior Analyst",
                departmentId: null,
                departmentName: "Operations",
                managerId: null,
                hireDate: now.AddDays(-7)
            );
            onboardingEmp.AddDocument(
                fileName: "national-id.pdf",
                type: DocumentType.Identification,
                storagePath: "employees/ethan/id-v1.pdf",
                sizeBytes: 120_000,
                contentType: "application/pdf",
                issuedAt: now.AddYears(-5),
                expiresAt: now.AddYears(5)
            );
            employees.Add(onboardingEmp);

            // Active employee (completed onboarding)
            var activeEmp = new Employee(
                firstName: "Ava",
                lastName: "Active",
                email: "ava.active@company.com",
                phoneNumber: "+1-555-1002",
                jobTitle: "Senior Engineer",
                departmentId: null,
                departmentName: "Engineering",
                managerId: null,
                hireDate: now.AddMonths(-6)
            );
            foreach (var code in new[] { "ACCOUNTS", "DOCUMENTS", "CONTRACT", "TRAINING" })
            {
                activeEmp.CompleteOnboardingTask(code);
            }
            activeEmp.AddDocument(
                fileName: "employment-contract.pdf",
                type: DocumentType.Contract,
                storagePath: "employees/ava/contract-v1.pdf",
                sizeBytes: 250_000,
                contentType: "application/pdf",
                issuedAt: now.AddMonths(-6),
                expiresAt: null
            );
            employees.Add(activeEmp);

            // Suspended employee
            var suspendedEmp = new Employee(
                firstName: "Sam",
                lastName: "Suspended",
                email: "sam.suspended@company.com",
                phoneNumber: "+1-555-1003",
                jobTitle: "Support Specialist",
                departmentId: null,
                departmentName: "Support",
                managerId: null,
                hireDate: now.AddMonths(-3)
            );
            foreach (var code in new[] { "ACCOUNTS", "DOCUMENTS", "CONTRACT", "TRAINING" })
            {
                suspendedEmp.CompleteOnboardingTask(code);
            }
            suspendedEmp.Suspend("Policy review in progress");
            employees.Add(suspendedEmp);

            // Offboarding employee
            var offboardingEmp = new Employee(
                firstName: "Olivia",
                lastName: "Offboard",
                email: "olivia.offboard@company.com",
                phoneNumber: "+1-555-1004",
                jobTitle: "Account Manager",
                departmentId: null,
                departmentName: "Sales",
                managerId: null,
                hireDate: now.AddYears(-2)
            );
            foreach (var code in new[] { "ACCOUNTS", "DOCUMENTS", "CONTRACT", "TRAINING" })
            {
                offboardingEmp.CompleteOnboardingTask(code);
            }
            offboardingEmp.InitiateOffboarding("Role redundancy");
            // Complete one offboarding task
            offboardingEmp.CompleteOffboardingTask("DISABLE_ACCESS");
            employees.Add(offboardingEmp);

            // Terminated employee
            var terminatedEmp = new Employee(
                firstName: "Liam",
                lastName: "Terminated",
                email: "liam.terminated@company.com",
                phoneNumber: "+1-555-1005",
                jobTitle: "Intern",
                departmentId: null,
                departmentName: "R&D",
                managerId: null,
                hireDate: now.AddMonths(-2)
            );
            terminatedEmp.Terminate("Contract ended");
            employees.Add(terminatedEmp);

            await _context.Employees.AddRangeAsync(employees);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully seeded database with {Count} employees", employees.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding employees: {Message}", ex.Message);
            throw new InvalidOperationException("Failed to seed employees data", ex);
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

    private async Task SeedPermissionsAsync()
    {
        try
        {
            // Seed Permissions if none exist
            if (!await _context.Permissions.AnyAsync())
            {
                _logger.LogInformation("Seeding database with permissions...");

                var permissions = new List<Permission>
                {
                    // User Management Permissions
                    new("users.view", "View Users", "View user profiles and basic information", "User Management"),
                    new("users.create", "Create Users", "Create new user accounts", "User Management"),
                    new("users.edit", "Edit Users", "Edit user profiles and information", "User Management"),
                    new("users.delete", "Delete Users", "Delete user accounts", "User Management"),
                    new("users.view_all", "View All Users", "View all users in the system", "User Management"),
                    new("users.manage_roles", "Manage User Roles", "Assign and modify user roles", "User Management"),
                    new("users.view_reports", "View User Reports", "Access user-related reports", "User Management"),

                    // System Administration Permissions
                    new("system.view_admin_panel", "View Admin Panel", "Access the administrative dashboard", "System Administration"),
                    new("system.manage_settings", "Manage Settings", "Configure system settings", "System Administration"),
                    new("system.view_logs", "View System Logs", "Access system logs and audit trails", "System Administration"),
                    new("system.sync_data", "Sync Data", "Perform data synchronization operations", "System Administration"),
                    new("system.view_statistics", "View Statistics", "Access system statistics and metrics", "System Administration"),

                    // Data Management Permissions
                    new("data.export", "Export Data", "Export data in various formats", "Data Management"),
                    new("data.import", "Import Data", "Import data from external sources", "Data Management"),
                    new("data.backup", "Backup Data", "Create system backups", "Data Management"),
                    new("data.restore", "Restore Data", "Restore data from backups", "Data Management"),

                    // Invoice Management Permissions
                    new("invoice.view", "View Invoices", "View invoice information", "Invoice Management"),
                    new("invoice.create", "Create Invoices", "Create new invoices", "Invoice Management"),
                    new("invoice.edit", "Edit Invoices", "Modify existing invoices", "Invoice Management"),
                    new("invoice.delete", "Delete Invoices", "Delete invoices", "Invoice Management"),
                    new("invoice.view_all", "View All Invoices", "Access all invoices in the system", "Invoice Management"),
                    new("invoice.manage_items", "Manage Invoice Items", "Add, edit, and remove invoice items", "Invoice Management"),

                    // Product Management Permissions
                    new("product.view", "View Products", "View product information and catalog", "Product Management"),
                    new("product.create", "Create Products", "Add new products to inventory", "Product Management"),
                    new("product.edit", "Edit Products", "Modify product information", "Product Management"),
                    new("product.delete", "Delete Products", "Remove products from inventory", "Product Management"),
                    new("product.update_stock", "Update Stock", "Modify product stock levels", "Product Management"),
                    new("product.view_reports", "View Product Reports", "Access product-related reports", "Product Management"),

                    // Reporting Permissions
                    new("reports.view_basic", "View Basic Reports", "Access basic reporting features", "Reporting"),
                    new("reports.view_advanced", "View Advanced Reports", "Access advanced reporting and analytics", "Reporting"),
                    new("reports.generate", "Generate Reports", "Create custom reports", "Reporting"),
                    new("reports.schedule", "Schedule Reports", "Set up automated report generation", "Reporting")
                };

                await _context.Permissions.AddRangeAsync(permissions);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully seeded {Count} permissions", permissions.Count);

                // Now seed role permissions
                await SeedRolePermissionsAsync();
            }
            else
            {
                _logger.LogInformation("Permissions already exist in database. Checking role permissions...");
                await SeedRolePermissionsAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding permissions: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException("Failed to seed permissions data", ex);
        }
    }

    private async Task SeedRolePermissionsAsync()
    {
        try
        {
            // Check if role permissions already exist
            if (await _context.RolePermissions.AnyAsync())
            {
                _logger.LogInformation("Role permissions already exist in database. Skipping role permission seed.");
                return;
            }

            _logger.LogInformation("Seeding role permissions...");

            var roles = await _context.Roles.ToListAsync();
            var permissions = await _context.Permissions.ToListAsync();

            if (!roles.Any() || !permissions.Any())
            {
                _logger.LogWarning("No roles or permissions found. Skipping role permission seeding.");
                return;
            }

            var rolePermissions = new List<RolePermission>();
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            var grantedBy = adminUser?.Id ?? Guid.NewGuid();

            // Admin Role - Gets all permissions
            var adminRole = roles.FirstOrDefault(r => r.Name == "Admin");
            if (adminRole != null)
            {
                foreach (var permission in permissions)
                {
                    rolePermissions.Add(new RolePermission(adminRole.Id, permission.Id, grantedBy));
                }
            }

            // Manager Role - Gets specific permissions
            var managerRole = roles.FirstOrDefault(r => r.Name == "Manager");
            if (managerRole != null)
            {
                var managerPermissionNames = new[]
                {
                    "users.view", "users.edit", "users.view_all", "users.view_reports",
                    "product.view", "product.create", "product.edit", "product.update_stock", "product.view_reports",
                    "invoice.view", "invoice.create", "invoice.edit", "invoice.view_all", "invoice.manage_items",
                    "system.view_statistics",
                    "reports.view_basic", "reports.view_advanced", "reports.generate",
                    "data.export"
                };

                foreach (var permissionName in managerPermissionNames)
                {
                    var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
                    if (permission != null)
                    {
                        rolePermissions.Add(new RolePermission(managerRole.Id, permission.Id, grantedBy));
                    }
                }
            }

            // User Role - Gets basic permissions
            var userRole = roles.FirstOrDefault(r => r.Name == "User");
            if (userRole != null)
            {
                var userPermissionNames = new[]
                {
                    "users.view", "users.edit",
                    "product.view",
                    "reports.view_basic"
                };

                foreach (var permissionName in userPermissionNames)
                {
                    var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
                    if (permission != null)
                    {
                        rolePermissions.Add(new RolePermission(userRole.Id, permission.Id, grantedBy));
                    }
                }
            }

            if (rolePermissions.Any())
            {
                await _context.RolePermissions.AddRangeAsync(rolePermissions);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully seeded {Count} role permissions", rolePermissions.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding role permissions: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException("Failed to seed role permissions data", ex);
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
                    new("Advanced Analytics", "Access to advanced analytics and reporting dashboards", "advanced_analytics", "boolean"),
                    new("API Access", "Full REST API access for integrations", "api_access", "boolean"),
                    new("Priority Support", "24/7 priority customer support", "priority_support", "boolean"),
                    new("Custom Branding", "White-label and custom branding options", "custom_branding", "boolean"),
                    new("Data Export", "Export data in various formats (CSV, Excel, PDF)", "data_export", "boolean"),
                    new("Team Collaboration", "Advanced team collaboration features", "team_collaboration", "boolean"),
                    new("Advanced Reporting", "Custom reports and advanced analytics", "advanced_reporting", "boolean"),
                    new("Multi-Location Support", "Support for multiple business locations", "multi_location", "boolean"),
                    new("Inventory Forecasting", "AI-powered inventory forecasting", "inventory_forecasting", "boolean"),
                    new("Automated Workflows", "Custom automated business workflows", "automated_workflows", "boolean")
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
                planFeatureRelationships.Add(new(basicPlan.Id, feature.Id, "true", true));
                planFeatureRelationships.Add(new(basicAnnual.Id, feature.Id, "true", true));
            }

            // Professional Plan Features
            var proPlan = plans.First(p => p.Name == "Professional");
            var proAnnual = plans.First(p => p.Name == "Professional Annual");
            var proFeatures = new[] { "data_export", "advanced_analytics", "api_access", "team_collaboration", "advanced_reporting" };
            
            foreach (var featureKey in proFeatures)
            {
                var feature = features.First(f => f.FeatureKey == featureKey);
                planFeatureRelationships.Add(new(proPlan.Id, feature.Id, "true", true));
                planFeatureRelationships.Add(new(proAnnual.Id, feature.Id, "true", true));
            }

            // Enterprise Plan Features (all features)
            var enterprisePlan = plans.First(p => p.Name == "Enterprise");
            var enterpriseAnnual = plans.First(p => p.Name == "Enterprise Annual");
            
            foreach (var feature in features)
            {
                planFeatureRelationships.Add(new(enterprisePlan.Id, feature.Id, "true", true));
                planFeatureRelationships.Add(new(enterpriseAnnual.Id, feature.Id, "true", true));
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

    private async Task SeedLandingContentAsync()
    {
        try
        {
            _logger.LogInformation("Seeding landing content...");

            // Seed Landing Features
            if (!await _context.LandingFeatures.AnyAsync())
            {
                var features = new List<LandingFeature>
                {
                    new("Employee Management", 
                        "Comprehensive employee profiles, onboarding workflows, and organizational charts",
                        "UserCheck", 
                        "from-blue-500 to-cyan-500", 
                        1),
                    new("Leave & Attendance", 
                        "Smart leave management, time tracking, and automated attendance monitoring",
                        "Calendar", 
                        "from-green-500 to-emerald-500", 
                        2),
                    new("Payroll Integration", 
                        "Seamless payroll processing with tax calculations and compliance reporting",
                        "DollarSign", 
                        "from-purple-500 to-pink-500", 
                        3),
                    new("Compliance & Reporting", 
                        "Automated compliance checks and comprehensive HR analytics dashboard",
                        "FileText", 
                        "from-orange-500 to-red-500", 
                        4)
                };

                await _context.LandingFeatures.AddRangeAsync(features);
                _logger.LogInformation("Added {Count} landing features", features.Count);
            }

            // Seed Landing Testimonials
            if (!await _context.LandingTestimonials.AnyAsync())
            {
                var testimonials = new List<LandingTestimonial>
                {
                    new("Sarah Johnson", 
                        "HR Director", 
                        "TechCorp Solutions",
                        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
                        "StockFlow Pro HR transformed our people management. We reduced administrative time by 60% and improved employee satisfaction significantly.",
                        1),
                    new("Michael Chen", 
                        "Operations Manager", 
                        "GrowthStart Inc",
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
                        "The automated compliance features saved us from potential legal issues. The reporting dashboard gives us insights we never had before.",
                        2),
                    new("Emily Rodriguez", 
                        "CEO", 
                        "InnovateLab",
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
                        "As a growing company, we needed HR tools that could scale with us. StockFlow Pro delivered exactly that and more.",
                        3)
                };

                await _context.LandingTestimonials.AddRangeAsync(testimonials);
                _logger.LogInformation("Added {Count} landing testimonials", testimonials.Count);
            }

            // Seed Landing Stats
            if (!await _context.LandingStats.AnyAsync())
            {
                var stats = new List<LandingStat>
                {
                    new("10,000+", "Employees Managed", "Users", 1),
                    new("500+", "Companies Trust Us", "Building2", 2),
                    new("99.9%", "Uptime Guarantee", "Shield", 3),
                    new("24/7", "Expert Support", "HeadphonesIcon", 4)
                };

                await _context.LandingStats.AddRangeAsync(stats);
                _logger.LogInformation("Added {Count} landing stats", stats.Count);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Landing content seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while seeding landing content");
            throw;
        }
    }
}