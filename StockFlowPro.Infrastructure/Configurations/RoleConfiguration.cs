using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(r => r.DisplayName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(r => r.Description)
            .HasMaxLength(500);
            
        builder.Property(r => r.Permissions)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
            .HasColumnType("nvarchar(max)");
            
        builder.Property(r => r.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
            
        // Indexes for SQL Server optimization
        builder.HasIndex(r => r.Name)
            .IsUnique()
            .HasDatabaseName("IX_Roles_Name");
            
        builder.HasIndex(r => r.Priority)
            .HasDatabaseName("IX_Roles_Priority");
            
        builder.HasIndex(r => r.IsActive)
            .HasDatabaseName("IX_Roles_IsActive");
            
        // Relationships
        builder.HasMany(r => r.Users)
            .WithOne(u => u.DatabaseRole)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("Permissions");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(p => p.DisplayName)
            .IsRequired()
            .HasMaxLength(150);
            
        builder.Property(p => p.Description)
            .HasMaxLength(500);
            
        builder.Property(p => p.Category)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(p => p.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
            
        // Indexes
        builder.HasIndex(p => p.Name)
            .IsUnique()
            .HasDatabaseName("IX_Permissions_Name");
            
        builder.HasIndex(p => p.Category)
            .HasDatabaseName("IX_Permissions_Category");
            
        builder.HasIndex(p => p.IsActive)
            .HasDatabaseName("IX_Permissions_IsActive");
    }
}

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("RolePermissions");
        
        builder.HasKey(rp => rp.Id);
        
        builder.Property(rp => rp.GrantedAt)
            .HasDefaultValueSql("GETUTCDATE()");
            
        // Composite index for performance
        builder.HasIndex(rp => new { rp.RoleId, rp.PermissionId })
            .IsUnique()
            .HasDatabaseName("IX_RolePermissions_Role_Permission");
            
        // Relationships
        builder.HasOne(rp => rp.Role)
            .WithMany()
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}