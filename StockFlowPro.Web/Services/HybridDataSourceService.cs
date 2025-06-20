using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;

namespace StockFlowPro.Web.Services;

public class HybridDataSourceService : IDataSourceService
{
    private readonly IMediator _mediator;
    private readonly IMockDataStorageService _mockDataService;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HybridDataSourceService> _logger;

    public HybridDataSourceService(
        IMediator mediator,
        IMockDataStorageService mockDataService,
        IMapper mapper,
        IConfiguration configuration,
        ILogger<HybridDataSourceService> logger)
    {
        _mediator = mediator;
        _mockDataService = mockDataService;
        _mapper = mapper;
        _configuration = configuration;
        _logger = logger;
    }

    private bool UseMockData => _configuration.GetValue<bool>("DataSource:UseMockData", false);

    public string GetCurrentDataSource() => UseMockData ? "Mock Data" : "Database";

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync(bool activeOnly = false)
    {
        _logger.LogInformation("Getting all users from {DataSource}", GetCurrentDataSource());
        
        if (UseMockData)
        {
            var users = await _mockDataService.GetUsersAsync();
            return activeOnly ? users.Where(u => u.IsActive) : users;
        }

        var query = new GetAllUsersQuery { ActiveOnly = activeOnly };
        return await _mediator.Send(query);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        _logger.LogInformation("Getting user {UserId} from {DataSource}", id, GetCurrentDataSource());
        
        if (UseMockData)
        {
            return await _mockDataService.GetUserByIdAsync(id);
        }

        var query = new GetUserByIdQuery { Id = id };
        return await _mediator.Send(query);
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        _logger.LogInformation("Getting user by email {Email} from {DataSource}", email, GetCurrentDataSource());
        
        if (UseMockData)
        {
            var users = await _mockDataService.GetUsersAsync();
            return users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        }

        var query = new GetUserByEmailQuery { Email = email };
        return await _mediator.Send(query);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        _logger.LogInformation("Creating user in {DataSource}", GetCurrentDataSource());
        
        if (UseMockData)
        {
            var userDto = new UserDto
            {
                Id = Guid.NewGuid(),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.PhoneNumber,
                DateOfBirth = createUserDto.DateOfBirth,
                Role = createUserDto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            return await _mockDataService.AddUserAsync(userDto);
        }

        var command = _mapper.Map<CreateUserCommand>(createUserDto);
        return await _mediator.Send(command);
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
    {
        _logger.LogInformation("Updating user {UserId} in {DataSource}", id, GetCurrentDataSource());
        
        if (UseMockData)
        {
            var existingUser = await _mockDataService.GetUserByIdAsync(id);
            if (existingUser == null) return null;

            existingUser.FirstName = updateUserDto.FirstName;
            existingUser.LastName = updateUserDto.LastName;
            existingUser.PhoneNumber = updateUserDto.PhoneNumber;
            existingUser.DateOfBirth = updateUserDto.DateOfBirth;
            existingUser.UpdatedAt = DateTime.UtcNow;

            return await _mockDataService.UpdateUserAsync(id, existingUser);
        }

        try
        {
            var command = _mapper.Map<UpdateUserCommand>(updateUserDto);
            command.Id = id;
            return await _mediator.Send(command);
        }
        catch (KeyNotFoundException)
        {
            return null;
        }
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        _logger.LogInformation("Deleting user {UserId} from {DataSource}", id, GetCurrentDataSource());
        
        if (UseMockData)
        {
            return await _mockDataService.DeleteUserAsync(id);
        }

        var command = new DeleteUserCommand { Id = id };
        return await _mediator.Send(command);
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm)
    {
        _logger.LogInformation("Searching users with term '{SearchTerm}' in {DataSource}", searchTerm, GetCurrentDataSource());
        
        if (UseMockData)
        {
            var users = await _mockDataService.GetUsersAsync();
            if (string.IsNullOrWhiteSpace(searchTerm))
                return users;

            var lowerSearchTerm = searchTerm.ToLower();
            return users.Where(u => 
                u.FirstName.ToLower().Contains(lowerSearchTerm) ||
                u.LastName.ToLower().Contains(lowerSearchTerm) ||
                u.Email.ToLower().Contains(lowerSearchTerm));
        }

        var query = new SearchUsersQuery { SearchTerm = searchTerm ?? string.Empty };
        return await _mediator.Send(query);
    }
}