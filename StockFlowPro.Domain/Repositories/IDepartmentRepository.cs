using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface IDepartmentRepository : IRepository<Department>
{
    System.Threading.Tasks.Task<Department?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
