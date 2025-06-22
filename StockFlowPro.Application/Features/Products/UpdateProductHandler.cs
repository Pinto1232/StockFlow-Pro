using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Products;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public UpdateProductHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {request.Id} not found.");
        }

        // Check if product name already exists (excluding current product)
        if (await _productRepository.ProductNameExistsAsync(request.Name, request.Id, cancellationToken))
        {
            throw new InvalidOperationException($"A product with the name '{request.Name}' already exists.");
        }

        product.UpdateName(request.Name);
        product.UpdateCostPerItem(request.CostPerItem);
        product.UpdateStock(request.NumberInStock);
        
        await _productRepository.UpdateAsync(product, cancellationToken);
        
        return _mapper.Map<ProductDto>(product);
    }
}