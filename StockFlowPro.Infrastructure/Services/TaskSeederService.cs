using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Data;
using System.Text.Json;

namespace StockFlowPro.Infrastructure.Services;

public class TaskSeederService
{
    private readonly ApplicationDbContext _context;

    public TaskSeederService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task SeedTasksAsync()
    {
        // Check if tasks already exist
        if (await _context.Tasks.AnyAsync())
        {
            return; // Tasks already seeded
        }

        // Get some employees to assign tasks to
        var employees = await _context.Employees.Take(5).ToListAsync();
        if (!employees.Any())
        {
            throw new InvalidOperationException("No employees found. Please seed employees first.");
        }

    var mockTasks = new List<Domain.Entities.ProjectTask>();
        var taskId = 1;

        foreach (var employee in employees)
        {
            var task1 = new Domain.Entities.ProjectTask(
                taskId++,
                employee.Id,
                "Design System Update", 
                "Update the design system with new components and guidelines",
                DateTime.UtcNow.AddDays(14).ToString("yyyy-MM-dd"),
                TaskPriority.Urgent,
                65
            );

            var assignees1 = employees.Take(2).Select(e => new { 
                id = e.Id.ToString(),
                name = $"{e.FirstName} {e.LastName}",
                avatar = e.ImageUrl ?? "/avatars/default.jpg"
            }).ToList();
            task1.SetAssignees(JsonSerializer.Serialize(assignees1));
            
            mockTasks.Add(task1);

            var task2 = new Domain.Entities.ProjectTask(
                taskId++,
                employee.Id,
                "API Documentation", 
                "Complete API documentation for all endpoints",
                DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd"),
                TaskPriority.Normal,
                0
            );

            var assignees2 = new[] { new { 
                id = employee.Id.ToString(),
                name = $"{employee.FirstName} {employee.LastName}",
                avatar = employee.ImageUrl ?? "/avatars/default.jpg"
            }};
            task2.SetAssignees(JsonSerializer.Serialize(assignees2));
            
            mockTasks.Add(task2);
        }

        // Add a few more diverse tasks
        var firstEmployee = employees.First();

    var task3 = new Domain.Entities.ProjectTask(
            taskId++,
            firstEmployee.Id,
            "Mobile App Testing", 
            "Conduct comprehensive testing of the mobile application",
            DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd"),
            TaskPriority.Urgent,
            90
        );
        task3.SetAssignees(JsonSerializer.Serialize(employees.Skip(1).Take(3).Select(e => new { 
            id = e.Id.ToString(),
            name = $"{e.FirstName} {e.LastName}",
            avatar = e.ImageUrl ?? "/avatars/default.jpg"
        }).ToList()));
        mockTasks.Add(task3);

    var task4 = new Domain.Entities.ProjectTask(
            taskId++,
            firstEmployee.Id,
            "Security Audit", 
            "Perform security audit and implement recommended fixes",
            DateTime.UtcNow.AddDays(5).ToString("yyyy-MM-dd"),
            TaskPriority.Urgent,
            30
        );
        task4.SetAssignees(JsonSerializer.Serialize(employees.Take(2).Select(e => new { 
            id = e.Id.ToString(),
            name = $"{e.FirstName} {e.LastName}",
            avatar = e.ImageUrl ?? "/avatars/default.jpg"
        }).ToList()));
        mockTasks.Add(task4);

        _context.Tasks.AddRange(mockTasks);
        await _context.SaveChangesAsync();
    }
}
