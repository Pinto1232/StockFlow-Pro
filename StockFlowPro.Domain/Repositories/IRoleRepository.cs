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
    System.Threading.Tasks.Task<IEnumerable<Role>> GetAllAsync();

    /// <summary>
    /// Gets active roles only.
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<Role>> GetActiveRolesAsync();

    /// <summary>
    /// Gets a role by its unique identifier.
    /// </summary>
    System.Threading.Tasks.Task<Role?> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets a role by its name.
    /// </summary>
    System.Threading.Tasks.Task<Role?> GetByNameAsync(string name);

    /// <summary>
    /// Creates a new role in the database.
    /// </summary>
    System.Threading.Tasks.Task<Role> CreateAsync(Role role);

    /// <summary>
    /// Updates an existing role in the database.
    /// </summary>
    System.Threading.Tasks.Task<Role> UpdateAsync(Role role);

    /// <summary>
    /// Deletes a role from the database.
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(Guid id);

    /// <summary>
    /// Checks if a role with the given name already exists.
    /// </summary>
    System.Threading.Tasks.Task<bool> ExistsAsync(string name);

    /// <summary>
    /// Gets roles ordered by priority (highest first).
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<Role>> GetOrderedByPriorityAsync();

    /// <summary>
    /// Gets roles assigned to a specific user.
    /// </summary>
    System.Threading.Tasks.Task<IEnumerable<Role>> GetUserRolesAsync(Guid userId);
}