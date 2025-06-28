using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Junction table for many-to-many relationship between Roles and Permissions
/// </summary>
public class RolePermission : IEntity
{
    public Guid Id { get; private set; }
    public Guid RoleId { get; private set; }
    public Guid PermissionId { get; private set; }
    public DateTime GrantedAt { get; private set; }
    public Guid GrantedBy { get; private set; }

    // Navigation properties
    public virtual Role Role { get; private set; } = null!;
    public virtual Permission Permission { get; private set; } = null!;

    private RolePermission() { }

    public RolePermission(Guid roleId, Guid permissionId, Guid grantedBy)
    {
        Id = Guid.NewGuid();
        RoleId = roleId;
        PermissionId = permissionId;
        GrantedBy = grantedBy;
        GrantedAt = DateTime.UtcNow;
    }
}