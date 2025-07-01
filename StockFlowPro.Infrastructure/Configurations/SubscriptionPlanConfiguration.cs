using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.ToTable("SubscriptionPlans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Price)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(x => x.BillingInterval)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.BillingIntervalCount)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.IsPublic)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.TrialPeriodDays)
            .IsRequired(false);

        builder.Property(x => x.MaxUsers)
            .IsRequired(false);

        builder.Property(x => x.MaxProjects)
            .IsRequired(false);

        builder.Property(x => x.MaxStorageGB)
            .IsRequired(false);

        builder.Property(x => x.HasAdvancedReporting)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.HasApiAccess)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.HasPrioritySupport)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.Features)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Metadata)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        builder.Property(x => x.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.StripeProductId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.StripePriceId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalPlanId)
            .IsRequired(false)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(x => x.Name)
            .IsUnique();

        builder.HasIndex(x => x.IsActive);

        builder.HasIndex(x => x.IsPublic);

        builder.HasIndex(x => x.SortOrder);

        builder.HasIndex(x => x.StripeProductId)
            .IsUnique()
            .HasFilter("[StripeProductId] IS NOT NULL");

        builder.HasIndex(x => x.StripePriceId)
            .IsUnique()
            .HasFilter("[StripePriceId] IS NOT NULL");

        // Relationships
        builder.HasMany(x => x.Subscriptions)
            .WithOne(x => x.SubscriptionPlan)
            .HasForeignKey(x => x.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.PlanFeatures)
            .WithOne(x => x.SubscriptionPlan)
            .HasForeignKey(x => x.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}