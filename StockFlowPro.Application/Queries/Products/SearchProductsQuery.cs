using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.Products;

public class SearchProductsQuery : IRequest<IEnumerable<ProductDto>>
{
    public string SearchTerm { get; set; } = string.Empty;
}