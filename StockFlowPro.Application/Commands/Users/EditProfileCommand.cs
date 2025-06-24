using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Commands.Users;

public class EditProfileCommand : IRequest<ProfileDto>
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}