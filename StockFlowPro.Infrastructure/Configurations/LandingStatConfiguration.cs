using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class LandingStatConfiguration : IEntityTypeConfiguration<LandingStat>
{
    public void Configure(EntityTypeBuilder<LandingStat> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .ValueGeneratedNever();

        builder.Property(x => x.Number)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Label)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.IconName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.SortOrder)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => x.Label)
            .IsUnique();

        builder.HasIndex(x => x.SortOrder);
        
        builder.HasIndex(x => x.IsActive);

        builder.ToTable("LandingStats");
    }
}
