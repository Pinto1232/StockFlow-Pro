using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;

public interface IInvoiceService
{
        System.Threading.Tasks.Task<InvoiceDto?> GetByIdAsync(Guid id);
        System.Threading.Tasks.Task<IEnumerable<InvoiceDto>> GetAllAsync();
        System.Threading.Tasks.Task<IEnumerable<InvoiceDto>> GetByUserIdAsync(Guid userId);
        System.Threading.Tasks.Task<IEnumerable<InvoiceDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        System.Threading.Tasks.Task<InvoiceDto> CreateAsync(CreateInvoiceDto createInvoiceDto);
        System.Threading.Tasks.Task<InvoiceDto> UpdateAsync(UpdateInvoiceDto updateInvoiceDto);
    Task DeleteAsync(Guid id);
        System.Threading.Tasks.Task<InvoiceDto> AddItemAsync(AddInvoiceItemDto addItemDto);
        System.Threading.Tasks.Task<InvoiceDto> UpdateItemQuantityAsync(UpdateInvoiceItemDto updateItemDto);
        System.Threading.Tasks.Task<InvoiceDto> RemoveItemAsync(Guid invoiceId, Guid productId);
        System.Threading.Tasks.Task<bool> ExistsAsync(Guid id);
}