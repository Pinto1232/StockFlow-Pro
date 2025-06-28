using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .ValueGeneratedNever();

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)  
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(u => u.DateOfBirth)
            .IsRequired();

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .IsRequired(false);

        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(u => u.PasswordHash)
            .IsRequired(false)
            .HasMaxLength(500);
            
        // SQL Server enhanced security fields
        builder.Property(u => u.LastLoginIp)
            .HasMaxLength(45);
            
        builder.Property(u => u.SecurityStamp)
            .HasMaxLength(100);
            
        builder.Property(u => u.FailedLoginAttempts)
            .HasDefaultValue(0);
            
        builder.Property(u => u.RequirePasswordChange)
            .HasDefaultValue(false);
            
        // Indexes for SQL Server optimization
        builder.HasIndex(u => u.LastLoginAt)
            .HasDatabaseName("IX_Users_LastLogin");
            
        builder.HasIndex(u => u.RoleId)
            .HasDatabaseName("IX_Users_RoleId");
            
        builder.HasIndex(u => u.IsActive)
            .HasDatabaseName("IX_Users_IsActive");
            
        builder.HasIndex(u => u.LockedUntil)
            .HasDatabaseName("IX_Users_LockedUntil");

        builder.ToTable("Users");
    }
}
