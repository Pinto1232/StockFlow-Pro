namespace StockFlowPro.Application.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = new();
    public int TotalItemCount { get; set; }
    public bool HasItems { get; set; }
}

public class CreateInvoiceDto
{
    public DateTime? CreatedDate { get; set; }
    public Guid CreatedByUserId { get; set; }
}

public class UpdateInvoiceDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class InvoiceItemDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AddInvoiceItemDto
{
    public Guid InvoiceId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class UpdateInvoiceItemDto
{
    public Guid InvoiceId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}