using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Users;

public class SearchUsersQuery : IRequest<IEnumerable<UserDto>>
{
    public string SearchTerm { get; set; } = string.Empty;
}