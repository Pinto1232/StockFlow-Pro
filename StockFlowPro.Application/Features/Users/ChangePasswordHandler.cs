using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;

    public ChangePasswordHandler(IUserRepository userRepository, IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} not found");
        }

        // Verify current password
        if (!await _passwordService.VerifyPasswordAsync(request.CurrentPassword, user.PasswordHash ?? string.Empty))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Hash new password
        var newPasswordHash = await _passwordService.HashPasswordAsync(request.NewPassword);
        
        // Update password
        user.UpdatePasswordHash(newPasswordHash);
        await _userRepository.UpdateAsync(user, cancellationToken);

        return true;
    }
}