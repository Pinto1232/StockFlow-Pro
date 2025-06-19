using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class ToggleUserStatusHandler : IRequestHandler<ToggleUserStatusCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public ToggleUserStatusHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.Id} not found");
        }

        if (request.IsActive)
        {
            user.Activate();
        }
        else
        {
            user.Deactivate();
        }

        await _userRepository.UpdateAsync(user, cancellationToken);

        return _mapper.Map<UserDto>(user);
    }
}