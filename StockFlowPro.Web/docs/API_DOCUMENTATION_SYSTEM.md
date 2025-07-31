# StockFlow Pro - Automatic API Documentation System

## Overview

StockFlow Pro includes a comprehensive automatic API documentation system that generates detailed documentation for all API endpoints. This system provides multiple output formats including Swagger/OpenAPI, Postman collections, Markdown documentation, and an interactive HTML dashboard.

## Features

### 🚀 Automatic Documentation Generation
- **Real-time Discovery**: Automatically discovers all API endpoints using reflection
- **Attribute-Based**: Uses custom attributes to provide rich documentation metadata
- **Multiple Formats**: Generates OpenAPI, Postman, Markdown, and HTML documentation
- **Caching**: Intelligent caching system for optimal performance
- **Live Updates**: Documentation updates automatically when APIs change

### 📋 Rich Documentation Metadata
- **Comprehensive Details**: Endpoint summaries, descriptions, parameters, examples
- **Security Information**: Authentication requirements, roles, permissions
- **Performance Data**: Rate limiting, caching information
- **Status Tracking**: Experimental, deprecated, and stable endpoint marking
- **Examples**: Request/response examples with multiple scenarios

### 🔧 Developer Tools
- **Interactive Dashboard**: Beautiful HTML interface for browsing documentation
- **Export Capabilities**: Download documentation in various formats
- **API Statistics**: Comprehensive metrics about your API
- **Integration Ready**: Easy integration with CI/CD pipelines

## Quick Start

### 1. Access the Documentation

The documentation system provides several endpoints:

```bash
# Interactive HTML Dashboard
GET /api/documentation/dashboard

# JSON API Documentation
GET /api/documentation

# OpenAPI Specification
GET /api/documentation/openapi?version=v1

# Postman Collection
GET /api/documentation/postman?version=v1

# Markdown Documentation
GET /api/documentation/markdown?version=v1

# API Statistics
GET /api/documentation/statistics
```

### 2. View in Browser

Navigate to your API base URL + `/api/documentation/dashboard` to see the interactive documentation dashboard.

## Using Documentation Attributes

### Basic Controller Documentation

Add the `ApiDocumentation` attribute to your controller class:

```csharp
[ApiController]
[Route("api/[controller]")]
[ApiDocumentation(
    "Product Management", 
    "Comprehensive product management operations including inventory tracking and stock management", 
    Category = "Product Management"
)]
public class ProductsController : ApiBaseController
{
    // Controller implementation
}
```

### Endpoint Documentation

Add detailed documentation to individual endpoints:

```csharp
[HttpGet]
[ApiDocumentation(
    "Get All Products",
    "Retrieves a paginated list of all products with optional filtering by category and stock status",
    RequiredPermissions = new[] { "Products.ViewAll" },
    RequiredRoles = new[] { "User", "Manager", "Admin" },
    RateLimit = "100 requests per minute",
    CacheInfo = "Cached for 10 minutes",
    Notes = "Results are automatically sorted by creation date in descending order"
)]
public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 50,
    [FromQuery] string? category = null,
    [FromQuery] bool? inStock = null)
{
    // Implementation
}
```

### Adding Examples

Provide comprehensive examples for requests and responses:

```csharp
[HttpPost]
[ApiDocumentation(
    "Create New Product",
    "Creates a new product in the inventory system with the provided details"
)]
[ApiExample(ExampleType.Request, "Create Product Request", @"{
    ""name"": ""Wireless Headphones"",
    ""description"": ""High-quality wireless headphones with noise cancellation"",
    ""sku"": ""WH-001"",
    ""category"": ""Electronics"",
    ""costPerItem"": 75.00,
    ""sellingPrice"": 149.99,
    ""stockLevel"": 50,
    ""minimumStockLevel"": 10
}")]
[ApiExample(ExampleType.Response, "Created Product Response", @"{
    ""success"": true,
    ""data"": {
        ""id"": ""550e8400-e29b-41d4-a716-446655440000"",
        ""name"": ""Wireless Headphones"",
        ""description"": ""High-quality wireless headphones with noise cancellation"",
        ""sku"": ""WH-001"",
        ""category"": ""Electronics"",
        ""costPerItem"": 75.00,
        ""sellingPrice"": 149.99,
        ""stockLevel"": 50,
        ""minimumStockLevel"": 10,
        ""isActive"": true,
        ""createdAt"": ""2024-01-01T00:00:00Z"",
        ""updatedAt"": ""2024-01-01T00:00:00Z""
    },
    ""message"": ""Product created successfully"",
    ""timestamp"": ""2024-01-01T00:00:00Z""
}", StatusCode = 201)]
[ApiExample(ExampleType.Error, "Validation Error", @"{
    ""success"": false,
    ""message"": ""Validation failed"",
    ""errors"": [
        ""SKU already exists"",
        ""Selling price must be greater than cost per item""
    ],
    ""timestamp"": ""2024-01-01T00:00:00Z""
}", StatusCode = 422)]
public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
{
    // Implementation
}
```

### Marking Experimental or Deprecated Endpoints

```csharp
[HttpGet("experimental-feature")]
[ApiDocumentation(
    "Experimental Feature",
    "This is an experimental endpoint that may change in future versions",
    IsExperimental = true,
    Notes = "This endpoint is subject to change and should not be used in production"
)]
public async Task<ActionResult<object>> ExperimentalFeature()
{
    // Implementation
}

[HttpGet("legacy-endpoint")]
[ApiDocumentation(
    "Legacy Endpoint",
    "This endpoint is deprecated and will be removed in v2.0",
    DeprecationMessage = "Use /api/products/v2/search instead. This endpoint will be removed in v2.0 (March 2024)"
)]
public async Task<ActionResult<object>> LegacyEndpoint()
{
    // Implementation
}
```

## Available Attributes

### ApiDocumentationAttribute

The main attribute for documenting endpoints:

```csharp
[ApiDocumentation(
    summary: "Endpoint summary",
    description: "Detailed description",
    Category = "Category Name",
    Version = "v1",
    RequiredPermissions = new[] { "Permission.Name" },
    RequiredRoles = new[] { "Role1", "Role2" },
    RequiresAuthentication = true,
    Notes = "Additional notes",
    DeprecationMessage = "Deprecation info",
    IsExperimental = false,
    RateLimit = "Rate limit info",
    CacheInfo = "Cache information"
)]
```

### ApiExampleAttribute

For providing request/response examples:

```csharp
[ApiExample(
    type: ExampleType.Request,
    name: "Example Name",
    content: "JSON content",
    StatusCode = 200,
    ContentType = "application/json"
)]
```

**ExampleType Options:**
- `ExampleType.Request` - Request body example
- `ExampleType.Response` - Success response example
- `ExampleType.Error` - Error response example

## Documentation Endpoints

### GET /api/documentation

Returns all API documentation in JSON format.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "UsersController.GetAllUsers",
      "method": "GET",
      "path": "/api/users",
      "summary": "Get all users",
      "description": "Retrieves a list of all users...",
      "category": "User Management",
      "requiresAuthentication": true,
      "requiredRoles": ["Admin", "Manager"],
      "parameters": [...],
      "responses": [...],
      "examples": [...]
    }
  ]
}
```

### GET /api/documentation/by-category

Returns documentation grouped by category.

### GET /api/documentation/version/{version}

Returns documentation for a specific API version.

### GET /api/documentation/openapi?version=v1

Generates OpenAPI 3.0 specification.

### GET /api/documentation/postman?version=v1

Generates Postman collection for API testing.

### GET /api/documentation/markdown?version=v1

Generates comprehensive Markdown documentation.

### GET /api/documentation/dashboard

Returns interactive HTML dashboard for browsing documentation.

### GET /api/documentation/statistics

Returns API statistics and metrics:

```json
{
  "success": true,
  "data": {
    "totalEndpoints": 45,
    "endpointsByMethod": {
      "GET": 25,
      "POST": 10,
      "PUT": 7,
      "DELETE": 3
    },
    "endpointsByCategory": {
      "User Management": 15,
      "Product Management": 12,
      "Documentation": 5
    },
    "authenticatedEndpoints": 40,
    "deprecatedEndpoints": 2,
    "experimentalEndpoints": 3
  }
}
```

### POST /api/documentation/refresh

Refreshes the documentation cache (Admin only).

## Integration with CI/CD

### Automatic Documentation Updates

The documentation system automatically updates when:
- New controllers or endpoints are added
- Existing endpoints are modified
- Documentation attributes are updated

### Export for External Tools

```bash
# Export OpenAPI spec for external tools
curl -o api-spec.json "https://your-api.com/api/documentation/openapi?version=v1"

# Export Postman collection for testing
curl -o api-tests.json "https://your-api.com/api/documentation/postman?version=v1"

# Export Markdown for documentation sites
curl -o API.md "https://your-api.com/api/documentation/markdown?version=v1"
```

### GitHub Actions Integration

```yaml
name: Update API Documentation
on:
  push:
    branches: [main]
    paths: ['StockFlowPro.Web/Controllers/**']

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Export API Documentation
        run: |
          curl -o docs/api-spec.json "${{ secrets.API_BASE_URL }}/api/documentation/openapi"
          curl -o docs/API.md "${{ secrets.API_BASE_URL }}/api/documentation/markdown"
      
      - name: Commit Documentation
        run: |
          git add docs/
          git commit -m "Update API documentation"
          git push
```

## Best Practices

### 1. Comprehensive Documentation

Always provide:
- Clear, concise summaries
- Detailed descriptions for complex operations
- Complete request/response examples
- Error scenarios and handling

### 2. Consistent Categorization

Use consistent category names across your API:
- "User Management"
- "Product Management"
- "Invoice Management"
- "Reports"
- "Authentication"

### 3. Security Documentation

Always specify:
- Required authentication
- Required roles and permissions
- Security considerations

### 4. Version Management

- Use semantic versioning (v1, v2, etc.)
- Document breaking changes
- Provide migration guides for deprecated endpoints

### 5. Examples and Testing

- Provide realistic examples
- Include both success and error scenarios
- Keep examples up-to-date with actual API behavior

## Customization

### Custom Categories

Define custom categories for your domain:

```csharp
public static class ApiCategories
{
    public const string UserManagement = "User Management";
    public const string ProductManagement = "Product Management";
    public const string InventoryTracking = "Inventory Tracking";
    public const string Reporting = "Reports & Analytics";
    public const string SystemAdmin = "System Administration";
}
```

### Custom Documentation Service

Extend the documentation service for custom requirements:

```csharp
public class CustomApiDocumentationService : ApiDocumentationService
{
    public CustomApiDocumentationService(
        IServiceProvider serviceProvider,
        IMemoryCache cache,
        ILogger<ApiDocumentationService> logger) 
        : base(serviceProvider, cache, logger)
    {
    }

    // Override methods for custom behavior
}
```

## Troubleshooting

### Common Issues

1. **Documentation not updating**
   - Check if caching is enabled
   - Use the refresh endpoint: `POST /api/documentation/refresh`

2. **Missing endpoints**
   - Ensure controllers are in the `Controllers.Api` namespace
   - Verify controller inheritance from `ApiBaseController`

3. **Incorrect examples**
   - Validate JSON syntax in examples
   - Ensure examples match actual API behavior

### Performance Considerations

- Documentation is cached for 30 minutes by default
- Large APIs may take a few seconds to generate initially
- Consider using background services for very large APIs

## Support

For issues or questions about the documentation system:

1. Check the logs for detailed error information
2. Use the `/api/documentation/statistics` endpoint to verify system health
3. Refer to the source code in `StockFlowPro.Web.Services.ApiDocumentationService`

---

*This documentation system is part of StockFlow Pro's commitment to providing comprehensive, maintainable, and developer-friendly APIs.*