namespace StockFlowPro.Application.DTOs;

/// <summary>
/// Data transfer object for role information.
/// </summary>
public class RoleDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the role.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the role.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the role.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the description of the role.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the list of permissions associated with this role.
    /// </summary>
    public List<string> Permissions { get; set; } = new();

    /// <summary>
    /// Gets or sets a value indicating whether the role is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is a system role.
    /// </summary>
    public bool IsSystemRole { get; set; }

    /// <summary>
    /// Gets or sets the priority of the role.
    /// </summary>
    public int Priority { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the last update timestamp.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the number of users assigned to this role.
    /// </summary>
    public int UserCount { get; set; }
}

/// <summary>
/// Data transfer object for creating a new role.
/// </summary>
public class CreateRoleDto
{
    /// <summary>
    /// Gets or sets the unique name of the role.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the role.
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the description of the role.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the list of permissions to assign to this role.
    /// </summary>
    public List<string>? Permissions { get; set; }

    /// <summary>
    /// Gets or sets the priority of the role.
    /// </summary>
    public int Priority { get; set; } = 0;
}

/// <summary>
/// Data transfer object for updating an existing role.
/// </summary>
public class UpdateRoleDto
{
    /// <summary>
    /// Gets or sets the display name of the role.
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the description of the role.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the list of permissions to assign to this role.
    /// </summary>
    public List<string>? Permissions { get; set; }

    /// <summary>
    /// Gets or sets the priority of the role.
    /// </summary>
    public int Priority { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the role is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Data transfer object for role options in dropdowns and selection lists.
/// </summary>
public class RoleOptionDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the role.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the role.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the role.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the description of the role.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the CSS icon class for the role.
    /// </summary>
    public string IconClass { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the priority of the role.
    /// </summary>
    public int Priority { get; set; }

    /// <summary>
    /// Gets or sets the key permissions for display purposes.
    /// </summary>
    public List<string> KeyPermissions { get; set; } = new();
}