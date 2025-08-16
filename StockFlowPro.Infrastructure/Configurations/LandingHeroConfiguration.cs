using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class LandingHeroConfiguration : IEntityTypeConfiguration<LandingHero>
{
    public void Configure(EntityTypeBuilder<LandingHero> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .ValueGeneratedNever();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Subtitle)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.PrimaryButtonText)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.PrimaryButtonUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.SecondaryButtonText)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.SecondaryButtonUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => x.IsActive);

        builder.ToTable("LandingHeroes");
    }
}
