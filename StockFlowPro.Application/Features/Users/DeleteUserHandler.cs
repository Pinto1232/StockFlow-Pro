using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public DeleteUserHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.Id} not found");
        }

        await _userRepository.DeleteAsync(user, cancellationToken);
        return true;
    }
}
