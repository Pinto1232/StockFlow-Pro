using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;

public interface IInvoiceService
{
    Task<InvoiceDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<InvoiceDto>> GetAllAsync();
    Task<IEnumerable<InvoiceDto>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<InvoiceDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto createInvoiceDto);
    Task<InvoiceDto> UpdateAsync(UpdateInvoiceDto updateInvoiceDto);
    Task DeleteAsync(Guid id);
    Task<InvoiceDto> AddItemAsync(AddInvoiceItemDto addItemDto);
    Task<InvoiceDto> UpdateItemQuantityAsync(UpdateInvoiceItemDto updateItemDto);
    Task<InvoiceDto> RemoveItemAsync(Guid invoiceId, Guid productId);
    Task<bool> ExistsAsync(Guid id);
}