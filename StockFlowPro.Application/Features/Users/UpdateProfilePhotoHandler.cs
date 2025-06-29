using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class UpdateProfilePhotoHandler : IRequestHandler<UpdateProfilePhotoCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public UpdateProfilePhotoHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(UpdateProfilePhotoCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} not found");
        }

        user.UpdateProfilePhoto(request.ProfilePhotoUrl);

        await _userRepository.UpdateAsync(user);
        return true;
    }
}