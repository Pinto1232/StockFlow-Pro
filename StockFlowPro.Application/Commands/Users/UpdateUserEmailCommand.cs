using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Users;

public class UpdateUserEmailCommand : IRequest<UserDto>
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
}