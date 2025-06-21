using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IPersistentMockDataService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto?> UpdateUserAsync(Guid id, CreateUserDto updateUserDto);
    Task<bool> DeleteUserAsync(Guid id);
    Task InitializeDefaultDataAsync();
}
