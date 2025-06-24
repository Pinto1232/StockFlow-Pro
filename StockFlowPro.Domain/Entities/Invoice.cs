using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class Invoice : IEntity
{
    public Guid Id { get; private set; }
    public DateTime CreatedDate { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public User? CreatedByUser { get; private set; }
    public decimal Total { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    private readonly List<InvoiceItem> _items = new();
    public IReadOnlyList<InvoiceItem> Items => _items.AsReadOnly();

    private Invoice() { }

    public Invoice(Guid createdByUserId, DateTime? createdDate = null)
    {
        Id = Guid.NewGuid();
        CreatedDate = createdDate ?? DateTime.UtcNow;
        CreatedByUserId = createdByUserId;
        Total = 0;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void AddItem(Guid productId, string productName, decimal unitPrice, int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be positive", nameof(quantity));
        }

        if (unitPrice < 0)
        {
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));
        }

        var existingItem = _items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + quantity);
        }
        else
        {
            var item = new InvoiceItem(Id, productId, productName, unitPrice, quantity);
            _items.Add(item);
        }

        RecalculateTotal();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateItemQuantity(Guid productId, int newQuantity)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null)
        {
            throw new InvalidOperationException("Item not found in invoice");
        }

        if (newQuantity <= 0)
        {
            RemoveItem(productId);
        }
        else
        {
            item.UpdateQuantity(newQuantity);
            RecalculateTotal();
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void RemoveItem(Guid productId)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            _items.Remove(item);
            RecalculateTotal();
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void UpdateCreatedDate(DateTime createdDate)
    {
        CreatedDate = createdDate;
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

    private void RecalculateTotal()
    {
        Total = _items.Sum(item => item.GetLineTotal());
    }

    public int GetTotalItemCount() => _items.Sum(item => item.Quantity);

    public bool HasItems() => _items.Any();
}