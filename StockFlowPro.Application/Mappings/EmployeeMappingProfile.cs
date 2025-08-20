using AutoMapper;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using System.Text.Json;

namespace StockFlowPro.Application.Mappings;

public class EmployeeMappingProfile : Profile
{
    public EmployeeMappingProfile()
    {
        CreateMap<Employee, EmployeeDto>()
            .ForMember(d => d.Documents, opt => opt.MapFrom(s => s.Documents))
            .ForMember(d => d.Tasks, opt => opt.MapFrom(s => s.Tasks))
            .ForMember(d => d.ImageUrl, opt => opt.MapFrom(s => s.ImageUrl));

        CreateMap<EmployeeDocument, EmployeeDocumentDto>();

    CreateMap<Domain.Entities.ProjectTask, TaskDto>()
            .ForMember(d => d.Id, opt => opt.MapFrom(s => s.TaskId)) // Map TaskId to Id for frontend compatibility
            .ForMember(d => d.GuidId, opt => opt.MapFrom(s => s.Id)) // Map the actual GUID Id for backend operations
            .ForMember(d => d.Task, opt => opt.MapFrom(s => s.TaskName))
            .ForMember(d => d.Priority, opt => opt.MapFrom(s => s.Priority.ToString()))
            .ForMember(d => d.Completed, opt => opt.MapFrom(s => s.IsCompleted))
            .ForMember(d => d.Assignee, opt => opt.MapFrom(s => DeserializeAssignees(s.AssigneeData)))
            .ForMember(d => d.Children, opt => opt.MapFrom(s => s.Subtasks));

        CreateMap<CreateEmployeeDto, Employee>();

        // Update mapping handled manually in handler (partial updates)
    }

    private static List<TaskAssigneeDto> DeserializeAssignees(string assigneeData)
    {
        if (string.IsNullOrEmpty(assigneeData))
        {
            return new List<TaskAssigneeDto>();
        }
        try
        {
            var assignees = JsonSerializer.Deserialize<List<TaskAssigneeDto>>(assigneeData) ?? new List<TaskAssigneeDto>();
            // TODO: Replace with actual employee lookup (e.g., from DB or injected service)
            foreach (var a in assignees)
            {
                // Example: Lookup employee by initials or id
                // var employee = EmployeeRepository.FindByInitialsOrId(a.Initials, a.Id);
                // if (employee != null)
                // {
                //     a.Id = employee.Id.ToString();
                //     a.FullName = employee.FirstName + " " + employee.LastName;
                // }
                // For now, set placeholder values
                if (string.IsNullOrEmpty(a.FullName))
                {
                    a.FullName = "Unknown";
                }
                if (string.IsNullOrEmpty(a.Id))
                {
                    a.Id = "";
                }
            }
            return assignees;
        }
        catch
        {
            return new List<TaskAssigneeDto>();
        }
    }
}
