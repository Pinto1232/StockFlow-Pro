using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service implementation for user operations using MediatR
/// </summary>
public class UserService : IUserService
{
    private readonly IMediator _mediator;

    public UserService(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<UserDto?> GetByIdAsync(Guid userId)
    {
        return await _mediator.Send(new GetUserByIdQuery { Id = userId });
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        return await _mediator.Send(new GetUserByEmailQuery { Email = email });
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        return await _mediator.Send(new GetAllUsersQuery());
    }

    public async Task<IEnumerable<UserDto>> SearchAsync(string searchTerm, UserRole? role = null, bool? isActive = null)
    {
        return await _mediator.Send(new SearchUsersQuery { SearchTerm = searchTerm });
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        return await _mediator.Send(new CreateUserCommand
        {
            FirstName = createUserDto.FirstName,
            LastName = createUserDto.LastName,
            Email = createUserDto.Email,
            PhoneNumber = createUserDto.PhoneNumber,
            DateOfBirth = createUserDto.DateOfBirth,
            Role = createUserDto.Role,
            PasswordHash = createUserDto.PasswordHash
        });
    }

    public async Task<UserDto> UpdateAsync(Guid userId, UpdateUserDto updateUserDto)
    {
        return await _mediator.Send(new UpdateUserCommand
        {
            Id = userId,
            FirstName = updateUserDto.FirstName,
            LastName = updateUserDto.LastName,
            PhoneNumber = updateUserDto.PhoneNumber,
            DateOfBirth = updateUserDto.DateOfBirth,
            Role = updateUserDto.Role
        });
    }

    public async Task<UserDto> UpdateEmailAsync(Guid userId, string email)
    {
        return await _mediator.Send(new UpdateUserEmailCommand
        {
            Id = userId,
            Email = email
        });
    }

    public async Task<UserDto> ToggleStatusAsync(Guid userId)
    {
        // First get the current user to determine their current status
        var currentUser = await GetByIdAsync(userId);
        if (currentUser == null)
        {
            throw new ArgumentException("User not found", nameof(userId));
        }

        return await _mediator.Send(new ToggleUserStatusCommand
        {
            Id = userId,
            IsActive = !currentUser.IsActive
        });
    }

    public async Task<bool> ExistsAsync(Guid userId)
    {
        var user = await GetByIdAsync(userId);
        return user != null;
    }
}