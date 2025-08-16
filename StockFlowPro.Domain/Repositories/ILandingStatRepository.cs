using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingStatRepository : IRepository<LandingStat>
{
    System.Threading.Tasks.Task<IEnumerable<LandingStat>> GetActiveStatsByOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<LandingStat>> GetAllByOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<LandingStat?> GetByLabelAsync(string label, CancellationToken cancellationToken = default);
}
