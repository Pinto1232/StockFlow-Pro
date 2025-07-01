using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class PaymentRefundConfiguration : IEntityTypeConfiguration<PaymentRefund>
{
    public void Configure(EntityTypeBuilder<PaymentRefund> builder)
    {
        builder.ToTable("PaymentRefunds");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.PaymentId)
            .IsRequired();

        builder.Property(x => x.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(x => x.Reason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.RefundDate)
            .IsRequired();

        builder.Property(x => x.ExternalRefundId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.StripeRefundId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalRefundId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(x => x.PaymentId);

        builder.HasIndex(x => x.RefundDate);

        builder.HasIndex(x => x.ExternalRefundId)
            .IsUnique()
            .HasFilter("[ExternalRefundId] IS NOT NULL");

        builder.HasIndex(x => x.StripeRefundId)
            .IsUnique()
            .HasFilter("[StripeRefundId] IS NOT NULL");

        builder.HasIndex(x => x.PayPalRefundId)
            .IsUnique()
            .HasFilter("[PayPalRefundId] IS NOT NULL");

        // Relationships
        builder.HasOne(x => x.Payment)
            .WithMany(x => x.PaymentRefunds)
            .HasForeignKey(x => x.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}