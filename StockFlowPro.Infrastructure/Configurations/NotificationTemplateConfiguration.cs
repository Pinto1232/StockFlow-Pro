using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("NotificationTemplates");
        
        builder.HasKey(nt => nt.Id);
        
        builder.Property(nt => nt.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(nt => nt.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(nt => nt.TitleTemplate)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(nt => nt.MessageTemplate)
            .IsRequired()
            .HasMaxLength(2000);
            
        builder.Property(nt => nt.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(nt => nt.DefaultPriority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(nt => nt.DefaultChannels)
            .IsRequired()
            .HasConversion<int>();
            
        builder.Property(nt => nt.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(nt => nt.IsPersistent)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(nt => nt.IsDismissible)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(nt => nt.DefaultActionUrl)
            .HasMaxLength(500);
            
        builder.Property(nt => nt.ExpirationHours)
            .IsRequired(false);
            
        builder.Property(nt => nt.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.Property(nt => nt.UpdatedAt)
            .IsRequired(false);
            
        builder.Property(nt => nt.CreatedBy)
            .IsRequired();
            
        // Unique constraint on template name
        builder.HasIndex(nt => nt.Name)
            .IsUnique()
            .HasDatabaseName("IX_NotificationTemplates_Name");
            
        // Indexes for performance optimization
        builder.HasIndex(nt => nt.Type)
            .HasDatabaseName("IX_NotificationTemplates_Type");
            
        builder.HasIndex(nt => nt.IsActive)
            .HasDatabaseName("IX_NotificationTemplates_IsActive");
            
        builder.HasIndex(nt => nt.CreatedBy)
            .HasDatabaseName("IX_NotificationTemplates_CreatedBy");
            
        builder.HasIndex(nt => new { nt.Type, nt.IsActive })
            .HasDatabaseName("IX_NotificationTemplates_Type_IsActive");
            
        // Relationships
        builder.HasOne(nt => nt.Creator)
            .WithMany()
            .HasForeignKey(nt => nt.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}