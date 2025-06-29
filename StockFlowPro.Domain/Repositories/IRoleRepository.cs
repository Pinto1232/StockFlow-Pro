using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for Role entity operations.
/// </summary>
public interface IRoleRepository
{
    /// <summary>
    /// Gets all roles from the database.
    /// </summary>
    Task<IEnumerable<Role>> GetAllAsync();

    /// <summary>
    /// Gets active roles only.
    /// </summary>
    Task<IEnumerable<Role>> GetActiveRolesAsync();

    /// <summary>
    /// Gets a role by its unique identifier.
    /// </summary>
    Task<Role?> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets a role by its name.
    /// </summary>
    Task<Role?> GetByNameAsync(string name);

    /// <summary>
    /// Creates a new role in the database.
    /// </summary>
    Task<Role> CreateAsync(Role role);

    /// <summary>
    /// Updates an existing role in the database.
    /// </summary>
    Task<Role> UpdateAsync(Role role);

    /// <summary>
    /// Deletes a role from the database.
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Checks if a role with the given name already exists.
    /// </summary>
    Task<bool> ExistsAsync(string name);

    /// <summary>
    /// Gets roles ordered by priority (highest first).
    /// </summary>
    Task<IEnumerable<Role>> GetOrderedByPriorityAsync();
}