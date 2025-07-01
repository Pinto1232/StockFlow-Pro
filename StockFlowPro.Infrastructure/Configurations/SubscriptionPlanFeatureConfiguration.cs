using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class SubscriptionPlanFeatureConfiguration : IEntityTypeConfiguration<SubscriptionPlanFeature>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlanFeature> builder)
    {
        builder.ToTable("SubscriptionPlanFeatures");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedNever();

        builder.Property(x => x.SubscriptionPlanId)
            .IsRequired();

        builder.Property(x => x.PlanFeatureId)
            .IsRequired();

        builder.Property(x => x.Value)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(x => x.IsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(x => x.SubscriptionPlanId);

        builder.HasIndex(x => x.PlanFeatureId);

        builder.HasIndex(x => x.IsEnabled);

        // Composite unique index to prevent duplicate plan-feature combinations
        builder.HasIndex(x => new { x.SubscriptionPlanId, x.PlanFeatureId })
            .IsUnique();

        // Relationships
        builder.HasOne(x => x.SubscriptionPlan)
            .WithMany(x => x.PlanFeatures)
            .HasForeignKey(x => x.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.PlanFeature)
            .WithMany(x => x.SubscriptionPlanFeatures)
            .HasForeignKey(x => x.PlanFeatureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}