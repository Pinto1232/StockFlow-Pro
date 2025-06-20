using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IDataSourceService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync(bool activeOnly = false);
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto);
    Task<bool> DeleteUserAsync(Guid id);
    Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm);
    string GetCurrentDataSource();
}