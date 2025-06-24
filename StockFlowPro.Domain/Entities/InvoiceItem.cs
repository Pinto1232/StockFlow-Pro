using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class InvoiceItem : IEntity
{
    public Guid Id { get; private set; }
    public Guid InvoiceId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public Invoice? Invoice { get; private set; }
    public Product? Product { get; private set; }

    private InvoiceItem() { }

    public InvoiceItem(Guid invoiceId, Guid productId, string productName, decimal unitPrice, int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be positive", nameof(quantity));
        }

        if (unitPrice < 0)
        {
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));
        }

        if (string.IsNullOrWhiteSpace(productName))
        {
            throw new ArgumentException("Product name cannot be empty", nameof(productName));
        }

        Id = Guid.NewGuid();
        InvoiceId = invoiceId;
        ProductId = productId;
        ProductName = productName;
        UnitPrice = unitPrice;
        Quantity = quantity;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be positive", nameof(quantity));
        }

        Quantity = quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateUnitPrice(decimal unitPrice)
    {
        if (unitPrice < 0)
        {
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));
        }

        UnitPrice = unitPrice;
        UpdatedAt = DateTime.UtcNow;
    }

    public decimal GetLineTotal() => UnitPrice * Quantity;
}