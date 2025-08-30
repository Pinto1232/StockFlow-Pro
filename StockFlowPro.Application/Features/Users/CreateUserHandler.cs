using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public CreateUserHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            throw new ArgumentException("First name is required.", nameof(request));
        }
        
        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            throw new ArgumentException("Last name is required.", nameof(request));
        }
        
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.", nameof(request));
        }
        
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            throw new ArgumentException("Phone number is required.", nameof(request));
        }

        var user = new User(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.DateOfBirth,
            request.Role,
            request.PasswordHash
        );

        await _userRepository.AddAsync(user, cancellationToken);

        return _mapper.Map<UserDto>(user);
    }
}
