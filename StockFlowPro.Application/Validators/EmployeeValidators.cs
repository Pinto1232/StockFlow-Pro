using FluentValidation;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Validators;

public class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.JobTitle).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PhoneNumber).MaximumLength(50);
        RuleFor(x => x.DepartmentName).MaximumLength(150);
        RuleFor(x => x.HireDate).LessThanOrEqualTo(DateTime.UtcNow.Date).When(x => x.HireDate.HasValue);
    }
}

public class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator()
    {
        RuleFor(x => x.FirstName).MaximumLength(100);
        RuleFor(x => x.LastName).MaximumLength(100);
        RuleFor(x => x.JobTitle).MaximumLength(150);
        RuleFor(x => x.PhoneNumber).MaximumLength(50);
        RuleFor(x => x.DepartmentName).MaximumLength(150);
    }
}
