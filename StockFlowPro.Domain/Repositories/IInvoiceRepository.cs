using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Domain.Repositories;

public interface IInvoiceRepository
{
    System.Threading.Tasks.Task<Invoice?> GetByIdAsync(Guid id);
    System.Threading.Tasks.Task<IEnumerable<Invoice>> GetAllAsync();
    System.Threading.Tasks.Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId);
    System.Threading.Tasks.Task<IEnumerable<Invoice>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    System.Threading.Tasks.Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Invoice> AddAsync(Invoice invoice);
    System.Threading.Tasks.Task<Invoice> UpdateAsync(Invoice invoice);
    System.Threading.Tasks.Task DeleteAsync(Guid id);
    System.Threading.Tasks.Task<bool> ExistsAsync(Guid id);
}