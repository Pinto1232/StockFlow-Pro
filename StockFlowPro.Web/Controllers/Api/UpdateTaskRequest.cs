using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api;

public class UpdateTaskRequest
{
    [Required]
    public string Task { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string DueDate { get; set; } = string.Empty;

    [Required]
    public string Priority { get; set; } = "Normal";

    [Range(0,100)]
    public int Progress { get; set; } = 0;

    public List<Guid>? AssigneeIds { get; set; }
}
