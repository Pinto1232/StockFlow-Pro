using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        
        builder.HasKey(n => n.Id);
        
        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(2000);
            
        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(n => n.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(n => n.Channels)
            .IsRequired()
            .HasConversion<int>();
            
        builder.Property(n => n.RecipientId)
            .IsRequired(false);
            
        builder.Property(n => n.SenderId)
            .IsRequired(false);
            
        builder.Property(n => n.RelatedEntityId)
            .IsRequired(false);
            
        builder.Property(n => n.RelatedEntityType)
            .HasMaxLength(100);
            
        builder.Property(n => n.Metadata)
            .HasColumnType("nvarchar(max)");
            
        builder.Property(n => n.ActionUrl)
            .HasMaxLength(500);
            
        builder.Property(n => n.TemplateId)
            .HasMaxLength(100);
            
        builder.Property(n => n.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.Property(n => n.SentAt)
            .IsRequired(false);
            
        builder.Property(n => n.DeliveredAt)
            .IsRequired(false);
            
        builder.Property(n => n.ReadAt)
            .IsRequired(false);
            
        builder.Property(n => n.ExpiresAt)
            .IsRequired(false);
            
        builder.Property(n => n.DeliveryAttempts)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(n => n.LastError)
            .HasMaxLength(1000);
            
        builder.Property(n => n.IsPersistent)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(n => n.IsDismissible)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Indexes for performance optimization
        builder.HasIndex(n => n.RecipientId)
            .HasDatabaseName("IX_Notifications_RecipientId");
            
        builder.HasIndex(n => n.Status)
            .HasDatabaseName("IX_Notifications_Status");
            
        builder.HasIndex(n => n.Type)
            .HasDatabaseName("IX_Notifications_Type");
            
        builder.HasIndex(n => n.Priority)
            .HasDatabaseName("IX_Notifications_Priority");
            
        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("IX_Notifications_CreatedAt");
            
        builder.HasIndex(n => new { n.RecipientId, n.Status })
            .HasDatabaseName("IX_Notifications_Recipient_Status");
            
        builder.HasIndex(n => new { n.Type, n.Status })
            .HasDatabaseName("IX_Notifications_Type_Status");
            
        builder.HasIndex(n => new { n.RelatedEntityId, n.RelatedEntityType })
            .HasDatabaseName("IX_Notifications_RelatedEntity");
            
        builder.HasIndex(n => n.ExpiresAt)
            .HasDatabaseName("IX_Notifications_ExpiresAt")
            .HasFilter("[ExpiresAt] IS NOT NULL");
            
        // Relationships
        builder.HasOne(n => n.Recipient)
            .WithMany()
            .HasForeignKey(n => n.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(n => n.Sender)
            .WithMany()
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}