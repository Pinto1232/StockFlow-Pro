# StockFlow Pro - Documentation

Welcome to the StockFlow Pro documentation! This directory contains comprehensive documentation for the inventory management system.

## 📚 Documentation Overview

### API Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification for automated tooling
- **[StockFlowPro-API.postman_collection.json](./StockFlowPro-API.postman_collection.json)** - Postman collection for API testing

### Project Management
- **[GitHub Issues Templates](../.github/ISSUE_TEMPLATE/)** - Standardized issue templates
- **[Project Board Guide](../.github/PROJECT_BOARD.md)** - Kanban board setup and workflow
- **[Automation Workflows](../.github/workflows/)** - GitHub Actions for project automation

## 🚀 Quick Start

### 1. API Documentation

The API documentation provides comprehensive information about all available endpoints, request/response formats, authentication, and error handling.

**Key Features:**
- Complete endpoint reference
- Request/response examples
- Authentication guide
- Error handling documentation
- Rate limiting information
- Caching details

### 2. OpenAPI Specification

The OpenAPI specification enables:
- **Swagger UI** - Interactive API documentation
- **Code Generation** - Client SDKs in multiple languages
- **API Testing** - Automated testing tools
- **Validation** - Request/response validation

#### Using Swagger UI

1. Install Swagger UI or use online editor
2. Load the `openapi.yaml` file
3. Explore and test endpoints interactively

```bash
# Using Docker
docker run -p 8080:8080 -e SWAGGER_JSON=/openapi.yaml -v $(pwd)/docs:/usr/share/nginx/html swaggerapi/swagger-ui

# Access at http://localhost:8080
```

#### Generate Client SDKs

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate TypeScript client
openapi-generator-cli generate -i docs/openapi.yaml -g typescript-axios -o clients/typescript

# Generate C# client
openapi-generator-cli generate -i docs/openapi.yaml -g csharp -o clients/csharp
```

### 3. Postman Collection

The Postman collection includes:
- All API endpoints with examples
- Environment variables for different stages
- Pre-request scripts for authentication
- Test scripts for response validation
- Mock endpoints for testing

#### Import to Postman

1. Open Postman
2. Click "Import"
3. Select `StockFlowPro-API.postman_collection.json`
4. Configure environment variables:
   - `base_url`: API base URL
   - `jwt_token`: Authentication token

#### Environment Setup

Create environments for different stages:

**Development**
```json
{
  "environment": "development",
  "base_url": "http://localhost:5000/api",
  "jwt_token": ""
}
```

**Staging**
```json
{
  "environment": "staging",
  "base_url": "https://staging-api.stockflowpro.com/api",
  "jwt_token": ""
}
```

**Production**
```json
{
  "environment": "production",
  "base_url": "https://api.stockflowpro.com/api",
  "jwt_token": ""
}
```

## 🎯 Project Management

### GitHub Issues

We use standardized issue templates for consistent reporting:

- **Bug Report** - Report bugs with detailed reproduction steps
- **Feature Request** - Suggest new features with user stories
- **Task** - Development tasks with clear requirements

### Kanban Board

Our project management follows a structured Kanban workflow:

1. **📋 Backlog** - New issues and feature requests
2. **🔍 Ready** - Prioritized and refined items
3. **🚧 In Progress** - Currently being worked on
4. **👀 In Review** - Code review and testing
5. **✅ Done** - Completed and deployed

### Labels System

We use a comprehensive labeling system:

**Priority**: `critical`, `high`, `medium`, `low`
**Type**: `bug`, `feature`, `enhancement`, `task`, `documentation`, `security`
**Component**: `auth`, `products`, `invoices`, `reports`, `users`, `notifications`, `api`, `ui`, `database`, `infrastructure`
**Status**: `blocked`, `needs-info`, `duplicate`, `wontfix`
**Effort**: `xs`, `s`, `m`, `l`, `xl`

## 🔧 Development Workflow

### API Development

1. **Design First** - Update OpenAPI specification
2. **Generate Docs** - Update API documentation
3. **Implement** - Develop the endpoint
4. **Test** - Add unit and integration tests
5. **Document** - Update Postman collection
6. **Review** - Code review and testing

### Documentation Updates

1. **API Changes** - Update OpenAPI spec and documentation
2. **New Features** - Add examples and use cases
3. **Breaking Changes** - Update version and migration guide
4. **Testing** - Update Postman collection

## 📖 API Reference

### Authentication

All API endpoints require JWT authentication except mock endpoints:

```http
Authorization: Bearer <jwt-token>
```

**Login Credentials (Development):**
- Username: `admin`
- Password: `admin`

### Base URLs

- **Development**: `http://localhost:5000/api`
- **Staging**: `https://staging-api.stockflowpro.com/api`
- **Production**: `https://api.stockflowpro.com/api`

### Response Format

All responses follow a consistent JSON format:

```json
{
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Handling

Errors include detailed information:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Rate Limiting

- **Authenticated users**: 1000 requests/hour
- **Unauthenticated users**: 100 requests/hour
- **Search endpoints**: 60 requests/minute

## 🧪 Testing

### API Testing with Postman

1. Import the collection
2. Set up environment variables
3. Run the "Authentication" folder first
4. Execute other requests with valid JWT token

### Integration Testing

```bash
# Run all tests
dotnet test

# Run API integration tests
dotnet test StockFlowPro.Web.Tests
```

### Mock Endpoints

For testing without authentication:
- `GET /api/users/mock` - Get mock users
- `POST /api/users/mock` - Create mock user
- `PUT /api/users/mock/{id}` - Update mock user
- `DELETE /api/users/mock/{id}` - Delete mock user

## 📊 Monitoring and Analytics

### API Metrics

Monitor these key metrics:
- Response times
- Error rates
- Request volumes
- Authentication failures
- Rate limit hits

### Performance Optimization

- **Caching**: User data cached for 10 minutes
- **Pagination**: Default 50 items per page
- **Compression**: Gzip compression enabled
- **CDN**: Static assets served via CDN

## 🔒 Security

### Authentication & Authorization

- JWT tokens with expiration
- Role-based access control (RBAC)
- Secure password hashing
- CSRF protection

### API Security

- HTTPS only in production
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting

## 🚀 Deployment

### API Deployment

1. **Build**: `dotnet build --configuration Release`
2. **Test**: `dotnet test`
3. **Publish**: `dotnet publish --configuration Release`
4. **Deploy**: Deploy to hosting environment

### Documentation Deployment

1. **Swagger UI**: Deploy OpenAPI spec to documentation site
2. **Postman**: Publish collection to Postman workspace
3. **GitHub Pages**: Host documentation on GitHub Pages

## 📝 Contributing

### Documentation Guidelines

1. **Keep it current** - Update docs with code changes
2. **Be comprehensive** - Include examples and edge cases
3. **Use consistent formatting** - Follow markdown standards
4. **Test examples** - Ensure all examples work
5. **Review changes** - Get documentation reviewed

### API Design Guidelines

1. **RESTful design** - Follow REST principles
2. **Consistent naming** - Use clear, consistent naming
3. **Proper HTTP codes** - Use appropriate status codes
4. **Comprehensive errors** - Provide detailed error messages
5. **Version control** - Version breaking changes

## 📞 Support

### Getting Help

- **Documentation**: Check this documentation first
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and discuss ideas
- **Code Review**: Request code reviews for contributions

### Reporting Issues

Use the appropriate issue template:
1. **Bug Report**: For bugs and unexpected behavior
2. **Feature Request**: For new features and enhancements
3. **Task**: For development tasks and improvements

## 📋 Changelog

### Version 1.0.0 (Current)
- ✅ User management API
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Comprehensive documentation
- ✅ OpenAPI specification
- ✅ Postman collection
- ✅ GitHub project management

### Version 1.1.0 (Planned)
- 🔄 Product management API
- 🔄 Invoice management API
- 🔄 Reporting API
- 🔄 Notification system
- 🔄 Bulk operations
- 🔄 Export functionality

---

## 📚 Additional Resources

- **[Main README](../README.md)** - Project overview and setup
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[OpenAPI Spec](./openapi.yaml)** - Machine-readable API specification
- **[Postman Collection](./StockFlowPro-API.postman_collection.json)** - API testing collection
- **[GitHub Issues](https://github.com/your-username/StockFlow-Pro/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/your-username/StockFlow-Pro/discussions)** - Community discussions

---

*Last updated: 2024-01-01*