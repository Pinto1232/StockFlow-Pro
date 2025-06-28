namespace StockFlowPro.Application.DTOs.Reports;

public class BasicReportDto
{
    public string ReportName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public Dictionary<string, object> Data { get; set; } = new();
}

public class InventoryOverviewDto
{
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int InactiveProducts { get; set; }
    public int InStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
    public int LowStockProducts { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public decimal AverageProductValue { get; set; }
}

public class SalesOverviewDto
{
    public int TotalInvoices { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageInvoiceValue { get; set; }
    public int TotalItemsSold { get; set; }
    public DateTime? FirstSaleDate { get; set; }
    public DateTime? LastSaleDate { get; set; }
}

public class ProductPerformanceDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TimesOrdered { get; set; }
    public decimal AverageOrderQuantity { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal CurrentValue { get; set; }
}