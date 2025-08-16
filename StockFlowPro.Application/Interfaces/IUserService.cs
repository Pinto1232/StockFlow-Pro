using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service interface for user operations
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Gets a user by their ID
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>User DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<UserDto?> GetByIdAsync(Guid userId);

    /// <summary>
    /// Gets a user by their email address
    /// </summary>
    /// <param name="email">The email address</param>
    /// <returns>User DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<UserDto?> GetByEmailAsync(string email);

    /// <summary>
    /// Gets all users
    /// </summary>
    /// <returns>Collection of user DTOs</returns>
        System.Threading.Tasks.Task<IEnumerable<UserDto>> GetAllAsync();

    /// <summary>
    /// Searches for users based on criteria
    /// </summary>
    /// <param name="searchTerm">Search term</param>
    /// <param name="role">Optional role filter</param>
    /// <param name="isActive">Optional active status filter</param>
    /// <returns>Collection of matching user DTOs</returns>
        System.Threading.Tasks.Task<IEnumerable<UserDto>> SearchAsync(string searchTerm, UserRole? role = null, bool? isActive = null);

    /// <summary>
    /// Creates a new user
    /// </summary>
    /// <param name="createUserDto">User creation data</param>
    /// <returns>Created user DTO</returns>
        System.Threading.Tasks.Task<UserDto> CreateAsync(CreateUserDto createUserDto);

    /// <summary>
    /// Updates an existing user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="updateUserDto">User update data</param>
    /// <returns>Updated user DTO</returns>
        System.Threading.Tasks.Task<UserDto> UpdateAsync(Guid userId, UpdateUserDto updateUserDto);

    /// <summary>
    /// Updates a user's email
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="email">New email address</param>
    /// <returns>Updated user DTO</returns>
        System.Threading.Tasks.Task<UserDto> UpdateEmailAsync(Guid userId, string email);

    /// <summary>
    /// Toggles user active status
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Updated user DTO</returns>
        System.Threading.Tasks.Task<UserDto> ToggleStatusAsync(Guid userId);

    /// <summary>
    /// Checks if a user exists
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if user exists, false otherwise</returns>
        System.Threading.Tasks.Task<bool> ExistsAsync(Guid userId);
}