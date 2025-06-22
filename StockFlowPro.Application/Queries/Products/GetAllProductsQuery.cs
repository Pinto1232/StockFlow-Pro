using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Products;

public class GetAllProductsQuery : IRequest<IEnumerable<ProductDto>>
{
    public bool ActiveOnly { get; set; } = false;
    public bool InStockOnly { get; set; } = false;
    public bool LowStockOnly { get; set; } = false;
    public int LowStockThreshold { get; set; } = 10;
}