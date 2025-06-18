using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Example DbSet, replace with your actual entities
        // public DbSet<YourEntity> YourEntities { get; set; }
    }
}
