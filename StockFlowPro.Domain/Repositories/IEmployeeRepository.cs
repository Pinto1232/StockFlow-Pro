using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository contract for Employee aggregate with specialized queries.
/// </summary>
public interface IEmployeeRepository : IRepository<Employee>
{
    System.Threading.Tasks.Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Employee>> GetByDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Employee>> SearchAsync(string search, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default);

    // Insert a ProjectTask directly (avoids updating the entire Employee aggregate and reduces concurrency conflicts)
    System.Threading.Tasks.Task AddTaskAsync(ProjectTask task, CancellationToken cancellationToken = default);
}
