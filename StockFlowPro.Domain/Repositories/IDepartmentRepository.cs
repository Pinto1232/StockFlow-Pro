using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface IDepartmentRepository : IRepository<Department>
{
    Task<Department?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
