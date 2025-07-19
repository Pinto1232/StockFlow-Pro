using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Products;

public class UpdateProductCommand : IRequest<ProductDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal CostPerItem { get; set; }
    public int NumberInStock { get; set; }
    public string? ImageUrl { get; set; }
}