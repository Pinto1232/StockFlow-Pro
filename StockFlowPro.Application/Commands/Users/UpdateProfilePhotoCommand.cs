using MediatR;

namespace StockFlowPro.Application.Commands.Users;

public class UpdateProfilePhotoCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string? ProfilePhotoUrl { get; set; }
}