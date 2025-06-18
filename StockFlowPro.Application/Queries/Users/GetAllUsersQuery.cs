using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Users;

public class GetAllUsersQuery : IRequest<IEnumerable<UserDto>>
{
    public bool ActiveOnly { get; set; } = false;
}