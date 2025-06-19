using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Defines the contract for persistent mock data operations used for testing and development.
/// </summary>
public interface IPersistentMockDataService
{
    /// <summary>
    /// Retrieves all users from the mock data store.
    /// </summary>
    /// <returns>A collection of user DTOs.</returns>
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    
    /// <summary>
    /// Retrieves a specific user by their unique identifier from the mock data store.
    /// </summary>
    /// <param name="id">The unique identifier of the user.</param>
    /// <returns>The user DTO if found; otherwise, null.</returns>
    Task<UserDto?> GetUserByIdAsync(Guid id);
    
    /// <summary>
    /// Creates a new user in the mock data store.
    /// </summary>
    /// <param name="createUserDto">The user data for creation.</param>
    /// <returns>The created user DTO.</returns>
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    
    /// <summary>
    /// Updates an existing user in the mock data store.
    /// </summary>
    /// <param name="id">The unique identifier of the user to update.</param>
    /// <param name="updateUserDto">The updated user data.</param>
    /// <returns>The updated user DTO if found; otherwise, null.</returns>
    Task<UserDto?> UpdateUserAsync(Guid id, CreateUserDto updateUserDto);
    
    /// <summary>
    /// Deletes a user from the mock data store.
    /// </summary>
    /// <param name="id">The unique identifier of the user to delete.</param>
    /// <returns>True if the user was deleted; otherwise, false.</returns>
    Task<bool> DeleteUserAsync(Guid id);
    
    /// <summary>
    /// Initializes the mock data store with default test data.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task InitializeDefaultDataAsync();
}
