using System.ComponentModel.DataAnnotations;
namespace StockFlowPro.Web.Controllers.Api;

public partial record CreateSubtaskRequest
{
    [Required] public string Task { get; init; } = string.Empty;
    [Required] public string Description { get; init; } = string.Empty;
    [Required] public string DueDate { get; init; } = string.Empty;
    [Required] public string Priority { get; init; } = string.Empty;
    public int Progress { get; init; }
    public List<Guid>? AssigneeIds { get; init; }
}
