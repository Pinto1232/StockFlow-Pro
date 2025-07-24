using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Commands.Users;

public class CreateUserCommand : IRequest<UserDto>
{
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public int RoleId { get; set; }
    public string Password { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
}
