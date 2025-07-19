using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class Product : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal CostPerItem { get; private set; }
    public int NumberInStock { get; private set; }
    public bool IsActive { get; private set; }
    public string? ImageUrl { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private Product() { }

    public Product(string name, decimal costPerItem, int numberInStock)
    {
        Id = Guid.NewGuid();
        Name = name;
        CostPerItem = costPerItem;
        NumberInStock = numberInStock;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateName(string name)
    {
        Name = name;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateCostPerItem(decimal costPerItem)
    {
        if (costPerItem < 0) {
            throw new ArgumentException("Cost per item cannot be negative", nameof(costPerItem));
        }

        CostPerItem = costPerItem;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStock(int numberInStock)
    {
        if (numberInStock < 0)
        {
            throw new ArgumentException("Stock cannot be negative", nameof(numberInStock));
        }
        
        NumberInStock = numberInStock;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddStock(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity to add must be positive", nameof(quantity));
        }
        
        NumberInStock += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveStock(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity to remove must be positive", nameof(quantity));
        }
        
        if (NumberInStock < quantity)
        {
            throw new InvalidOperationException("Insufficient stock available");
        }
        
        NumberInStock -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateImage(string? imageUrl)
    {
        ImageUrl = imageUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public decimal GetTotalValue() => CostPerItem * NumberInStock;

    public bool IsInStock() => NumberInStock > 0;

    public bool IsLowStock(int threshold = 10) => NumberInStock <= threshold;
}
