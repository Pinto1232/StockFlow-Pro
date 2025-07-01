using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class SubscriptionHistoryConfiguration : IEntityTypeConfiguration<SubscriptionHistory>
{
    public void Configure(EntityTypeBuilder<SubscriptionHistory> builder)
    {
        builder.ToTable("SubscriptionHistories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.SubscriptionId)
            .IsRequired();

        builder.Property(x => x.FromStatus)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.ToStatus)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Reason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.ChangedAt)
            .IsRequired();

        builder.Property(x => x.ChangedBy)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(x => x.Metadata)
            .IsRequired(false)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(x => x.SubscriptionId);

        builder.HasIndex(x => x.ChangedAt);

        builder.HasIndex(x => x.FromStatus);

        builder.HasIndex(x => x.ToStatus);

        // Composite indexes
        builder.HasIndex(x => new { x.SubscriptionId, x.ChangedAt });

        // Relationships
        builder.HasOne(x => x.Subscription)
            .WithMany(x => x.SubscriptionHistories)
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}