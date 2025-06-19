using FluentValidation;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Validators;

public class UpdateUserEmailCommandValidator : AbstractValidator<UpdateUserEmailCommand>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserEmailCommandValidator(IUserRepository userRepository)
    {
        _userRepository = userRepository;

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters")
            .MustAsync(BeUniqueEmail).WithMessage("Email already exists");
    }

    private async Task<bool> BeUniqueEmail(UpdateUserEmailCommand command, string email, CancellationToken cancellationToken)
    {
        return !await _userRepository.EmailExistsAsync(email, command.Id, cancellationToken);
    }
}
