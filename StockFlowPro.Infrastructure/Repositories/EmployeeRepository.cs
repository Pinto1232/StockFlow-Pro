using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        await _context.Set<Employee>().AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        _context.Set<Employee>().Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        _context.Set<Employee>().Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await _context.Set<Employee>().FirstOrDefaultAsync(e => e.Email == normalized, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetByDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .Where(e => e.DepartmentId == departmentId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Employee>> SearchAsync(string search, CancellationToken cancellationToken = default)
    {
        search = (search ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(search))
        {
            return await GetAllAsync(cancellationToken);
        }

        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .Where(e => (e.FirstName ?? string.Empty).ToLower().Contains(search) ||
                        (e.LastName ?? string.Empty).ToLower().Contains(search) ||
                        (e.Email ?? string.Empty).ToLower().Contains(search) ||
                        (e.JobTitle ?? string.Empty).ToLower().Contains(search) ||
                        ((e.DepartmentName ?? string.Empty).ToLower().Contains(search)))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var query = _context.Set<Employee>().Where(e => e.Email == normalized);
        if (excludeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
