using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(256);
        builder.Property(e => e.PhoneNumber).HasMaxLength(50);
        builder.Property(e => e.JobTitle).IsRequired().HasMaxLength(150);
        builder.Property(e => e.DepartmentName).HasMaxLength(150);

        builder.HasIndex(e => e.Email).IsUnique();

        // Ignore read-only navigation properties; map via backing fields with OwnsMany
        builder.Ignore(e => e.Documents);
        builder.Ignore(e => e.OnboardingChecklist);
        builder.Ignore(e => e.OffboardingChecklist);

        // Owned types for checklists and documents as separate tables
        builder.OwnsMany<ChecklistItem>("_onboardingChecklist", ob =>
        {
            ob.ToTable("EmployeeOnboardingChecklist");
            ob.WithOwner().HasForeignKey("EmployeeId");
            ob.Property<Guid>("Id");
            ob.HasKey("Id");
            ob.Property(o => o.Code).IsRequired().HasMaxLength(50);
            ob.Property(o => o.Title).IsRequired().HasMaxLength(200);
            ob.Property(o => o.CreatedAt).IsRequired();
            ob.Property(o => o.CompletedAt);
        });

        builder.OwnsMany<ChecklistItem>("_offboardingChecklist", ob =>
        {
            ob.ToTable("EmployeeOffboardingChecklist");
            ob.WithOwner().HasForeignKey("EmployeeId");
            ob.Property<Guid>("Id");
            ob.HasKey("Id");
            ob.Property(o => o.Code).IsRequired().HasMaxLength(50);
            ob.Property(o => o.Title).IsRequired().HasMaxLength(200);
            ob.Property(o => o.CreatedAt).IsRequired();
            ob.Property(o => o.CompletedAt);
        });

        builder.OwnsMany<EmployeeDocument>("_documents", db =>
        {
            db.ToTable("EmployeeDocuments");
            db.WithOwner().HasForeignKey("EmployeeId");
            db.Property<Guid>("Id");
            db.HasKey("Id");
            db.Property(d => d.FileName).IsRequired().HasMaxLength(260);
            db.Property(d => d.StoragePath).IsRequired().HasMaxLength(512);
            db.Property(d => d.ContentType).IsRequired().HasMaxLength(100);
            db.Property(d => d.SizeBytes).IsRequired();
            db.Property(d => d.Type).IsRequired();
            db.Property(d => d.Version).IsRequired();
            db.Property(d => d.IsArchived).HasDefaultValue(false);
            db.Property(d => d.ArchiveReason).HasMaxLength(500);
            db.Property(d => d.CreatedAt).IsRequired();
            db.Property(d => d.ArchivedAt);
            db.Property(d => d.IssuedAt);
            db.Property(d => d.ExpiresAt);
        });
    }
}
