using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Queries.Users;

public class GetUsersQuery : IRequest<PaginatedResponseDto<UserDto>>
{
    public string? Search { get; set; }
    public UserRole? Role { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "FirstName";
    public string SortOrder { get; set; } = "asc";
}