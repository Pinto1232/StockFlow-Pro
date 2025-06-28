namespace StockFlowPro.Application.DTOs.Reports;

public class AdvancedReportDto
{
    public string ReportName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public TimeSpan GenerationTime { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public List<string> Insights { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class TrendAnalysisDto
{
    public string Period { get; set; } = string.Empty;
    public List<TrendDataPointDto> SalesTrend { get; set; } = new();
    public List<TrendDataPointDto> RevenueTrend { get; set; } = new();
    public List<TrendDataPointDto> InventoryTrend { get; set; } = new();
    public decimal SalesGrowthRate { get; set; }
    public decimal RevenueGrowthRate { get; set; }
    public string TrendDirection { get; set; } = string.Empty;
}

public class TrendDataPointDto
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class ProfitabilityAnalysisDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal GrossProfitMargin { get; set; }
    public List<ProductProfitabilityDto> ProductProfitability { get; set; } = new();
    public List<PeriodProfitabilityDto> PeriodProfitability { get; set; } = new();
}

public class ProductProfitabilityDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal Profit { get; set; }
    public decimal ProfitMargin { get; set; }
    public int UnitsSold { get; set; }
    public decimal ProfitPerUnit { get; set; }
}

public class PeriodProfitabilityDto
{
    public DateTime Period { get; set; }
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal Profit { get; set; }
    public decimal ProfitMargin { get; set; }
}

public class InventoryAnalysisDto
{
    public decimal TotalInventoryValue { get; set; }
    public decimal InventoryTurnoverRatio { get; set; }
    public int DaysOfInventoryOnHand { get; set; }
    public List<StockLevelAnalysisDto> StockLevels { get; set; } = new();
    public List<SlowMovingProductDto> SlowMovingProducts { get; set; } = new();
    public List<FastMovingProductDto> FastMovingProducts { get; set; } = new();
    public decimal DeadStockValue { get; set; }
}

public class StockLevelAnalysisDto
{
    public string Category { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal TotalValue { get; set; }
    public decimal Percentage { get; set; }
}

public class SlowMovingProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public decimal CurrentValue { get; set; }
    public DateTime? LastSoldDate { get; set; }
    public int DaysSinceLastSale { get; set; }
    public decimal TurnoverRate { get; set; }
}

public class FastMovingProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int TotalSold { get; set; }
    public decimal TurnoverRate { get; set; }
    public decimal RevenueContribution { get; set; }
    public string RecommendedAction { get; set; } = string.Empty;
}

public class CustomerAnalysisDto
{
    public int TotalCustomers { get; set; }
    public int ActiveCustomers { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal CustomerLifetimeValue { get; set; }
    public List<TopCustomerDto> TopCustomers { get; set; } = new();
    public CustomerSegmentationDto Segmentation { get; set; } = new();
}

public class TopCustomerDto
{
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal AverageOrderValue { get; set; }
    public DateTime LastOrderDate { get; set; }
    public string CustomerTier { get; set; } = string.Empty;
}

public class CustomerSegmentationDto
{
    public int HighValueCustomers { get; set; }
    public int MediumValueCustomers { get; set; }
    public int LowValueCustomers { get; set; }
    public int NewCustomers { get; set; }
    public int ReturningCustomers { get; set; }
    public int ChurnedCustomers { get; set; }
}

public class ForecastingDto
{
    public string ForecastType { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public List<ForecastDataPointDto> SalesForecast { get; set; } = new();
    public List<ForecastDataPointDto> RevenueForecast { get; set; } = new();
    public List<ProductDemandForecastDto> ProductDemandForecast { get; set; } = new();
    public decimal ConfidenceLevel { get; set; }
    public string Methodology { get; set; } = string.Empty;
}

public class ForecastDataPointDto
{
    public DateTime Date { get; set; }
    public decimal PredictedValue { get; set; }
    public decimal LowerBound { get; set; }
    public decimal UpperBound { get; set; }
    public decimal Confidence { get; set; }
}

public class ProductDemandForecastDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int PredictedDemand { get; set; }
    public int RecommendedReorderQuantity { get; set; }
    public DateTime RecommendedReorderDate { get; set; }
    public decimal Confidence { get; set; }
}