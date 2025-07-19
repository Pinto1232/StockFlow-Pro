using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Products;

public class UpdateProductImageCommand : IRequest<ProductDto>
{
    public Guid Id { get; set; }
    public string? ImageUrl { get; set; }
}