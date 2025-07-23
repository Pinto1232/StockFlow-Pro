using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("NotificationPreferences");
        
        builder.HasKey(np => np.Id);
        
        builder.Property(np => np.UserId)
            .IsRequired();
            
        builder.Property(np => np.NotificationType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(np => np.EnabledChannels)
            .IsRequired()
            .HasConversion<int>();
            
        builder.Property(np => np.IsEnabled)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(np => np.MinimumPriority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(np => np.QuietHoursStart)
            .IsRequired(false);
            
        builder.Property(np => np.QuietHoursEnd)
            .IsRequired(false);
            
        builder.Property(np => np.RespectQuietHours)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(np => np.BatchingIntervalMinutes)
            .IsRequired(false);
            
        builder.Property(np => np.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.Property(np => np.UpdatedAt)
            .IsRequired(false);
            
        // Unique constraint on user and notification type combination
        builder.HasIndex(np => new { np.UserId, np.NotificationType })
            .IsUnique()
            .HasDatabaseName("IX_NotificationPreferences_User_Type");
            
        // Indexes for performance optimization
        builder.HasIndex(np => np.UserId)
            .HasDatabaseName("IX_NotificationPreferences_UserId");
            
        builder.HasIndex(np => np.NotificationType)
            .HasDatabaseName("IX_NotificationPreferences_Type");
            
        builder.HasIndex(np => np.IsEnabled)
            .HasDatabaseName("IX_NotificationPreferences_IsEnabled");
            
        builder.HasIndex(np => new { np.NotificationType, np.IsEnabled })
            .HasDatabaseName("IX_NotificationPreferences_Type_Enabled");
            
        // Relationships
        builder.HasOne(np => np.User)
            .WithMany()
            .HasForeignKey(np => np.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}