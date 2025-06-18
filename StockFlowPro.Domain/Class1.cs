using StockFlowPro.Domain.Exceptions;

namespace StockFlowPro.Domain.Entities;


public class Product
{
    private int _stockQuantity;
    private decimal _costPerItem;
    private int _reorderLevel;

    public Product(string name, decimal costPerItem, int initialStock = 0, int reorderLevel = 10)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Product name cannot be empty");
        
        if (costPerItem < 0)
            throw new DomainException("Cost per item cannot be negative");
        
        if (initialStock < 0)
            throw new DomainException("Initial stock cannot be negative");
        
        if (reorderLevel < 0)
            throw new DomainException("Reorder level cannot be negative");

        Id = Guid.NewGuid();
        Name = name.Trim();
        _costPerItem = costPerItem;
        _stockQuantity = initialStock;
        _reorderLevel = reorderLevel;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    // Private constructor for EF Core
    private Product() { }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    
    public decimal CostPerItem 
    { 
        get => _costPerItem;
        private set
        {
            if (value < 0)
                throw new DomainException("Cost per item cannot be negative");
            _costPerItem = value;
            UpdatedAt = DateTime.UtcNow;
        }
    }
    
    public int StockQuantity 
    { 
        get => _stockQuantity;
        private set
        {
            if (value < 0)
                throw new DomainException("Stock quantity cannot be negative");
            _stockQuantity = value;
            UpdatedAt = DateTime.UtcNow;
        }
    }
    
    public int ReorderLevel 
    { 
        get => _reorderLevel;
        private set
        {
            if (value < 0)
                throw new DomainException("Reorder level cannot be negative");
            _reorderLevel = value;
            UpdatedAt = DateTime.UtcNow;
        }
    }
    
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }


    public void AddStock(int quantity)
    {
        if (quantity <= 0)
            throw new DomainException("Quantity to add must be positive");
        
        StockQuantity += quantity;
    }
    
    public void RemoveStock(int quantity)
    {
        if (quantity <= 0)
            throw new DomainException("Quantity to remove must be positive");

        if (quantity > StockQuantity)
            throw new DomainException($"Cannot remove {quantity} items. Only {StockQuantity} items in stock");

        StockQuantity -= quantity;
    }

    public void UpdateCost(decimal newCost)
    {
        CostPerItem = newCost;
    }

    public void UpdateReorderLevel(int newReorderLevel)
    {
        ReorderLevel = newReorderLevel;
    }
    
    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new DomainException("Product name cannot be empty");

        Name = newName.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public bool NeedsRestock()
    {
        return StockQuantity <= ReorderLevel;
    }

    public bool HasSufficientStock(int requiredQuantity)
    {
        return StockQuantity >= requiredQuantity;
    }

    public decimal CalculateStockValue()
    {
        return StockQuantity * CostPerItem;
    }
    
    public string GetStockStatus()
    {
        if (StockQuantity == 0)
            return "Out of Stock";

        if (NeedsRestock())
            return "Low Stock";

        return "In Stock";
    }

    public override bool Equals(object? obj)
    {
        if (obj is not Product other)
            return false;
        
        return Id == other.Id;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }

    public override string ToString()
    {
        return $"{Name} - Stock: {StockQuantity}, Cost: ${CostPerItem:F2}";
    }
}