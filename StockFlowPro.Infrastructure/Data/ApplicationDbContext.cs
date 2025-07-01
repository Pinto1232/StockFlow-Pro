using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Persistence.Configurations;
using StockFlowPro.Infrastructure.Configurations;

namespace StockFlowPro.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
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
        }
    }
}
