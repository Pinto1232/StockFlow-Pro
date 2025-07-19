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