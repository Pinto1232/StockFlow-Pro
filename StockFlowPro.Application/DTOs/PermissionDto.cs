namespace StockFlowPro.Application.DTOs;

/// <summary>
/// Data transfer object for permission information
/// </summary>
public class PermissionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Data transfer object for creating a new permission
/// </summary>
public class CreatePermissionDto
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

/// <summary>
/// Data transfer object for updating an existing permission
/// </summary>
public class UpdatePermissionDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Data transfer object for role permission relationship
/// </summary>
public class RolePermissionDto
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string PermissionName { get; set; } = string.Empty;
    public string PermissionDisplayName { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; }
}

/// <summary>
/// Data transfer object for creating a role permission relationship
/// </summary>
public class CreateRolePermissionDto
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
}

/// <summary>
/// Data transfer object for user permissions
/// </summary>
public class UserPermissionsDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public List<PermissionDto> DetailedPermissions { get; set; } = new();
}

/// <summary>
/// Data transfer object for permission categories
/// </summary>
public class PermissionCategory
{
    public string Category { get; set; } = string.Empty;
    public List<PermissionDto> Permissions { get; set; } = new();
}