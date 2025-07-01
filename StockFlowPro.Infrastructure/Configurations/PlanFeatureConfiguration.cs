using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class PlanFeatureConfiguration : IEntityTypeConfiguration<PlanFeature>
{
    public void Configure(EntityTypeBuilder<PlanFeature> builder)
    {
        builder.ToTable("PlanFeatures");

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

        builder.Property(x => x.FeatureKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.DefaultValue)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.FeatureType)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("boolean");

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(x => x.FeatureKey)
            .IsUnique();

        builder.HasIndex(x => x.IsActive);

        builder.HasIndex(x => x.SortOrder);

        // Relationships
        builder.HasMany(x => x.SubscriptionPlanFeatures)
            .WithOne(x => x.PlanFeature)
            .HasForeignKey(x => x.PlanFeatureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}