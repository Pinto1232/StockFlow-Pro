using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Products;
using StockFlowPro.Shared.Extensions;
using StockFlowPro.Shared.Models;
using StockFlowPro.Shared.Constants;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;

    public ProductsController(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<ProductDto>>> GetProductsPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isLowStock = null,
        [FromQuery] bool? inStockOnly = null,
        [FromQuery] int lowStockThreshold = 10)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Getting paginated products from database - Page: {pageNumber}, Size: {pageSize}, Search: '{search}', IsActive: {isActive}, IsLowStock: {isLowStock}, InStockOnly: {inStockOnly}");
            
            var query = new GetProductsPagedQuery 
            { 
                PageNumber = pageNumber,
                PageSize = pageSize,
                Search = search,
                IsActive = isActive,
                IsLowStock = isLowStock,
                InStockOnly = inStockOnly,
                LowStockThreshold = lowStockThreshold
            };
            
            var result = await _mediator.Send(query);
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Successfully retrieved paginated products - Page {result.PageNumber} of {result.TotalPages}, Total: {result.TotalCount}");
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error retrieving paginated products: {ex.Message}");
            return BadRequest(new { message = "Failed to retrieve products", error = ex.Message });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EnhancedProductDto>>>> GetAllProducts(
        [FromQuery] bool activeOnly = false,
        [FromQuery] bool inStockOnly = false,
        [FromQuery] bool lowStockOnly = false,
        [FromQuery] int lowStockThreshold = 10)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Getting all products from database - ActiveOnly: {activeOnly}, InStockOnly: {inStockOnly}, LowStockOnly: {lowStockOnly}, LowStockThreshold: {lowStockThreshold}");
            
            var query = new GetAllProductsQuery 
            { 
                ActiveOnly = activeOnly,
                InStockOnly = inStockOnly,
                LowStockOnly = lowStockOnly,
                LowStockThreshold = lowStockThreshold
            };
            var products = await _mediator.Send(query);
            
            // 🎯 ENHANCEMENT: Transform products with shared utilities
            var enhancedProducts = products.Select(p => new EnhancedProductDto
            {
                // Original properties
                Id = p.Id,
                Name = p.Name,
                CostPerItem = p.CostPerItem,
                NumberInStock = p.NumberInStock,
                TotalValue = p.TotalValue,
                IsActive = p.IsActive,
                IsInStock = p.IsInStock,
                IsLowStock = p.IsLowStock,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                
                // 🚀 ENHANCED: Formatted properties using shared utilities
                FormattedName = p.Name.ToTitleCase(),
                FormattedPrice = p.CostPerItem.ToCurrency(),
                FormattedTotalValue = p.TotalValue.ToCurrency(),
                FormattedTotalValueShort = p.TotalValue.ToShortFormat(),
                StockDisplay = $"{p.NumberInStock} units",
                CreatedDisplay = p.CreatedAt.ToDisplayFormat(),
                CreatedFriendly = p.CreatedAt.ToFriendlyString(),
                StockStatus = GetStockStatusText(p.IsInStock, p.IsLowStock),
                StockStatusBadge = GetStockStatusBadge(p.IsInStock, p.IsLowStock),
                ActiveStatusBadge = p.IsActive ? "Active" : "Inactive",
                PriceRange = GetPriceRange(p.CostPerItem),
                StockLevel = GetStockLevel(p.NumberInStock),
                ImageDisplay = GetImageDisplay(p.ImageUrl),
                HasImage = !string.IsNullOrEmpty(p.ImageUrl)
            }).ToList();
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Retrieved and enhanced {enhancedProducts.Count} products from database");
            
            return Ok(ApiResponse<IEnumerable<EnhancedProductDto>>.SuccessResult(
                enhancedProducts, 
                $"Successfully retrieved {enhancedProducts.Count} products with enhanced formatting"));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error retrieving products: {ex.Message}");
            return BadRequest(ApiResponse<IEnumerable<EnhancedProductDto>>.ErrorResult(
                "Failed to retrieve products", ex.Message));
        }
    }

    [HttpGet("dashboard-stats")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ApiResponse<EnhancedDashboardStats>>> GetDashboardStats()
    {
        try
        {
            Console.WriteLine("[PRODUCT MANAGEMENT] Getting enhanced dashboard statistics from database");
            
            var allProductsQuery = new GetAllProductsQuery { ActiveOnly = true };
            var lowStockQuery = new GetAllProductsQuery { ActiveOnly = true, LowStockOnly = true };

            var allProducts = await _mediator.Send(allProductsQuery);
            var lowStockProducts = await _mediator.Send(lowStockQuery);
            var outOfStockProducts = allProducts.Where(p => !p.IsInStock);

            var totalValue = allProducts.Sum(p => p.TotalValue);
            var totalProducts = allProducts.Count();
            var lowStockCount = lowStockProducts.Count();
            var outOfStockCount = outOfStockProducts.Count();

            // 🚀 ENHANCED: Dashboard stats with shared utilities formatting
            var enhancedStats = new EnhancedDashboardStats
            {
                // Raw values
                TotalProducts = totalProducts,
                TotalValue = totalValue,
                LowStockCount = lowStockCount,
                OutOfStockCount = outOfStockCount,
                InStockCount = allProducts.Count(p => p.IsInStock),
                
                // 🎯 ENHANCED: Formatted values using shared utilities
                TotalProductsFormatted = totalProducts.ToString("N0"),
                TotalValueFormatted = totalValue.ToCurrency(),
                TotalValueShort = totalValue.ToShortFormat(),
                LowStockPercentage = ((decimal)lowStockCount).PercentageOf((decimal)totalProducts).ToString("F1") + "%",
                OutOfStockPercentage = ((decimal)outOfStockCount).PercentageOf((decimal)totalProducts).ToString("F1") + "%",
                InStockPercentage = ((decimal)allProducts.Count(p => p.IsInStock)).PercentageOf((decimal)totalProducts).ToString("F1") + "%",
                LastUpdated = DateTime.Now.ToFriendlyString(),
                LastUpdatedFull = DateTime.Now.ToDisplayFormat(),
                
                // Additional insights
                AverageProductValue = totalProducts > 0 ? (totalValue / totalProducts).ToCurrency() : "R0.00",
                HealthScore = CalculateInventoryHealthScore(totalProducts, lowStockCount, outOfStockCount),
                StatusSummary = GetInventoryStatusSummary(totalProducts, lowStockCount, outOfStockCount)
            };

            Console.WriteLine($"[PRODUCT MANAGEMENT] Enhanced dashboard stats retrieved - Total: {enhancedStats.TotalProductsFormatted}, Value: {enhancedStats.TotalValueFormatted}, Health: {enhancedStats.HealthScore}%");
            
            return Ok(ApiResponse<EnhancedDashboardStats>.SuccessResult(
                enhancedStats, 
                "Enhanced dashboard statistics retrieved successfully"));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error getting dashboard stats: {ex.Message}");
            return BadRequest(ApiResponse<EnhancedDashboardStats>.ErrorResult(
                "Failed to get enhanced dashboard stats", ex.Message));
        }
    }

    // 🎯 HELPER METHODS using shared utilities
    private static string GetStockStatusText(bool isInStock, bool isLowStock)
    {
        if (!isInStock) {return "Out of Stock";}
        if (isLowStock) {return "Low Stock";}
        return "In Stock";
    }

    private static string GetStockStatusBadge(bool isInStock, bool isLowStock)
    {
        if (!isInStock) {return "danger";}
        if (isLowStock) {return "warning";}
        return "success";
    }

    private static string GetPriceRange(decimal price)
    {
        return price switch
        {
            < 10 => "Budget",
            < 50 => "Standard",
            < 200 => "Premium",
            _ => "Luxury"
        };
    }

    private static string GetStockLevel(int stock)
    {
        return stock switch
        {
            0 => "Empty",
            <= 5 => "Critical",
            <= 20 => "Low",
            <= 100 => "Good",
            _ => "Excellent"
        };
    }

    private static int CalculateInventoryHealthScore(int total, int lowStock, int outOfStock)
    {
        if (total == 0) {return 0;}
        
        var healthyStock = total - lowStock - outOfStock;
        return (int)((decimal)healthyStock / total * 100);
    }

    private static string GetInventoryStatusSummary(int total, int lowStock, int outOfStock)
    {
        var healthScore = CalculateInventoryHealthScore(total, lowStock, outOfStock);
        
        return healthScore switch
        {
            >= 90 => "Excellent - Inventory levels are optimal",
            >= 75 => "Good - Minor stock attention needed",
            >= 50 => "Fair - Several items need restocking",
            >= 25 => "Poor - Immediate restocking required",
            _ => "Critical - Urgent inventory management needed"
        };
    }

    private static string GetImageDisplay(string? imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
        {
            return "/images/default-product.svg";
        }
        return imageUrl;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProductById(Guid id)
    {
        Console.WriteLine($"[PRODUCT MANAGEMENT] Getting product by ID from database: {id}");
        
        var query = new GetProductByIdQuery { Id = id };
        var product = await _mediator.Send(query);
        
        if (product == null)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Product with ID {id} not found in database");
            return NotFound($"Product with ID {id} not found");
        }

        Console.WriteLine($"[PRODUCT MANAGEMENT] Retrieved product from database: {product.Name} (ID: {product.Id})");
        return Ok(product);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string searchTerm)
    {
        Console.WriteLine($"[PRODUCT MANAGEMENT] Searching products in database with term: '{searchTerm ?? string.Empty}'");
        
        var query = new SearchProductsQuery { SearchTerm = searchTerm ?? string.Empty };
        var products = await _mediator.Send(query);
        
        Console.WriteLine($"[PRODUCT MANAGEMENT] Found {products.Count()} products matching search term '{searchTerm ?? string.Empty}'");
        return Ok(products);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EnhancedProductDto>>>> GetLowStockProducts(
        [FromQuery] int threshold = 10)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Getting low stock products from database - Threshold: {threshold}");
            
            var query = new GetAllProductsQuery 
            { 
                ActiveOnly = true,
                LowStockOnly = true,
                LowStockThreshold = threshold
            };
            var products = await _mediator.Send(query);
            
            // Transform products with enhanced formatting
            var lowStockProducts = products.Select(p => new EnhancedProductDto
            {
                // Original properties
                Id = p.Id,
                Name = p.Name,
                CostPerItem = p.CostPerItem,
                NumberInStock = p.NumberInStock,
                TotalValue = p.TotalValue,
                IsActive = p.IsActive,
                IsInStock = p.IsInStock,
                IsLowStock = p.IsLowStock,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                
                // Enhanced formatted properties
                FormattedName = p.Name.ToTitleCase(),
                FormattedPrice = p.CostPerItem.ToCurrency(),
                FormattedTotalValue = p.TotalValue.ToCurrency(),
                FormattedTotalValueShort = p.TotalValue.ToShortFormat(),
                StockDisplay = $"{p.NumberInStock} units",
                CreatedDisplay = p.CreatedAt.ToDisplayFormat(),
                CreatedFriendly = p.CreatedAt.ToFriendlyString(),
                StockStatus = GetStockStatusText(p.IsInStock, p.IsLowStock),
                StockStatusBadge = GetStockStatusBadge(p.IsInStock, p.IsLowStock),
                ActiveStatusBadge = p.IsActive ? "Active" : "Inactive",
                PriceRange = GetPriceRange(p.CostPerItem),
                StockLevel = GetStockLevel(p.NumberInStock),
                ImageDisplay = GetImageDisplay(p.ImageUrl),
                HasImage = !string.IsNullOrEmpty(p.ImageUrl)
            }).ToList();
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Retrieved {lowStockProducts.Count} low stock products from database");
            
            return Ok(ApiResponse<IEnumerable<EnhancedProductDto>>.SuccessResult(
                lowStockProducts, 
                $"Successfully retrieved {lowStockProducts.Count} low stock products"));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error retrieving low stock products: {ex.Message}");
            return BadRequest(ApiResponse<IEnumerable<EnhancedProductDto>>.ErrorResult(
                "Failed to retrieve low stock products", ex.Message));
        }
    }

    [HttpGet("categories")]
    public Task<ActionResult<ApiResponse<IEnumerable<ProductCategoryDto>>>> GetCategories()
    {
        try
        {
            Console.WriteLine("[PRODUCT MANAGEMENT] Getting product categories from database");
            
            // For now, return a static list of categories
            // In a real application, this would come from a database
            var categories = new List<ProductCategoryDto>
            {
                new ProductCategoryDto { Id = 1, Name = "Electronics", Description = "Electronic devices and accessories" },
                new ProductCategoryDto { Id = 2, Name = "Clothing", Description = "Apparel and fashion items" },
                new ProductCategoryDto { Id = 3, Name = "Home & Garden", Description = "Home improvement and garden supplies" },
                new ProductCategoryDto { Id = 4, Name = "Sports & Outdoors", Description = "Sports equipment and outdoor gear" },
                new ProductCategoryDto { Id = 5, Name = "Books", Description = "Books and educational materials" },
                new ProductCategoryDto { Id = 6, Name = "Health & Beauty", Description = "Health and beauty products" },
                new ProductCategoryDto { Id = 7, Name = "Automotive", Description = "Car parts and automotive accessories" },
                new ProductCategoryDto { Id = 8, Name = "Food & Beverages", Description = "Food items and beverages" }
            };
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Retrieved {categories.Count} product categories");
            
            return Task.FromResult<ActionResult<ApiResponse<IEnumerable<ProductCategoryDto>>>>(
                Ok(ApiResponse<IEnumerable<ProductCategoryDto>>.SuccessResult(
                    categories, 
                    $"Successfully retrieved {categories.Count} product categories")));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error retrieving categories: {ex.Message}");
            return Task.FromResult<ActionResult<ApiResponse<IEnumerable<ProductCategoryDto>>>>(
                BadRequest(ApiResponse<IEnumerable<ProductCategoryDto>>.ErrorResult(
                    "Failed to retrieve categories", ex.Message)));
        }
    }

    [HttpGet("reports/low-stock")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EnhancedProductDto>>>> GetLowStockReport(
        [FromQuery] int threshold = 10)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Getting low stock report from database - Threshold: {threshold}");
            
            var query = new GetAllProductsQuery 
            { 
                ActiveOnly = true,
                LowStockOnly = true,
                LowStockThreshold = threshold
            };
            var products = await _mediator.Send(query);
            
            // Transform products with enhanced formatting
            var lowStockProducts = products.Select(p => new EnhancedProductDto
            {
                // Original properties
                Id = p.Id,
                Name = p.Name,
                CostPerItem = p.CostPerItem,
                NumberInStock = p.NumberInStock,
                TotalValue = p.TotalValue,
                IsActive = p.IsActive,
                IsInStock = p.IsInStock,
                IsLowStock = p.IsLowStock,
                ImageUrl = p.ImageUrl,
                CreatedAt = p.CreatedAt,
                
                // Enhanced formatted properties
                FormattedName = p.Name.ToTitleCase(),
                FormattedPrice = p.CostPerItem.ToCurrency(),
                FormattedTotalValue = p.TotalValue.ToCurrency(),
                FormattedTotalValueShort = p.TotalValue.ToShortFormat(),
                StockDisplay = $"{p.NumberInStock} units",
                CreatedDisplay = p.CreatedAt.ToDisplayFormat(),
                CreatedFriendly = p.CreatedAt.ToFriendlyString(),
                StockStatus = GetStockStatusText(p.IsInStock, p.IsLowStock),
                StockStatusBadge = GetStockStatusBadge(p.IsInStock, p.IsLowStock),
                ActiveStatusBadge = p.IsActive ? "Active" : "Inactive",
                PriceRange = GetPriceRange(p.CostPerItem),
                StockLevel = GetStockLevel(p.NumberInStock),
                ImageDisplay = GetImageDisplay(p.ImageUrl),
                HasImage = !string.IsNullOrEmpty(p.ImageUrl)
            }).ToList();
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Retrieved {lowStockProducts.Count} products for low stock report");
            
            return Ok(ApiResponse<IEnumerable<EnhancedProductDto>>.SuccessResult(
                lowStockProducts, 
                $"Successfully retrieved low stock report with {lowStockProducts.Count} products"));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error retrieving low stock report: {ex.Message}");
            return BadRequest(ApiResponse<IEnumerable<EnhancedProductDto>>.ErrorResult(
                "Failed to retrieve low stock report", ex.Message));
        }
    }

    [HttpGet("reports/inventory-value")]
    public async Task<ActionResult<ApiResponse<InventoryValueReportDto>>> GetInventoryValueReport()
    {
        try
        {
            Console.WriteLine("[PRODUCT MANAGEMENT] Getting inventory value report from database");
            
            var query = new GetAllProductsQuery { ActiveOnly = true };
            var products = await _mediator.Send(query);
            
            var totalValue = products.Sum(p => p.TotalValue);
            var totalProducts = products.Count();
            var totalQuantity = products.Sum(p => p.NumberInStock);
            
            var report = new InventoryValueReportDto
            {
                TotalValue = totalValue,
                TotalProducts = totalProducts,
                TotalQuantity = totalQuantity,
                FormattedTotalValue = totalValue.ToCurrency(),
                FormattedTotalValueShort = totalValue.ToShortFormat(),
                AverageValuePerProduct = totalProducts > 0 ? (totalValue / totalProducts).ToCurrency() : "R0.00",
                GeneratedAt = DateTime.Now,
                GeneratedAtFormatted = DateTime.Now.ToDisplayFormat(),
                Products = products.Select(p => new EnhancedProductDto
                {
                    // Original properties
                    Id = p.Id,
                    Name = p.Name,
                    CostPerItem = p.CostPerItem,
                    NumberInStock = p.NumberInStock,
                    TotalValue = p.TotalValue,
                    IsActive = p.IsActive,
                    IsInStock = p.IsInStock,
                    IsLowStock = p.IsLowStock,
                    ImageUrl = p.ImageUrl,
                    CreatedAt = p.CreatedAt,
                    
                    // Enhanced formatted properties
                    FormattedName = p.Name.ToTitleCase(),
                    FormattedPrice = p.CostPerItem.ToCurrency(),
                    FormattedTotalValue = p.TotalValue.ToCurrency(),
                    FormattedTotalValueShort = p.TotalValue.ToShortFormat(),
                    StockDisplay = $"{p.NumberInStock} units",
                    CreatedDisplay = p.CreatedAt.ToDisplayFormat(),
                    CreatedFriendly = p.CreatedAt.ToFriendlyString(),
                    StockStatus = GetStockStatusText(p.IsInStock, p.IsLowStock),
                    StockStatusBadge = GetStockStatusBadge(p.IsInStock, p.IsLowStock),
                    ActiveStatusBadge = p.IsActive ? "Active" : "Inactive",
                    PriceRange = GetPriceRange(p.CostPerItem),
                    StockLevel = GetStockLevel(p.NumberInStock),
                    ImageDisplay = GetImageDisplay(p.ImageUrl),
                    HasImage = !string.IsNullOrEmpty(p.ImageUrl)
                }).ToList()
            };
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Generated inventory value report - Total Value: {report.FormattedTotalValue}, Products: {report.TotalProducts}");
            
            return Ok(ApiResponse<InventoryValueReportDto>.SuccessResult(
                report, 
                "Successfully generated inventory value report"));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error generating inventory value report: {ex.Message}");
            return BadRequest(ApiResponse<InventoryValueReportDto>.ErrorResult(
                "Failed to generate inventory value report", ex.Message));
        }
    }

    [HttpPost]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Creating new product in database: {createProductDto.Name}");
            
            var command = _mapper.Map<CreateProductCommand>(createProductDto);
            var product = await _mediator.Send(command);
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Successfully created product in database: {product.Name} (ID: {product.Id})");
            
            return CreatedAtAction(
                nameof(GetProductById), 
                new { id = product.Id }, 
                product);
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Failed to create product in database: {ex.Message}");
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductDto updateProductDto)
    {
        try
        {
            var command = _mapper.Map<UpdateProductCommand>(updateProductDto);
            command.Id = id;
            
            var product = await _mediator.Send(command);
            return Ok(product);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Product with ID {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id:guid}/stock")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProductDto>> UpdateProductStock(Guid id, [FromBody] UpdateProductStockDto updateStockDto)
    {
        try
        {
            var command = _mapper.Map<UpdateProductStockCommand>(updateStockDto);
            command.Id = id;
            
            var product = await _mediator.Send(command);
            return Ok(product);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Product with ID {id} not found");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/adjust-stock")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProductDto>> AdjustProductStock(Guid id, [FromBody] AdjustProductStockDto adjustStockDto)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Adjusting stock for product {id} by {adjustStockDto.Adjustment}");
            
            // Get current product to calculate new stock
            var productQuery = new GetProductByIdQuery { Id = id };
            var currentProduct = await _mediator.Send(productQuery);
            
            if (currentProduct == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            // Calculate new stock level
            var newStock = currentProduct.NumberInStock + adjustStockDto.Adjustment;
            
            if (newStock < 0)
            {
                return BadRequest($"Cannot adjust stock by {adjustStockDto.Adjustment}. Current stock is {currentProduct.NumberInStock}. Adjustment would result in negative stock.");
            }

            // Update stock using existing command
            var updateCommand = new UpdateProductStockCommand
            {
                Id = id,
                NumberInStock = newStock
            };
            
            var updatedProduct = await _mediator.Send(updateCommand);
            
            Console.WriteLine($"[PRODUCT MANAGEMENT] Successfully adjusted stock for product {id} from {currentProduct.NumberInStock} to {updatedProduct.NumberInStock}");
            
            return Ok(updatedProduct);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Product with ID {id} not found");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error adjusting stock for product {id}: {ex.Message}");
            return BadRequest($"Failed to adjust stock: {ex.Message}");
        }
    }

    [HttpPost("bulk-adjust-stock")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ApiResponse<BulkStockAdjustmentResultDto>>> BulkAdjustStock([FromBody] BulkStockAdjustmentDto bulkAdjustmentDto)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Processing bulk stock adjustment for {bulkAdjustmentDto.Adjustments.Count} products");
            
            var results = new List<StockAdjustmentResultDto>();
            var errors = new List<string>();

            foreach (var adjustment in bulkAdjustmentDto.Adjustments)
            {
                try
                {
                    // Get current product
                    var productQuery = new GetProductByIdQuery { Id = adjustment.ProductId };
                    var currentProduct = await _mediator.Send(productQuery);
                    
                    if (currentProduct == null)
                    {
                        errors.Add($"Product with ID {adjustment.ProductId} not found");
                        continue;
                    }

                    // Calculate new stock level
                    var newStock = currentProduct.NumberInStock + adjustment.Adjustment;
                    
                    if (newStock < 0)
                    {
                        errors.Add($"Cannot adjust stock for {currentProduct.Name} by {adjustment.Adjustment}. Current stock is {currentProduct.NumberInStock}.");
                        continue;
                    }

                    // Update stock
                    var updateCommand = new UpdateProductStockCommand
                    {
                        Id = adjustment.ProductId,
                        NumberInStock = newStock
                    };
                    
                    var updatedProduct = await _mediator.Send(updateCommand);
                    
                    results.Add(new StockAdjustmentResultDto
                    {
                        ProductId = adjustment.ProductId,
                        ProductName = updatedProduct.Name,
                        PreviousStock = currentProduct.NumberInStock,
                        NewStock = updatedProduct.NumberInStock,
                        Adjustment = adjustment.Adjustment,
                        Success = true
                    });
                }
                catch (Exception ex)
                {
                    errors.Add($"Error adjusting stock for product {adjustment.ProductId}: {ex.Message}");
                }
            }

            var result = new BulkStockAdjustmentResultDto
            {
                TotalProcessed = bulkAdjustmentDto.Adjustments.Count,
                SuccessfulAdjustments = results.Count,
                FailedAdjustments = errors.Count,
                Results = results,
                Errors = errors
            };

            Console.WriteLine($"[PRODUCT MANAGEMENT] Bulk stock adjustment completed - Success: {result.SuccessfulAdjustments}, Failed: {result.FailedAdjustments}");
            
            return Ok(ApiResponse<BulkStockAdjustmentResultDto>.SuccessResult(
                result, 
                $"Bulk stock adjustment completed. {result.SuccessfulAdjustments} successful, {result.FailedAdjustments} failed."));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error processing bulk stock adjustment: {ex.Message}");
            return BadRequest(ApiResponse<BulkStockAdjustmentResultDto>.ErrorResult(
                "Failed to process bulk stock adjustment", ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteProduct(Guid id)
    {
        var command = new DeleteProductCommand { Id = id };
        var result = await _mediator.Send(command);
        
        if (!result)
        {
            return NotFound($"Product with ID {id} not found");
        }

        return NoContent();
    }

    [HttpPost("{id:guid}/upload-image")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> UploadProductImage(Guid id, IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "No image file provided" });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(image.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." });
            }

            // Validate file size (5MB max)
            const long maxFileSize = 5 * 1024 * 1024;
            if (image.Length > maxFileSize)
            {
                return BadRequest(new { message = "File size exceeds 5MB limit" });
            }

            // Check if product exists
            var productQuery = new GetProductByIdQuery { Id = id };
            var product = await _mediator.Send(productQuery);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            // Create uploads directory if it doesn't exist
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
            Directory.CreateDirectory(uploadsDir);

            // Generate unique filename
            var fileExtension = Path.GetExtension(image.FileName);
            var fileName = $"{id}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Update product with image URL
            var imageUrl = $"/uploads/products/{fileName}";
            var updateCommand = new UpdateProductImageCommand
            {
                Id = id,
                ImageUrl = imageUrl
            };

            await _mediator.Send(updateCommand);

            Console.WriteLine($"[PRODUCT MANAGEMENT] Image uploaded for product {id}: {imageUrl}");
            return Ok(new { imageUrl, message = "Product image uploaded successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error uploading image for product {id}: {ex.Message}");
            return BadRequest(new { message = $"Failed to upload image: {ex.Message}" });
        }
    }

    [HttpDelete("{id:guid}/remove-image")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> RemoveProductImage(Guid id)
    {
        try
        {
            // Check if product exists
            var productQuery = new GetProductByIdQuery { Id = id };
            var product = await _mediator.Send(productQuery);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            // Delete existing image file if it exists
            if (!string.IsNullOrEmpty(product.ImageUrl) &&
                product.ImageUrl != "/images/default-product.svg")
            {
                var fileName = Path.GetFileName(product.ImageUrl);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products", fileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // Update product to remove image URL
            var updateCommand = new UpdateProductImageCommand
            {
                Id = id,
                ImageUrl = null
            };

            await _mediator.Send(updateCommand);

            Console.WriteLine($"[PRODUCT MANAGEMENT] Image removed for product {id}");
            return Ok(new { message = "Product image removed successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error removing image for product {id}: {ex.Message}");
            return BadRequest(new { message = $"Failed to remove image: {ex.Message}" });
        }
    }

    [HttpGet("{id:guid}/download/{format}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> DownloadProduct(Guid id, string format)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Downloading product {id} as {format}");
            
            // Get the product
            var productQuery = new GetProductByIdQuery { Id = id };
            var product = await _mediator.Send(productQuery);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found");
            }

            // Generate the file based on format
            byte[] fileContent;
            string contentType;
            string fileName;

            switch (format.ToLower())
            {
                case "pdf":
                    fileContent = await GenerateProductPdf(product);
                    contentType = "application/pdf";
                    fileName = $"product_{product.Name}_{DateTime.Now:yyyyMMdd}.pdf";
                    break;
                case "excel":
                case "xlsx":
                    fileContent = await GenerateProductExcel(product);
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    fileName = $"product_{product.Name}_{DateTime.Now:yyyyMMdd}.xlsx";
                    break;
                case "csv":
                    fileContent = await GenerateProductCsv(product);
                    contentType = "text/csv";
                    fileName = $"product_{product.Name}_{DateTime.Now:yyyyMMdd}.csv";
                    break;
                default:
                    return BadRequest($"Unsupported format: {format}");
            }

            Console.WriteLine($"[PRODUCT MANAGEMENT] Generated {format} file for product {id}");
            return File(fileContent, contentType, fileName);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error downloading product {id} as {format}: {ex.Message}");
            return BadRequest(new { message = $"Failed to download product as {format}: {ex.Message}" });
        }
    }

    [HttpGet("download/bulk/{format}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> DownloadAllProducts(
        string format,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? stockStatus = null)
    {
        try
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Downloading all products as {format} with filters - Search: '{search}', IsActive: {isActive}, StockStatus: '{stockStatus}'");
            
            // Build query based on filters
            var query = new GetAllProductsQuery();
            
            if (isActive.HasValue)
            {
                query.ActiveOnly = isActive.Value;
            }

            // Apply stock status filter
            if (!string.IsNullOrEmpty(stockStatus))
            {
                switch (stockStatus.ToLower())
                {
                    case "instock":
                        query.InStockOnly = true;
                        break;
                    case "lowstock":
                        query.LowStockOnly = true;
                        break;
                    case "outofstock":
                        // This would need to be implemented in the query
                        break;
                }
            }

            var products = await _mediator.Send(query);

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(search))
            {
                products = products.Where(p => 
                    p.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    (p.Id.ToString().Contains(search, StringComparison.OrdinalIgnoreCase))
                ).ToList();
            }

            // Generate the file based on format
            byte[] fileContent;
            string contentType;
            string fileName;

            switch (format.ToLower())
            {
                case "pdf":
                    fileContent = await GenerateProductsPdf(products);
                    contentType = "application/pdf";
                    fileName = $"products_export_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                    break;
                case "excel":
                case "xlsx":
                    fileContent = await GenerateProductsExcel(products);
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    fileName = $"products_export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                    break;
                case "csv":
                    fileContent = await GenerateProductsCsv(products);
                    contentType = "text/csv";
                    fileName = $"products_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                    break;
                default:
                    return BadRequest($"Unsupported format: {format}");
            }

            Console.WriteLine($"[PRODUCT MANAGEMENT] Generated {format} file for {products.Count()} products");
            return File(fileContent, contentType, fileName);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT] Error downloading all products as {format}: {ex.Message}");
            return BadRequest(new { message = $"Failed to download all products as {format}: {ex.Message}" });
        }
    }

    // Helper methods for file generation
    private Task<byte[]> GenerateProductPdf(ProductDto product)
    {
        // Simple PDF generation - in a real app, you'd use a library like iTextSharp or PdfSharp
        var content = $@"
PRODUCT REPORT
==============

Name: {product.Name}
ID: {product.Id}
Cost per Item: {product.CostPerItem:C}
Number in Stock: {product.NumberInStock}
Total Value: {product.TotalValue:C}
Status: {(product.IsActive ? "Active" : "Inactive")}
Stock Status: {(product.IsInStock ? "In Stock" : "Out of Stock")}
Low Stock: {(product.IsLowStock ? "Yes" : "No")}
Created: {product.CreatedAt:yyyy-MM-dd HH:mm:ss}

Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}
";
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(content));
    }

    private Task<byte[]> GenerateProductsPdf(IEnumerable<ProductDto> products)
    {
        var content = $@"
PRODUCTS EXPORT REPORT
======================

Total Products: {products.Count()}
Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

PRODUCT LIST
============

";
        foreach (var product in products)
        {
            content += $@"
Name: {product.Name}
ID: {product.Id}
Cost: {product.CostPerItem:C}
Stock: {product.NumberInStock}
Value: {product.TotalValue:C}
Status: {(product.IsActive ? "Active" : "Inactive")}
---

";
        }

        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(content));
    }

    private Task<byte[]> GenerateProductExcel(ProductDto product)
    {
        // Simple Excel generation - in a real app, you'd use EPPlus or ClosedXML
        var csv = $"Field,Value\n";
        csv += $"Name,{product.Name}\n";
        csv += $"ID,{product.Id}\n";
        csv += $"Cost per Item,{product.CostPerItem}\n";
        csv += $"Number in Stock,{product.NumberInStock}\n";
        csv += $"Total Value,{product.TotalValue}\n";
        csv += $"Is Active,{product.IsActive}\n";
        csv += $"Is In Stock,{product.IsInStock}\n";
        csv += $"Is Low Stock,{product.IsLowStock}\n";
        csv += $"Created At,{product.CreatedAt:yyyy-MM-dd HH:mm:ss}\n";
        
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(csv));
    }

    private Task<byte[]> GenerateProductsExcel(IEnumerable<ProductDto> products)
    {
        var csv = "Name,ID,Cost per Item,Number in Stock,Total Value,Is Active,Is In Stock,Is Low Stock,Created At\n";
        
        foreach (var product in products)
        {
            csv += $"\"{product.Name}\",{product.Id},{product.CostPerItem},{product.NumberInStock},{product.TotalValue},{product.IsActive},{product.IsInStock},{product.IsLowStock},{product.CreatedAt:yyyy-MM-dd HH:mm:ss}\n";
        }
        
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(csv));
    }

    private Task<byte[]> GenerateProductCsv(ProductDto product)
    {
        var csv = "Field,Value\n";
        csv += $"Name,{product.Name}\n";
        csv += $"ID,{product.Id}\n";
        csv += $"Cost per Item,{product.CostPerItem}\n";
        csv += $"Number in Stock,{product.NumberInStock}\n";
        csv += $"Total Value,{product.TotalValue}\n";
        csv += $"Is Active,{product.IsActive}\n";
        csv += $"Is In Stock,{product.IsInStock}\n";
        csv += $"Is Low Stock,{product.IsLowStock}\n";
        csv += $"Created At,{product.CreatedAt:yyyy-MM-dd HH:mm:ss}\n";
        
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(csv));
    }

    private Task<byte[]> GenerateProductsCsv(IEnumerable<ProductDto> products)
    {
        var csv = "Name,ID,Cost per Item,Number in Stock,Total Value,Is Active,Is In Stock,Is Low Stock,Created At\n";
        
        foreach (var product in products)
        {
            csv += $"\"{product.Name}\",{product.Id},{product.CostPerItem},{product.NumberInStock},{product.TotalValue},{product.IsActive},{product.IsInStock},{product.IsLowStock},{product.CreatedAt:yyyy-MM-dd HH:mm:ss}\n";
        }
        
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(csv));
    }
}

// 🚀 ENHANCED DTOs with formatted properties
public class EnhancedProductDto
{
    // Original properties
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal CostPerItem { get; set; }
    public int NumberInStock { get; set; }
    public decimal TotalValue { get; set; }
    public bool IsActive { get; set; }
    public bool IsInStock { get; set; }
    public bool IsLowStock { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // 🎯 ENHANCED: Formatted properties using shared utilities
    public string FormattedName { get; set; } = string.Empty;
    public string FormattedPrice { get; set; } = string.Empty;
    public string FormattedTotalValue { get; set; } = string.Empty;
    public string FormattedTotalValueShort { get; set; } = string.Empty;
    public string StockDisplay { get; set; } = string.Empty;
    public string CreatedDisplay { get; set; } = string.Empty;
    public string CreatedFriendly { get; set; } = string.Empty;
    public string StockStatus { get; set; } = string.Empty;
    public string StockStatusBadge { get; set; } = string.Empty;
    public string ActiveStatusBadge { get; set; } = string.Empty;
    public string PriceRange { get; set; } = string.Empty;
    public string StockLevel { get; set; } = string.Empty;
    public string ImageDisplay { get; set; } = string.Empty;
    public bool HasImage { get; set; }
}

public class EnhancedDashboardStats
{
    // Raw values
    public int TotalProducts { get; set; }
    public decimal TotalValue { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int InStockCount { get; set; }
    
    // 🎯 ENHANCED: Formatted values
    public string TotalProductsFormatted { get; set; } = string.Empty;
    public string TotalValueFormatted { get; set; } = string.Empty;
    public string TotalValueShort { get; set; } = string.Empty;
    public string LowStockPercentage { get; set; } = string.Empty;
    public string OutOfStockPercentage { get; set; } = string.Empty;
    public string InStockPercentage { get; set; } = string.Empty;
    public string LastUpdated { get; set; } = string.Empty;
    public string LastUpdatedFull { get; set; } = string.Empty;
    public string AverageProductValue { get; set; } = string.Empty;
    public int HealthScore { get; set; }
    public string StatusSummary { get; set; } = string.Empty;
}

public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class InventoryValueReportDto
{
    public decimal TotalValue { get; set; }
    public int TotalProducts { get; set; }
    public int TotalQuantity { get; set; }
    public string FormattedTotalValue { get; set; } = string.Empty;
    public string FormattedTotalValueShort { get; set; } = string.Empty;
    public string AverageValuePerProduct { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedAtFormatted { get; set; } = string.Empty;
    public List<EnhancedProductDto> Products { get; set; } = new();
}

public class AdjustProductStockDto
{
    public int Adjustment { get; set; }
}

public class BulkStockAdjustmentDto
{
    public List<StockAdjustmentDto> Adjustments { get; set; } = new();
}

public class StockAdjustmentDto
{
    public Guid ProductId { get; set; }
    public int Adjustment { get; set; }
}

public class BulkStockAdjustmentResultDto
{
    public int TotalProcessed { get; set; }
    public int SuccessfulAdjustments { get; set; }
    public int FailedAdjustments { get; set; }
    public List<StockAdjustmentResultDto> Results { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}

public class StockAdjustmentResultDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int PreviousStock { get; set; }
    public int NewStock { get; set; }
    public int Adjustment { get; set; }
    public bool Success { get; set; }
}