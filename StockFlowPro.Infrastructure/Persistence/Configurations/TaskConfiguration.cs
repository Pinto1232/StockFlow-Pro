using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Persistence.Configurations;

public class TaskConfiguration : IEntityTypeConfiguration<Domain.Entities.ProjectTask>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.ProjectTask> builder)
    {
        builder.HasKey(t => t.Id);
        
        builder.Property(t => t.TaskId)
            .IsRequired();
        
        builder.Property(t => t.TaskName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(t => t.Description)
            .HasMaxLength(1000);
        
        builder.Property(t => t.DueDate)
            .HasMaxLength(50);
        
        builder.Property(t => t.Type)
            .HasMaxLength(20);
        
        builder.Property(t => t.Priority)
            .HasConversion<int>();
        
        builder.Property(t => t.AssigneeData)
            .HasColumnType("nvarchar(max)")
            .HasDefaultValue("[]");
        
        builder.Property(t => t.CreatedAt)
            .IsRequired();
        
        builder.Property(t => t.UpdatedAt);
        
        // Foreign key relationship with Employee
        builder.HasOne(t => t.Employee)
            .WithMany(e => e.Tasks)
            .HasForeignKey(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Self-referencing relationship for parent-child tasks
        builder.HasOne(t => t.ParentTask)
            .WithMany(t => t.Subtasks)
            .HasForeignKey(t => t.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(t => t.TaskId)
            .HasDatabaseName("IX_Tasks_TaskId");
        
        builder.HasIndex(t => t.EmployeeId)
            .HasDatabaseName("IX_Tasks_EmployeeId");
        
        builder.HasIndex(t => t.ParentTaskId)
            .HasDatabaseName("IX_Tasks_ParentTaskId");
        
        builder.ToTable("Tasks");
    }
}
