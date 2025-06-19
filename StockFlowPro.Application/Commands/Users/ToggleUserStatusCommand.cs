using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Users;

public class ToggleUserStatusCommand : IRequest<UserDto>
{
    public Guid Id { get; set; }
    public bool IsActive { get; set; }
}
