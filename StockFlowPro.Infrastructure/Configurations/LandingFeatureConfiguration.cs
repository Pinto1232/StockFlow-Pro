using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class LandingFeatureConfiguration : IEntityTypeConfiguration<LandingFeature>
{
    public void Configure(EntityTypeBuilder<LandingFeature> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .ValueGeneratedNever();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.IconName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ColorClass)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.SortOrder)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => x.Title)
            .IsUnique();

        builder.HasIndex(x => x.SortOrder);
        
        builder.HasIndex(x => x.IsActive);

        builder.ToTable("LandingFeatures");
    }
}
