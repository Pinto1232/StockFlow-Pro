using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Task entity representing project tasks and subtasks
/// </summary>
public class ProjectTask : IEntity
{
    public Guid Id { get; private set; }
    public int TaskId { get; private set; } // For UI compatibility with mock data
    public Guid EmployeeId { get; private set; } // Foreign key to Employee
    public string? Type { get; private set; } // "parent" or null for child tasks
    public string TaskName { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string DueDate { get; private set; } = string.Empty;
    public TaskPriority Priority { get; private set; }
    public int Progress { get; private set; }
    public int? SubtaskCount { get; private set; }
    public bool IsCompleted { get; private set; }
    public int? CommentCount { get; private set; }
    public Guid? ParentTaskId { get; private set; } // For subtasks
    
    // Navigation
    public Employee Employee { get; private set; } = null!;
    public ProjectTask? ParentTask { get; private set; }
    
    // Assignees stored as JSON
    public string AssigneeData { get; private set; } = string.Empty;
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    // Subtasks collection
    private readonly List<ProjectTask> _subtasks = new();
    public IReadOnlyCollection<ProjectTask> Subtasks => _subtasks.AsReadOnly();

    private ProjectTask() { } // EF Constructor

    public ProjectTask(
        int taskId,
        Guid employeeId,
        string taskName,
        string description,
        string dueDate,
        TaskPriority priority,
        int progress = 0,
        string? type = null,
        Guid? parentTaskId = null)
    {
        if (string.IsNullOrWhiteSpace(taskName))
        {
            throw new ArgumentException("Task name is required", nameof(taskName));
        }
        
        if (progress < 0 || progress > 100)
        {
            throw new ArgumentException("Progress must be between 0 and 100", nameof(progress));
        }

        Id = Guid.NewGuid();
        TaskId = taskId;
        EmployeeId = employeeId;
        Type = type;
        TaskName = taskName.Trim();
        Description = description.Trim();
        DueDate = dueDate;
        Priority = priority;
        Progress = progress;
        ParentTaskId = parentTaskId;
        IsCompleted = false;
        AssigneeData = "[]"; // Empty JSON array by default
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProgress(int progress)
    {
        if (progress < 0 || progress > 100)
        {
            throw new ArgumentException("Progress must be between 0 and 100", nameof(progress));
        }
        
        Progress = progress;
        IsCompleted = progress == 100;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAssignees(string assigneeJson)
    {
        AssigneeData = assigneeJson ?? "[]";
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateTask(
        string? taskName = null,
        string? description = null,
        string? dueDate = null,
        TaskPriority? priority = null,
        bool? isCompleted = null,
        int? commentCount = null)
    {
        if (!string.IsNullOrWhiteSpace(taskName))
        {
            TaskName = taskName.Trim();
        }
        
        if (!string.IsNullOrWhiteSpace(description))
        {
            Description = description.Trim();
        }
        
        if (!string.IsNullOrWhiteSpace(dueDate))
        {
            DueDate = dueDate;
        }
        
        if (priority.HasValue)
        {
            Priority = priority.Value;
        }
        
        if (isCompleted.HasValue)
        {
            IsCompleted = isCompleted.Value;
            if (isCompleted.Value)
            {
                Progress = 100;
            }
        }
        
        if (commentCount.HasValue)
        {
            CommentCount = commentCount.Value;
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void AddSubtask(ProjectTask subtask)
    {
        if (subtask.ParentTaskId != Id)
        {
            throw new ArgumentException("Subtask must have this task as parent", nameof(subtask));
        }
        
        _subtasks.Add(subtask);
        SubtaskCount = _subtasks.Count;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveSubtask(ProjectTask subtask)
    {
        _subtasks.Remove(subtask);
        SubtaskCount = _subtasks.Count;
        UpdatedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// Task priority enumeration
/// </summary>
public enum TaskPriority
{
    Low = 0,
    Normal = 1,
    Urgent = 2
}
