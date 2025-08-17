using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Application.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public Guid GuidId { get; set; } // The actual GUID primary key for backend operations
    public string? Type { get; set; } // "parent" or null for child tasks
    public string Task { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<TaskAssigneeDto> Assignee { get; set; } = new();
    public string DueDate { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty; // "Urgent", "Normal", "Low"
    public int Progress { get; set; }
    public int? SubtaskCount { get; set; }
    public bool Completed { get; set; }
    public int? CommentCount { get; set; }
    public List<TaskDto>? Children { get; set; }
}

public class TaskAssigneeDto
{
    public string Initials { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty; // CSS class like "bg-purple-500"
}

public class CreateTaskDto
{
    [Required]
    public string Task { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public List<TaskAssigneeDto> Assignee { get; set; } = new();
    
    [Required]
    public string DueDate { get; set; } = string.Empty;
    
    [Required]
    [RegularExpression("^(Urgent|Normal|Low)$", ErrorMessage = "Priority must be Urgent, Normal, or Low")]
    public string Priority { get; set; } = string.Empty;
    
    [Range(0, 100, ErrorMessage = "Progress must be between 0 and 100")]
    public int Progress { get; set; }
    
    public string? Type { get; set; }
    public int? SubtaskCount { get; set; }
    public bool Completed { get; set; }
    public int? CommentCount { get; set; }
    public List<CreateTaskDto>? Children { get; set; }
}

public class UpdateTaskDto
{
    public string? Task { get; set; }
    public string? Description { get; set; }
    public List<TaskAssigneeDto>? Assignee { get; set; }
    public string? DueDate { get; set; }
    
    [RegularExpression("^(Urgent|Normal|Low)$", ErrorMessage = "Priority must be Urgent, Normal, or Low")]
    public string? Priority { get; set; }
    
    [Range(0, 100, ErrorMessage = "Progress must be between 0 and 100")]
    public int? Progress { get; set; }
    
    public string? Type { get; set; }
    public int? SubtaskCount { get; set; }
    public bool? Completed { get; set; }
    public int? CommentCount { get; set; }
    public List<UpdateTaskDto>? Children { get; set; }
}
