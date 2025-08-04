using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Persistence.Configurations;
using StockFlowPro.Infrastructure.Configurations;

namespace StockFlowPro.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            Users = Set<User>();
            Products = Set<Product>();
            Invoices = Set<Invoice>();
            InvoiceItems = Set<InvoiceItem>();
            Roles = Set<Role>();
            Permissions = Set<Permission>();
            RolePermissions = Set<RolePermission>();
            SubscriptionPlans = Set<SubscriptionPlan>();
            Subscriptions = Set<Subscription>();
            Payments = Set<Payment>();
            PaymentRefunds = Set<PaymentRefund>();
            SubscriptionHistories = Set<SubscriptionHistory>();
            PlanFeatures = Set<PlanFeature>();
            SubscriptionPlanFeatures = Set<SubscriptionPlanFeature>();
            PaymentMethods = Set<PaymentMethodEntity>();
            Notifications = Set<Notification>();
            NotificationTemplates = Set<NotificationTemplate>();
            NotificationPreferences = Set<NotificationPreference>();
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        
        // Enhanced role management entities
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        
        // Subscription system entities
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentRefund> PaymentRefunds { get; set; }
        public DbSet<SubscriptionHistory> SubscriptionHistories { get; set; }
        public DbSet<PlanFeature> PlanFeatures { get; set; }
        public DbSet<SubscriptionPlanFeature> SubscriptionPlanFeatures { get; set; }
        public DbSet<PaymentMethodEntity> PaymentMethods { get; set; }
        
        // Enhanced notification system entities
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
        public DbSet<NotificationPreference> NotificationPreferences { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ProductConfiguration());
            modelBuilder.ApplyConfiguration(new InvoiceConfiguration());
            modelBuilder.ApplyConfiguration(new InvoiceItemConfiguration());
            
            // Enhanced role management configurations
            modelBuilder.ApplyConfiguration(new RoleConfiguration());
            modelBuilder.ApplyConfiguration(new PermissionConfiguration());
            modelBuilder.ApplyConfiguration(new RolePermissionConfiguration());
            
            // Subscription system configurations
            modelBuilder.ApplyConfiguration(new SubscriptionPlanConfiguration());
            modelBuilder.ApplyConfiguration(new SubscriptionConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentRefundConfiguration());
            modelBuilder.ApplyConfiguration(new SubscriptionHistoryConfiguration());
            modelBuilder.ApplyConfiguration(new PlanFeatureConfiguration());
            modelBuilder.ApplyConfiguration(new SubscriptionPlanFeatureConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentMethodEntityConfiguration());
            
            // Enhanced notification system configurations
            modelBuilder.ApplyConfiguration(new NotificationConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationTemplateConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationPreferenceConfiguration());
        }
    }
}
