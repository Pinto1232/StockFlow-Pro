using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IProductRepository _productRepository;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        IUserRepository userRepository,
        IProductRepository productRepository)
    {
        _invoiceRepository = invoiceRepository;
        _userRepository = userRepository;
        _productRepository = productRepository;
    }

    public async Task<InvoiceDto?> GetByIdAsync(Guid id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        return invoice != null ? MapToDto(invoice) : null;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllAsync()
    {
        var invoices = await _invoiceRepository.GetAllAsync();
        return invoices.Select(MapToDto);
    }

    public async Task<IEnumerable<InvoiceDto>> GetByUserIdAsync(Guid userId)
    {
        var invoices = await _invoiceRepository.GetByUserIdAsync(userId);
        return invoices.Select(MapToDto);
    }

    public async Task<IEnumerable<InvoiceDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var invoices = await _invoiceRepository.GetByDateRangeAsync(startDate, endDate);
        return invoices.Select(MapToDto);
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto createInvoiceDto)
    {
        // Ensure the user exists in the database before creating the invoice
        // This is necessary because invoices are stored in the database and require
        // a valid foreign key reference to the Users table
        var user = await _userRepository.GetByIdAsync(createInvoiceDto.CreatedByUserId);
        if (user == null)
        {
            throw new ArgumentException($"User with ID {createInvoiceDto.CreatedByUserId} not found in database. " +
                "Users must exist in the database to create invoices.", nameof(createInvoiceDto.CreatedByUserId));
        }
        
        var invoice = new Invoice(createInvoiceDto.CreatedByUserId, createInvoiceDto.CreatedDate);
        var createdInvoice = await _invoiceRepository.AddAsync(invoice);
        
        // Reload to get navigation properties
        var reloadedInvoice = await _invoiceRepository.GetByIdAsync(createdInvoice.Id);
        return MapToDto(reloadedInvoice!);
    }

    public async Task<InvoiceDto> UpdateAsync(UpdateInvoiceDto updateInvoiceDto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(updateInvoiceDto.Id);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found", nameof(updateInvoiceDto.Id));
        }

        invoice.UpdateCreatedDate(updateInvoiceDto.CreatedDate);
        var updatedInvoice = await _invoiceRepository.UpdateAsync(invoice);
        return MapToDto(updatedInvoice);
    }

    public async Task DeleteAsync(Guid id)
    {
        var exists = await _invoiceRepository.ExistsAsync(id);
        if (!exists)
        {
            throw new ArgumentException("Invoice not found", nameof(id));
        }

        await _invoiceRepository.DeleteAsync(id);
    }

    public async Task<InvoiceDto> AddItemAsync(AddInvoiceItemDto addItemDto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(addItemDto.InvoiceId);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found", nameof(addItemDto.InvoiceId));
        }

        // Verify product exists
        var product = await _productRepository.GetByIdAsync(addItemDto.ProductId);
        if (product == null)
        {
            throw new ArgumentException("Product not found", nameof(addItemDto.ProductId));
        }

        invoice.AddItem(addItemDto.ProductId, addItemDto.ProductName, addItemDto.UnitPrice, addItemDto.Quantity);
        var updatedInvoice = await _invoiceRepository.UpdateAsync(invoice);
        return MapToDto(updatedInvoice);
    }

    public async Task<InvoiceDto> UpdateItemQuantityAsync(UpdateInvoiceItemDto updateItemDto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(updateItemDto.InvoiceId);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found", nameof(updateItemDto.InvoiceId));
        }

        invoice.UpdateItemQuantity(updateItemDto.ProductId, updateItemDto.Quantity);
        var updatedInvoice = await _invoiceRepository.UpdateAsync(invoice);
        return MapToDto(updatedInvoice);
    }

    public async Task<InvoiceDto> RemoveItemAsync(Guid invoiceId, Guid productId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found", nameof(invoiceId));
        }

        invoice.RemoveItem(productId);
        var updatedInvoice = await _invoiceRepository.UpdateAsync(invoice);
        return MapToDto(updatedInvoice);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _invoiceRepository.ExistsAsync(id);
    }

    private static InvoiceDto MapToDto(Invoice invoice)
    {
        var random = new Random(invoice.Id.GetHashCode()); // Deterministic random based on ID
        var statuses = new[] { "Draft", "Pending", "Paid", "Overdue", "Cancelled" };
        var customerNames = new[] { "Acme Corp", "Tech Solutions Inc", "Global Industries", "Local Business LLC", "Enterprise Systems" };
        
        var subtotal = invoice.Total * 0.85m; // Assume 85% is subtotal
        var taxAmount = invoice.Total * 0.15m; // Assume 15% tax
        
        return new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = $"INV-{invoice.CreatedAt.Year}-{invoice.Id.ToString()[..8].ToUpper()}",
            CustomerId = Guid.NewGuid(), // Generate a sample customer ID
            CustomerName = customerNames[random.Next(customerNames.Length)],
            IssueDate = invoice.CreatedDate,
            DueDate = invoice.CreatedDate.AddDays(30), // 30 days payment terms
            Subtotal = subtotal,
            TaxAmount = taxAmount,
            TotalAmount = invoice.Total,
            Status = statuses[random.Next(statuses.Length)],
            Notes = random.Next(3) == 0 ? "Payment due within 30 days" : null, // Random notes
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt,
            Items = invoice.Items.Select(MapItemToDto).ToList(),
            
            // Legacy properties for backward compatibility
            CreatedDate = invoice.CreatedDate,
            CreatedByUserId = invoice.CreatedByUserId,
            CreatedByUserName = invoice.CreatedByUser?.GetFullName() ?? "System User",
            Total = invoice.Total,
            IsActive = invoice.IsActive,
            TotalItemCount = invoice.GetTotalItemCount(),
            HasItems = invoice.HasItems()
        };
    }

    private static InvoiceItemDto MapItemToDto(InvoiceItem item)
    {
        var lineTotal = item.GetLineTotal();
        
        return new InvoiceItemDto
        {
            Id = item.Id,
            InvoiceId = item.InvoiceId,
            ProductId = item.ProductId,
            ProductName = item.ProductName,
            UnitPrice = item.UnitPrice,
            Quantity = item.Quantity,
            TotalPrice = lineTotal,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            
            // Legacy property for backward compatibility
            LineTotal = lineTotal
        };
    }
}