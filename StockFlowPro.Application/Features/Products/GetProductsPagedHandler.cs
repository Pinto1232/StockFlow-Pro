using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Products;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Shared.Models;

namespace StockFlowPro.Application.Features.Products;

public class GetProductsPagedHandler : IRequestHandler<GetProductsPagedQuery, PaginatedResponse<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetProductsPagedHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResponse<ProductDto>> Handle(GetProductsPagedQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Executing paginated database query - Page: {request.PageNumber}, Size: {request.PageSize}, Search: '{request.Search}', IsActive: {request.IsActive}, IsLowStock: {request.IsLowStock}, InStockOnly: {request.InStockOnly}");

        // Get all products first (we'll implement repository-level pagination later if needed)
        var allProducts = await _productRepository.GetAllAsync(cancellationToken);

        // Apply filters
        var filteredProducts = allProducts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            filteredProducts = filteredProducts.Where(p => 
                p.Name.ToLower().Contains(searchTerm));
        }

        if (request.IsActive.HasValue)
        {
            filteredProducts = filteredProducts.Where(p => p.IsActive == request.IsActive.Value);
        }

        if (request.IsLowStock.HasValue && request.IsLowStock.Value)
        {
            filteredProducts = filteredProducts.Where(p => 
                p.NumberInStock <= request.LowStockThreshold && p.NumberInStock > 0);
        }

        if (request.InStockOnly.HasValue && request.InStockOnly.Value)
        {
            filteredProducts = filteredProducts.Where(p => p.NumberInStock > 0);
        }

        // Get total count after filtering
        var totalCount = filteredProducts.Count();

        // Apply pagination
        var paginatedProducts = filteredProducts
            .OrderBy(p => p.Name) // Default ordering
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Paginated query completed - Retrieved {paginatedProducts.Count} of {totalCount} products from database");

        // Map to DTOs
        var productDtos = _mapper.Map<List<ProductDto>>(paginatedProducts);

        // Create paginated response
        return new PaginatedResponse<ProductDto>(
            productDtos,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}