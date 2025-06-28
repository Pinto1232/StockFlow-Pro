using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a specific permission in the system
/// </summary>
public class Permission : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public virtual ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    private Permission() { }

    public Permission(string name, string displayName, string description, string category)
    {
        Id = Guid.NewGuid();
        Name = name;
        DisplayName = displayName;
        Description = description;
        Category = category;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string displayName, string description, string category)
    {
        DisplayName = displayName;
        Description = description;
        Category = category;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}