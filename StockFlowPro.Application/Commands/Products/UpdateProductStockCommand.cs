using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Products;

public class UpdateProductStockCommand : IRequest<ProductDto>
{
    public Guid Id { get; set; }
    public int NumberInStock { get; set; }
}