using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IDualDataService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync(bool activeOnly = false);
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto);
    Task<bool> DeleteUserAsync(Guid id);
    Task<bool> UpdateUserPasswordAsync(string email, string newPasswordHash);
    Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm);
    Task SyncDataSourcesAsync();
    Task<DataSourceSyncStatus> GetSyncStatusAsync();
}

public class DataSourceSyncStatus
{
    public int DatabaseUserCount { get; set; }
    public int MockDataUserCount { get; set; }
    public bool InSync => DatabaseUserCount == MockDataUserCount;
    public DateTime LastSyncTime { get; set; }
    public List<string> SyncIssues { get; set; } = new();
}