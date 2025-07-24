using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Commands.Users;

public class UpdateUserCommand : IRequest<UserDto>
{
    public Guid Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public UserRole? Role { get; set; }
    public int? RoleId { get; set; }
    public bool? IsActive { get; set; }
}
