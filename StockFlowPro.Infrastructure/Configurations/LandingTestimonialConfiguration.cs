using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class LandingTestimonialConfiguration : IEntityTypeConfiguration<LandingTestimonial>
{
    public void Configure(EntityTypeBuilder<LandingTestimonial> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Role)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Company)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.ImageUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Quote)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(x => x.SortOrder)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => x.Name);

        builder.HasIndex(x => x.SortOrder);
        
        builder.HasIndex(x => x.IsActive);

        builder.ToTable("LandingTestimonials");
    }
}
