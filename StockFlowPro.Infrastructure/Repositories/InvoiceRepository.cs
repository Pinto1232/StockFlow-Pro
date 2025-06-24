using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly ApplicationDbContext _context;

    public InvoiceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Invoice?> GetByIdAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.CreatedByUser)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.CreatedByUser)
            .OrderByDescending(i => i.CreatedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.CreatedByUser)
            .Where(i => i.CreatedByUserId == userId)
            .OrderByDescending(i => i.CreatedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.CreatedByUser)
            .Where(i => i.CreatedDate >= startDate && i.CreatedDate <= endDate)
            .OrderByDescending(i => i.CreatedDate)
            .ToListAsync();
    }

    public async Task<Invoice> AddAsync(Invoice invoice)
    {
        await _context.Invoices.AddAsync(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice> UpdateAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task DeleteAsync(Guid id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice != null)
        {
            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Invoices.AnyAsync(i => i.Id == id);
    }
}