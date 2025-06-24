using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class EditProfileHandler : IRequestHandler<EditProfileCommand, ProfileDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public EditProfileHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<ProfileDto> Handle(EditProfileCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} not found");
        }

        user.UpdatePersonalInfo(
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.DateOfBirth
        );

        await _userRepository.UpdateAsync(user, cancellationToken);

        return _mapper.Map<ProfileDto>(user);
    }
}