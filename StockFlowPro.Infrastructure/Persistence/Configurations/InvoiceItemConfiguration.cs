using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Persistence.Configurations;

public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.HasKey(ii => ii.Id);

        builder.Property(ii => ii.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(ii => ii.InvoiceId)
            .IsRequired();

        builder.Property(ii => ii.ProductId)
            .IsRequired();

        builder.Property(ii => ii.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ii => ii.UnitPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(ii => ii.Quantity)
            .IsRequired();

        builder.Property(ii => ii.CreatedAt)
            .IsRequired();

        builder.Property(ii => ii.UpdatedAt)
            .IsRequired(false);

        // Relationships
        builder.HasOne(ii => ii.Invoice)
            .WithMany(i => i.Items)
            .HasForeignKey(ii => ii.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ii => ii.Product)
            .WithMany()
            .HasForeignKey(ii => ii.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ii => ii.InvoiceId);
        builder.HasIndex(ii => ii.ProductId);
    }
}