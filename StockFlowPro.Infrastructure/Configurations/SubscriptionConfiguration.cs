using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.SubscriptionPlanId)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired(false);

        builder.Property(x => x.TrialEndDate)
            .IsRequired(false);

        builder.Property(x => x.CurrentPeriodStart)
            .IsRequired();

        builder.Property(x => x.CurrentPeriodEnd)
            .IsRequired();

        builder.Property(x => x.CancelledAt)
            .IsRequired(false);

        builder.Property(x => x.CancelAtPeriodEnd)
            .IsRequired(false);

        builder.Property(x => x.CancellationReason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.CurrentPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(x => x.Quantity)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        builder.Property(x => x.StripeSubscriptionId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.StripeCustomerId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalSubscriptionId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalPayerId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.NextBillingDate)
            .IsRequired(false);

        builder.Property(x => x.GracePeriodDays)
            .IsRequired(false);

        builder.Property(x => x.GracePeriodEndDate)
            .IsRequired(false);

        builder.Property(x => x.FailedPaymentAttempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.LastPaymentAttemptDate)
            .IsRequired(false);

        builder.Property(x => x.Notes)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(x => x.Metadata)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        // Indexes
        builder.HasIndex(x => x.UserId);

        builder.HasIndex(x => x.SubscriptionPlanId);

        builder.HasIndex(x => x.Status);

        builder.HasIndex(x => x.StartDate);

        builder.HasIndex(x => x.EndDate);

        builder.HasIndex(x => x.CurrentPeriodEnd);

        builder.HasIndex(x => x.NextBillingDate);

        builder.HasIndex(x => x.StripeSubscriptionId)
            .IsUnique()
            .HasFilter("[StripeSubscriptionId] IS NOT NULL");

        builder.HasIndex(x => x.PayPalSubscriptionId)
            .IsUnique()
            .HasFilter("[PayPalSubscriptionId] IS NOT NULL");

        // Composite indexes
        builder.HasIndex(x => new { x.UserId, x.Status });
        builder.HasIndex(x => new { x.SubscriptionPlanId, x.Status });

        // Relationships
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SubscriptionPlan)
            .WithMany(x => x.Subscriptions)
            .HasForeignKey(x => x.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Payments)
            .WithOne(x => x.Subscription)
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.SubscriptionHistories)
            .WithOne(x => x.Subscription)
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}