using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class PaymentMethodEntityConfiguration : IEntityTypeConfiguration<PaymentMethodEntity>
{
    public void Configure(EntityTypeBuilder<PaymentMethodEntity> builder)
    {
        builder.ToTable("PaymentMethods");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Last4Digits)
            .IsRequired(false)
            .HasMaxLength(4);

        builder.Property(x => x.Brand)
            .IsRequired(false)
            .HasMaxLength(50);

        builder.Property(x => x.ExpiryMonth)
            .IsRequired(false);

        builder.Property(x => x.ExpiryYear)
            .IsRequired(false);

        builder.Property(x => x.HolderName)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        builder.Property(x => x.StripePaymentMethodId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.PayPalPaymentMethodId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.BillingAddress)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Metadata)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        // Indexes
        builder.HasIndex(x => x.UserId);

        builder.HasIndex(x => x.IsDefault);

        builder.HasIndex(x => x.IsActive);

        builder.HasIndex(x => x.StripePaymentMethodId)
            .IsUnique()
            .HasFilter("[StripePaymentMethodId] IS NOT NULL");

        builder.HasIndex(x => x.PayPalPaymentMethodId)
            .IsUnique()
            .HasFilter("[PayPalPaymentMethodId] IS NOT NULL");

        // Composite indexes
        builder.HasIndex(x => new { x.UserId, x.IsDefault });
        builder.HasIndex(x => new { x.UserId, x.IsActive });

        // Relationships
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}