using FluentValidation;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Validators;

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    private readonly IProductRepository _productRepository;

    public UpdateProductCommandValidator(IProductRepository productRepository)
    {
        _productRepository = productRepository;

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters")
            .MustAsync(BeUniqueProductName).WithMessage("A product with this name already exists");

        RuleFor(x => x.CostPerItem)
            .GreaterThan(0).WithMessage("Cost per item must be greater than 0")
            .LessThan(1000000).WithMessage("Cost per item must be less than $1,000,000");

        RuleFor(x => x.NumberInStock)
            .GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative")
            .LessThan(1000000).WithMessage("Stock must be less than 1,000,000 units");
    }

    private async Task<bool> BeUniqueProductName(UpdateProductCommand command, string name, CancellationToken cancellationToken)
    {
        return !await _productRepository.ProductNameExistsAsync(name, command.Id, cancellationToken);
    }
}