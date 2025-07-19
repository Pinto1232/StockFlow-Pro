namespace StockFlowPro.Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal CostPerItem { get; set; }
    public int NumberInStock { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal TotalValue => CostPerItem * NumberInStock;
    public bool IsInStock => NumberInStock > 0;
    public bool IsLowStock => NumberInStock <= 10;
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal CostPerItem { get; set; }
    public int NumberInStock { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal CostPerItem { get; set; }
    public int NumberInStock { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateProductStockDto
{
    public int NumberInStock { get; set; }
}