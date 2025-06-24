using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(i => i.CreatedDate)
            .IsRequired();

        builder.Property(i => i.CreatedByUserId)
            .IsRequired();

        builder.Property(i => i.Total)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(i => i.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(i => i.CreatedAt)
            .IsRequired();

        builder.Property(i => i.UpdatedAt)
            .IsRequired(false);

        // Relationships
        builder.HasOne(i => i.CreatedByUser)
            .WithMany()
            .HasForeignKey(i => i.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Items)
            .WithOne(ii => ii.Invoice)
            .HasForeignKey(ii => ii.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => i.CreatedByUserId);
        builder.HasIndex(i => i.CreatedDate);
        builder.HasIndex(i => i.IsActive);
    }
}