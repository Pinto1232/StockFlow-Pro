using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a role in the system with associated permissions and metadata.
/// </summary>
public class Role : IEntity
{
    /// <summary>
    /// Gets the unique identifier for the role.
    /// </summary>
    public Guid Id { get; private set; }

    /// <summary>
    /// Gets the unique name of the role (e.g., "Admin", "Manager", "User").
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the display name of the role for UI purposes.
    /// </summary>
    public string DisplayName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the description of the role and its purpose.
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the list of permissions associated with this role.
    /// </summary>
    public List<string> Permissions { get; private set; } = new();

    /// <summary>
    /// Gets a value indicating whether the role is currently active.
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Gets a value indicating whether this is a system-defined role that cannot be deleted.
    /// </summary>
    public bool IsSystemRole { get; private set; } = false;

    /// <summary>
    /// Gets the priority of the role for ordering purposes (higher values = higher priority).
    /// </summary>
    public int Priority { get; private set; } = 0;

    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last update timestamp.
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Navigation property for users assigned to this role.
    /// </summary>
    public virtual ICollection<User> Users { get; private set; } = new List<User>();

    private Role() { }

    public Role(string name, string? displayName = null, string? description = null, List<string>? permissions = null, int priority = 0, bool isSystemRole = false)
    {
        Id = Guid.NewGuid();
        Name = name;
        DisplayName = displayName ?? name;
        Description = description ?? string.Empty;
        Permissions = permissions ?? new List<string>();
        Priority = priority;
        IsSystemRole = isSystemRole;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDisplayName(string displayName)
    {
        DisplayName = displayName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDescription(string description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePermissions(List<string> permissions)
    {
        Permissions = permissions;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePriority(int priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}