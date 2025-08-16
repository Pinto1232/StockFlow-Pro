using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Defines the contract for user-specific repository operations.
/// </summary>
public interface IUserRepository : IRepository<User>
{
    /// <summary>
    /// Retrieves a user by their email address.
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>The user if found; otherwise, null.</returns>
    System.Threading.Tasks.Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Retrieves all active users from the repository.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A collection of active users.</returns>
    System.Threading.Tasks.Task<IEnumerable<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Checks if an email address already exists in the system.
    /// </summary>
    /// <param name="email">The email address to check.</param>
    /// <param name="excludeUserId">Optional user ID to exclude from the check (useful for updates).</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>True if the email exists; otherwise, false.</returns>
    System.Threading.Tasks.Task<bool> EmailExistsAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Searches for users based on a search term matching name or email.
    /// </summary>
    /// <param name="searchTerm">The search term to filter users.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A collection of users matching the search criteria.</returns>
    System.Threading.Tasks.Task<IEnumerable<User>> SearchUsersAsync(string searchTerm, CancellationToken cancellationToken = default);
}
