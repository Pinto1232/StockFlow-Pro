using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Users;

public class SearchUsersHandler : IRequestHandler<SearchUsersQuery, IEnumerable<UserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public SearchUsersHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var users = await _userRepository.SearchUsersAsync(request.SearchTerm, cancellationToken);
        
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }
}