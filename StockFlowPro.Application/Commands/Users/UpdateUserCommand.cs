using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Users;

public class UpdateUserCommand : IRequest<UserDto>
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}