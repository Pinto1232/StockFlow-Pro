using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Products;

public class CreateProductCommand : IRequest<ProductDto>
{
    public string Name { get; set; } = string.Empty;
    public decimal CostPerItem { get; set; }
    public int NumberInStock { get; set; }
    public string? ImageUrl { get; set; }
}