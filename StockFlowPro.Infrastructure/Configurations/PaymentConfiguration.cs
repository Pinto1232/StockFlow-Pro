using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.SubscriptionId)
            .IsRequired();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.PaymentMethod)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.PaymentDate)
            .IsRequired();

        builder.Property(x => x.ProcessedAt)
            .IsRequired(false);

        builder.Property(x => x.TransactionId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ExternalTransactionId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PaymentIntentId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.FailureReason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.FailureCode)
            .IsRequired(false)
            .HasMaxLength(50);

        builder.Property(x => x.RefundedAmount)
            .IsRequired(false)
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.RefundedAt)
            .IsRequired(false);

        builder.Property(x => x.RefundReason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.Description)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        builder.Property(x => x.StripeChargeId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.StripePaymentIntentId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalTransactionId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalPaymentId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.BillingPeriodStart)
            .IsRequired(false);

        builder.Property(x => x.BillingPeriodEnd)
            .IsRequired(false);

        builder.Property(x => x.PaymentMethodDetails)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.BillingAddress)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Metadata)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.AttemptCount)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(x => x.NextRetryAt)
            .IsRequired(false);

        builder.Property(x => x.RetryReason)
            .IsRequired(false)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(x => x.SubscriptionId);

        builder.HasIndex(x => x.UserId);

        builder.HasIndex(x => x.Status);

        builder.HasIndex(x => x.PaymentDate);

        builder.HasIndex(x => x.TransactionId)
            .IsUnique();

        builder.HasIndex(x => x.ExternalTransactionId)
            .IsUnique()
            .HasFilter("[ExternalTransactionId] IS NOT NULL");

        builder.HasIndex(x => x.StripeChargeId)
            .IsUnique()
            .HasFilter("[StripeChargeId] IS NOT NULL");

        builder.HasIndex(x => x.PayPalTransactionId)
            .IsUnique()
            .HasFilter("[PayPalTransactionId] IS NOT NULL");

        // Composite indexes
        builder.HasIndex(x => new { x.UserId, x.Status });
        builder.HasIndex(x => new { x.SubscriptionId, x.Status });
        builder.HasIndex(x => new { x.PaymentDate, x.Status });

        // Relationships
        builder.HasOne(x => x.Subscription)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.PaymentRefunds)
            .WithOne(x => x.Payment)
            .HasForeignKey(x => x.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}