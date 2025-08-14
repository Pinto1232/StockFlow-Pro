using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class LandingStatRepository : ILandingStatRepository
{
    private readonly ApplicationDbContext _context;

    public LandingStatRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LandingStat?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.LandingStats.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<LandingStat>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingStats.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(LandingStat entity, CancellationToken cancellationToken = default)
    {
        await _context.LandingStats.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(LandingStat entity, CancellationToken cancellationToken = default)
    {
        _context.LandingStats.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(LandingStat entity, CancellationToken cancellationToken = default)
    {
        _context.LandingStats.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingStat>> GetActiveStatsByOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingStats
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Label)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingStat>> GetAllByOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingStats
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Label)
            .ToListAsync(cancellationToken);
    }

    public async Task<LandingStat?> GetByLabelAsync(string label, CancellationToken cancellationToken = default)
    {
        return await _context.LandingStats
            .FirstOrDefaultAsync(s => s.Label == label, cancellationToken);
    }
}
