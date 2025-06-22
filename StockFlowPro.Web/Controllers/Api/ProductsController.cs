using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Products;

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
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts(
        [FromQuery] bool activeOnly = false,
        [FromQuery] bool inStockOnly = false,
        [FromQuery] bool lowStockOnly = false,
        [FromQuery] int lowStockThreshold = 10)
    {
        var query = new GetAllProductsQuery 
        { 
            ActiveOnly = activeOnly,
            InStockOnly = inStockOnly,
            LowStockOnly = lowStockOnly,
            LowStockThreshold = lowStockThreshold
        };
        var products = await _mediator.Send(query);
        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProductById(Guid id)
    {
        var query = new GetProductByIdQuery { Id = id };
        var product = await _mediator.Send(query);
        
        if (product == null)
        {
            return NotFound($"Product with ID {id} not found");
        }

        return Ok(product);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string searchTerm)
    {
        var query = new SearchProductsQuery { SearchTerm = searchTerm ?? string.Empty };
        var products = await _mediator.Send(query);
        return Ok(products);
    }

    [HttpPost]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
    {
        try
        {
            var command = _mapper.Map<CreateProductCommand>(createProductDto);
            var product = await _mediator.Send(command);
            
            return CreatedAtAction(
                nameof(GetProductById), 
                new { id = product.Id }, 
                product);
        }
        catch (InvalidOperationException ex)
        {
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
    [Authorize(Roles = "User,Manager,Admin")]
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

    [HttpGet("dashboard-stats")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        var allProductsQuery = new GetAllProductsQuery { ActiveOnly = true };
        var lowStockQuery = new GetAllProductsQuery { ActiveOnly = true, LowStockOnly = true };
        var outOfStockQuery = new GetAllProductsQuery { ActiveOnly = true, InStockOnly = false };

        var allProducts = await _mediator.Send(allProductsQuery);
        var lowStockProducts = await _mediator.Send(lowStockQuery);
        var outOfStockProducts = allProducts.Where(p => !p.IsInStock);

        var stats = new
        {
            TotalProducts = allProducts.Count(),
            TotalValue = allProducts.Sum(p => p.TotalValue),
            LowStockCount = lowStockProducts.Count(),
            OutOfStockCount = outOfStockProducts.Count(),
            InStockCount = allProducts.Count(p => p.IsInStock)
        };

        return Ok(stats);
    }
}