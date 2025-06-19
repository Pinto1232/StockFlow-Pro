using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetAllUsersHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var users = request.ActiveOnly 
            ? await _userRepository.GetActiveUsersAsync(cancellationToken)
            : await _userRepository.GetAllAsync(cancellationToken);

        return _mapper.Map<IEnumerable<UserDto>>(users);
    }
}
