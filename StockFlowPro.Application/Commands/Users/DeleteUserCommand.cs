using MediatR;

namespace StockFlowPro.Application.Commands.Users;

public class DeleteUserCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}
