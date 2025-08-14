using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class LandingTestimonialRepository : ILandingTestimonialRepository
{
    private readonly ApplicationDbContext _context;

    public LandingTestimonialRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LandingTestimonial?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.LandingTestimonials.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<LandingTestimonial>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingTestimonials.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(LandingTestimonial entity, CancellationToken cancellationToken = default)
    {
        await _context.LandingTestimonials.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(LandingTestimonial entity, CancellationToken cancellationToken = default)
    {
        _context.LandingTestimonials.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(LandingTestimonial entity, CancellationToken cancellationToken = default)
    {
        _context.LandingTestimonials.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingTestimonial>> GetActiveTestimonialsByOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingTestimonials
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingTestimonial>> GetAllByOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingTestimonials
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<LandingTestimonial?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.LandingTestimonials
            .FirstOrDefaultAsync(t => t.Name == name, cancellationToken);
    }
}
