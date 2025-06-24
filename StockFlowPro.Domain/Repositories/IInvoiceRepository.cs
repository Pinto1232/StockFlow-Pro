using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Domain.Repositories;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id);
    Task<IEnumerable<Invoice>> GetAllAsync();
    Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Invoice>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<Invoice> AddAsync(Invoice invoice);
    Task<Invoice> UpdateAsync(Invoice invoice);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}