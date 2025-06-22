using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Products;

public class UpdateProductStockHandler : IRequestHandler<UpdateProductStockCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public UpdateProductStockHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(UpdateProductStockCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {request.Id} not found.");
        }

        product.UpdateStock(request.NumberInStock);
        
        await _productRepository.UpdateAsync(product, cancellationToken);
        
        return _mapper.Map<ProductDto>(product);
    }
}