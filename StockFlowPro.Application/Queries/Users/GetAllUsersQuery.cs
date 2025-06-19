using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Users;

/// <summary>
/// Query for retrieving all users from the system.
/// </summary>
public class GetAllUsersQuery : IRequest<IEnumerable<UserDto>>
{
    /// <summary>
    /// Gets or sets a value indicating whether to return only active users.
    /// If false, returns all users regardless of their active status.
    /// </summary>
    public bool ActiveOnly { get; set; } = false;
}
