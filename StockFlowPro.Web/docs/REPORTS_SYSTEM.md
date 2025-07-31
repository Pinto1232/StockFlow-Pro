# StockFlow Pro - Reports and Analytics System

## Overview

The StockFlow Pro reporting system provides comprehensive business intelligence capabilities with three levels of reporting:

1. **Basic Reports** - Essential operational reports
2. **Advanced Reports** - In-depth analytical reports with insights
3. **Analytics Dashboard** - Real-time KPIs, charts, and alerts

## Architecture

The reporting system follows the Clean Architecture pattern with:

- **DTOs**: Data transfer objects for different report types
- **Queries**: CQRS query objects using MediatR
- **Handlers**: Business logic for generating reports
- **Services**: High-level service interface for report operations
- **Controllers**: REST API endpoints for web access

## Basic Reports

### Inventory Overview
- Total products, active/inactive counts
- Stock levels (in stock, out of stock, low stock)
- Total inventory value and averages

**Endpoint**: `GET /api/reports/inventory/overview`

### Sales Overview
- Total invoices and revenue
- Average invoice value
- Sales date ranges and item counts

**Endpoint**: `GET /api/reports/sales/overview`

### Product Performance
- Individual product sales metrics
- Revenue, quantity sold, order frequency
- Current stock and value information

**Endpoint**: `GET /api/reports/products/performance`

### Specialized Reports
- **Low Stock Report**: Products below threshold
- **Out of Stock Report**: Products with zero inventory
- **Top Selling Products**: Best performers by revenue/quantity
- **Revenue by Period**: Time-based revenue analysis

## Advanced Reports

### Trend Analysis
- Sales and revenue trends over time
- Growth rate calculations
- Trend direction analysis (upward, stable, downward)

**Endpoint**: `GET /api/reports/trends`

### Profitability Analysis
- Gross profit and margin calculations
- Product-level profitability
- Period-based profit analysis
- Cost analysis and optimization insights

**Endpoint**: `GET /api/reports/profitability`

### Inventory Analysis
- Inventory turnover ratios
- Days of inventory on hand
- Fast/slow moving product identification
- Dead stock analysis

### Customer Analysis
- Customer segmentation (high/medium/low value)
- Customer lifetime value
- Purchase behavior patterns
- Top customer identification

### Forecasting
- Sales and revenue predictions
- Product demand forecasting
- Reorder recommendations
- Confidence intervals and methodology

## Analytics Dashboard

### KPI Metrics
Real-time key performance indicators:
- Revenue and growth rates
- Order volume and trends
- Average order value
- Inventory turnover
- Gross profit margins
- Stock alerts

**Endpoint**: `GET /api/reports/kpi`

### Charts and Visualizations
- **Line Charts**: Time series trends
- **Bar Charts**: Product comparisons
- **Doughnut Charts**: Category distributions
- **Area Charts**: Cumulative metrics

**Endpoint**: `GET /api/reports/charts/{chartType}`

### Alerts System
Automated alerts for:
- **Inventory**: Out of stock, low stock, high value inventory
- **Sales**: No sales activity, low volume, large orders
- **Performance**: Inactive products, slow movers

**Endpoint**: `GET /api/reports/alerts`

## API Usage Examples

### Basic Inventory Report
```http
GET /api/reports/inventory/overview
```

### Sales Report with Date Range
```http
GET /api/reports/sales/overview?startDate=2024-01-01&endDate=2024-12-31
```

### Top 10 Products by Revenue
```http
GET /api/reports/products/performance?topCount=10&sortBy=totalrevenue
```

### Monthly Trend Analysis
```http
GET /api/reports/trends?startDate=2024-01-01&endDate=2024-12-31&period=month
```

### Analytics Dashboard
```http
GET /api/reports/dashboard?period=month&widgets=revenue,products,inventory
```

### Generate Custom Basic Report
```http
POST /api/reports/basic/inventory
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "filters": {
    "activeOnly": true,
    "groupBy": "month"
  }
}
```

### Chart Data for Revenue Trends
```http
GET /api/reports/charts/line?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

## Report Filters

The `ReportFilterDto` supports various filtering options:

```csharp
public class ReportFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<Guid>? ProductIds { get; set; }
    public List<Guid>? UserIds { get; set; }
    public bool? ActiveOnly { get; set; }
    public string? GroupBy { get; set; }        // day, week, month, quarter, year
    public string? SortBy { get; set; }         // revenue, quantity, date, etc.
    public string? SortDirection { get; set; }  // asc, desc
    public int? Limit { get; set; }
    public int? Offset { get; set; }
}
```

## Export Capabilities

Reports can be exported in multiple formats:
- **PDF**: Formatted reports with charts
- **Excel**: Spreadsheet format with data tables
- **CSV**: Raw data for external analysis
- **JSON**: Structured data for API consumption

```http
POST /api/reports/export/inventory
Content-Type: application/json

{
  "exportOptions": {
    "format": "PDF",
    "includeCharts": true,
    "includeRawData": false,
    "template": "Standard"
  },
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

## Available Report Types

### Basic Reports
- `inventory` - Inventory Overview
- `sales` - Sales Overview  
- `products` - Product Performance
- `lowstock` - Low Stock Report
- `outofstock` - Out of Stock Report
- `topselling` - Top Selling Products
- `revenue` - Revenue Analysis

### Advanced Reports
- `trends` - Trend Analysis
- `profitability` - Profitability Analysis
- `inventory-analysis` - Detailed Inventory Analysis
- `customer-analysis` - Customer Analysis
- `forecasting` - Sales/Demand Forecasting
- `abc-analysis` - ABC Product Analysis
- `seasonality` - Seasonality Analysis

### Chart Types
- `line` - Line Chart (time series)
- `bar` - Bar Chart (comparisons)
- `doughnut` - Doughnut Chart (proportions)
- `area` - Area Chart (cumulative)

## Performance Considerations

- Reports include execution time metrics
- Large datasets are paginated using `Limit` and `Offset`
- Caching can be implemented for frequently accessed reports
- Database queries are optimized for reporting workloads

## Security

- All report endpoints require authentication
- Role-based access control can be implemented
- Sensitive data filtering based on user permissions
- Audit logging for report access

## Future Enhancements

- **Report Scheduling**: Automated report generation and delivery
- **Benchmarking**: Industry comparison metrics
- **Anomaly Detection**: Automated identification of unusual patterns
- **Machine Learning**: Advanced forecasting and recommendations
- **Real-time Metrics**: Live dashboard updates
- **Custom Report Builder**: User-defined report creation

## Integration

The reporting system integrates with:
- **Product Management**: Inventory and product data
- **Invoice System**: Sales and transaction data
- **User Management**: Customer and user analytics
- **Authentication**: Security and access control

## Error Handling

The system includes comprehensive error handling:
- Invalid report types return `400 Bad Request`
- Missing data returns appropriate messages
- System errors return `500 Internal Server Error`
- Detailed logging for troubleshooting

## Testing

Unit tests should cover:
- Report generation logic
- Data aggregation accuracy
- Filter application
- Error scenarios
- Performance benchmarks

## Monitoring

Key metrics to monitor:
- Report generation times
- API response times
- Error rates
- Usage patterns
- Data freshness