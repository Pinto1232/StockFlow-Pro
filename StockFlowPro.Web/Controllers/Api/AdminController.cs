using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[RoleAuthorize(UserRole.Admin, UserRole.Manager)]
public class AdminController : ControllerBase
{
    private readonly IProductRepository _productRepository;

    public AdminController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    [HttpGet("product-stats")]
    public async Task<IActionResult> GetProductStats()
    {
        try
        {
            var allProducts = await _productRepository.GetAllAsync();
            var inStockProducts = await _productRepository.GetInStockProductsAsync();
            
            var totalProducts = allProducts.Count();
            var inStockCount = inStockProducts.Count();
            var inStockPercentage = totalProducts > 0 ? (decimal)inStockCount / totalProducts * 100 : 0;

            var result = new
            {
                TotalProducts = totalProducts,
                InStockProducts = inStockCount,
                InStockPercentage = Math.Round(inStockPercentage, 1)
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to retrieve product statistics", details = ex.Message });
        }
    }
}