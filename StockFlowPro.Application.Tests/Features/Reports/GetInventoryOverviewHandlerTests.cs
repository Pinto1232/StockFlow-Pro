using FluentAssertions;
using Moq;
using StockFlowPro.Application.Features.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using Xunit;

namespace StockFlowPro.Application.Tests.Features.Reports;

public class GetInventoryOverviewHandlerTests
{
    private readonly Mock<IProductRepository> _mockProductRepository;
    private readonly GetInventoryOverviewHandler _handler;

    public GetInventoryOverviewHandlerTests()
    {
        _mockProductRepository = new Mock<IProductRepository>();
        _handler = new GetInventoryOverviewHandler(_mockProductRepository.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsInventoryOverview()
    {
        // Arrange
        var products = new List<Product>
        {
            CreateProduct("Product 1", 10.00m, 50, true),
            CreateProduct("Product 2", 20.00m, 0, true),   // Out of stock
            CreateProduct("Product 3", 15.00m, 5, true),   // Low stock
            CreateProduct("Product 4", 25.00m, 100, false) // Inactive
        };

        _mockProductRepository
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(products);

        var query = new GetInventoryOverviewQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalProducts.Should().Be(4);
        result.ActiveProducts.Should().Be(3);
        result.InactiveProducts.Should().Be(1);
        result.InStockProducts.Should().Be(2); // Products 1 and 3
        result.OutOfStockProducts.Should().Be(2); // Products 2 and 4
        result.LowStockProducts.Should().Be(1); // Product 3
        result.TotalInventoryValue.Should().Be(3075.00m); // (10*50) + (20*0) + (15*5) + (25*100) = 500 + 0 + 75 + 2500 = 3075
        result.AverageProductValue.Should().Be(768.75m); // 3075 / 4
    }

    [Fact]
    public async Task Handle_WithNoProducts_ReturnsZeroValues()
    {
        // Arrange
        _mockProductRepository
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Product>());

        var query = new GetInventoryOverviewQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalProducts.Should().Be(0);
        result.ActiveProducts.Should().Be(0);
        result.InactiveProducts.Should().Be(0);
        result.InStockProducts.Should().Be(0);
        result.OutOfStockProducts.Should().Be(0);
        result.LowStockProducts.Should().Be(0);
        result.TotalInventoryValue.Should().Be(0);
        result.AverageProductValue.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WithNullRequest_ThrowsArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => 
            _handler.Handle(null!, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithSpecificAsOfDate_ReturnsCorrectData()
    {
        // Arrange
        var asOfDate = DateTime.UtcNow.AddDays(-1);
        var products = new List<Product>
        {
            CreateProduct("Product 1", 10.00m, 50, true),
            CreateProduct("Product 2", 20.00m, 25, true)
        };

        _mockProductRepository
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(products);

        var query = new GetInventoryOverviewQuery(asOfDate);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalProducts.Should().Be(2);
        result.TotalInventoryValue.Should().Be(1000.00m); // (10*50) + (20*25)
    }

    [Fact]
    public async Task Handle_RepositoryThrowsException_PropagatesException()
    {
        // Arrange
        _mockProductRepository
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        var query = new GetInventoryOverviewQuery();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _handler.Handle(query, CancellationToken.None));
    }

    private static Product CreateProduct(string name, decimal cost, int stock, bool isActive)
    {
        var product = new Product(name, cost, stock);
        if (!isActive)
        {
            product.Deactivate();
        }
        return product;
    }
}

public class GetSalesOverviewHandlerTests
{
    private readonly Mock<IInvoiceRepository> _mockInvoiceRepository;
    private readonly GetSalesOverviewHandler _handler;

    public GetSalesOverviewHandlerTests()
    {
        _mockInvoiceRepository = new Mock<IInvoiceRepository>();
        _handler = new GetSalesOverviewHandler(_mockInvoiceRepository.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsSalesOverview()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddMonths(-1);
        var endDate = DateTime.UtcNow;
        
        var invoices = new List<Invoice>
        {
            CreateInvoice(Guid.NewGuid(), 100.00m, startDate.AddDays(1)),
            CreateInvoice(Guid.NewGuid(), 200.00m, startDate.AddDays(5)),
            CreateInvoice(Guid.NewGuid(), 150.00m, startDate.AddDays(10))
        };

        _mockInvoiceRepository
            .Setup(x => x.GetInvoicesByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoices);

        var query = new GetSalesOverviewQuery(startDate, endDate);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalInvoices.Should().Be(3);
        result.TotalRevenue.Should().Be(450.00m);
        result.AverageInvoiceValue.Should().Be(150.00m);
        result.FirstSaleDate.Should().Be(startDate.AddDays(1));
        result.LastSaleDate.Should().Be(startDate.AddDays(10));
    }

    [Fact]
    public async Task Handle_WithNoInvoices_ReturnsZeroValues()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddMonths(-1);
        var endDate = DateTime.UtcNow;

        _mockInvoiceRepository
            .Setup(x => x.GetInvoicesByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Invoice>());

        var query = new GetSalesOverviewQuery(startDate, endDate);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalInvoices.Should().Be(0);
        result.TotalRevenue.Should().Be(0);
        result.AverageInvoiceValue.Should().Be(0);
        result.TotalItemsSold.Should().Be(0);
        result.FirstSaleDate.Should().BeNull();
        result.LastSaleDate.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithInactiveInvoices_ExcludesInactiveInvoices()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddMonths(-1);
        var endDate = DateTime.UtcNow;
        
        var invoices = new List<Invoice>
        {
            CreateInvoice(Guid.NewGuid(), 100.00m, startDate.AddDays(1)), // Active
            CreateInactiveInvoice(Guid.NewGuid(), 200.00m, startDate.AddDays(5)) // Inactive
        };

        _mockInvoiceRepository
            .Setup(x => x.GetInvoicesByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(invoices);

        var query = new GetSalesOverviewQuery(startDate, endDate);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalInvoices.Should().Be(1); // Only active invoice
        result.TotalRevenue.Should().Be(100.00m); // Only active invoice revenue
    }

    private static Invoice CreateInvoice(Guid userId, decimal total, DateTime createdDate)
    {
        var invoice = new Invoice(userId, createdDate);
        // Add items to reach the total (simplified for testing)
        invoice.AddItem(Guid.NewGuid(), "Test Product", total, 1);
        return invoice;
    }

    private static Invoice CreateInactiveInvoice(Guid userId, decimal total, DateTime createdDate)
    {
        var invoice = CreateInvoice(userId, total, createdDate);
        invoice.Deactivate();
        return invoice;
    }
}