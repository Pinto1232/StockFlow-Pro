using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingTestimonialRepository : IRepository<LandingTestimonial>
{
    System.Threading.Tasks.Task<IEnumerable<LandingTestimonial>> GetActiveTestimonialsByOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<LandingTestimonial>> GetAllByOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<LandingTestimonial?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
