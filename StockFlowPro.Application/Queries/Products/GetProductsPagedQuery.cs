using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Shared.Models;

namespace StockFlowPro.Application.Queries.Products;

public class GetProductsPagedQuery : IRequest<PaginatedResponse<ProductDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsLowStock { get; set; }
    public bool? InStockOnly { get; set; }
    public int LowStockThreshold { get; set; } = 10;
}