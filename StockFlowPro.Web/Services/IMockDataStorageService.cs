using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IMockDataStorageService
{
    Task<List<UserDto>> GetUsersAsync();
    Task SaveUsersAsync(List<UserDto> users);
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<UserDto> AddUserAsync(UserDto user);
    Task<UserDto?> UpdateUserAsync(Guid id, UserDto updatedUser);
    Task<bool> DeleteUserAsync(Guid id);
    Task InitializeDefaultDataAsync();
}
