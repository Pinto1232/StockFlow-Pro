# 📘 Project Best Practices

## 1. Project Purpose
StockFlow Pro is a comprehensive inventory management system built with .NET 8 backend and React TypeScript frontend. The system provides real-time stock tracking, user management with role-based permissions, subscription plans, invoicing, and reporting capabilities. It follows Clean Architecture principles with Domain-Driven Design patterns and implements a full-stack solution with SignalR for real-time updates.

## 2. Project Structure

### Backend (.NET 8)
- **StockFlowPro.Domain**: Core business entities, interfaces, enums, and domain logic
- **StockFlowPro.Application**: Application services, CQRS handlers, DTOs, validators, and mappings
- **StockFlowPro.Infrastructure**: Data persistence, repositories, external services, and configurations
- **StockFlowPro.Web**: Web API controllers, SignalR hubs, middleware, and presentation layer
- **StockFlowPro.Shared**: Common utilities and shared components
- ***.Tests**: Corresponding test projects for each layer

### Frontend (React + TypeScript)
- **src/architecture**: Hexagonal architecture implementation with domain, application, and adapter layers
- **src/components**: Reusable UI components
- **src/pages**: Page-level components and routing
- **src/services**: API communication and external service integrations
- **src/hooks**: Custom React hooks for state management and side effects
- **src/contexts**: React context providers for global state

### Configuration Files
- **Directory.Build.props**: Global MSBuild properties with strict code quality settings
- **Directory.Packages.props**: Centralized package version management
- **global.json**: .NET SDK version specification

## 3. Test Strategy

### Framework and Tools
- **Backend**: xUnit, FluentAssertions, Moq, Entity Framework InMemory
- **Frontend**: Vitest, React Testing Library (implied from package.json)

### Test Organization
- Tests mirror the source structure with `.Tests` suffix
- Unit tests focus on individual components and business logic
- Integration tests verify database operations and API endpoints
- Test files use descriptive naming: `{ClassName}Tests.cs`

### Testing Patterns
- **Arrange-Act-Assert** pattern consistently used
- **FluentAssertions** for readable test assertions
- **Moq** for mocking dependencies and external services
- **InMemory database** for integration testing without external dependencies
- **Thread.Sleep(10)** used strategically to ensure timestamp differences in tests

### Test Coverage Expectations
- Domain entities should have comprehensive unit tests covering all business rules
- Application handlers should test both success and failure scenarios
- Repository tests should verify data persistence and retrieval
- Controller tests should validate API contracts and authorization

## 4. Code Style

### C# Language Features
- **Nullable reference types** enabled globally (`<Nullable>enable</Nullable>`)
- **Implicit usings** enabled for cleaner code
- **Latest C# language version** specified in Directory.Build.props
- **Treat warnings as errors** enforced for code quality

### Naming Conventions
- **Classes**: PascalCase (e.g., `ProductRepository`, `CreateProductHandler`)
- **Methods**: PascalCase (e.g., `UpdateStock`, `GetProductById`)
- **Properties**: PascalCase (e.g., `NumberInStock`, `IsActive`)
- **Fields**: camelCase with underscore prefix for private fields (e.g., `_productRepository`)
- **Parameters**: camelCase (e.g., `productId`, `cancellationToken`)
- **Constants**: PascalCase (e.g., `DefaultStockThreshold`)

### File and Folder Conventions
- **Handlers**: `{Action}{Entity}Handler.cs` (e.g., `CreateProductHandler.cs`)
- **DTOs**: `{Entity}Dto.cs` (e.g., `ProductDto.cs`)
- **Commands/Queries**: `{Action}{Entity}Command/Query.cs`
- **Tests**: `{ClassName}Tests.cs`
- **Interfaces**: Prefixed with `I` (e.g., `IProductRepository`)

### Documentation and Comments
- **XML documentation** enabled for all projects
- **Summary comments** required for public APIs
- **Inline comments** used sparingly for complex business logic
- **Console.WriteLine** used for debugging and tracing in handlers

### Error Handling
- **ArgumentNullException.ThrowIfNull()** for null parameter validation
- **Domain-specific exceptions** thrown for business rule violations
- **Validation** handled through FluentValidation at application layer
- **Graceful error responses** in API controllers with appropriate HTTP status codes

## 5. Common Patterns

### Domain Layer Patterns
- **Rich domain entities** with encapsulated business logic and private setters
- **Factory methods** in constructors for entity creation
- **Value objects** for complex data types
- **Domain events** for cross-cutting concerns
- **Repository pattern** for data access abstraction

### Application Layer Patterns
- **CQRS** with MediatR for command and query separation
- **Handler pattern** for processing commands and queries
- **AutoMapper** for object-to-object mapping
- **FluentValidation** for input validation
- **DTO pattern** for data transfer between layers

### Infrastructure Patterns
- **Entity Framework Core** with Code First migrations
- **Repository implementation** with async/await patterns
- **Dependency injection** for service registration
- **Configuration pattern** with strongly-typed options

### Web Layer Patterns
- **Controller-based APIs** with RESTful conventions
- **SignalR hubs** for real-time communication
- **Middleware pipeline** for cross-cutting concerns
- **Authorization policies** with permission-based access control

### Frontend Patterns
- **Hexagonal architecture** with clear separation of concerns
- **Domain entities** mirrored from backend
- **Service layer** for API communication
- **Custom hooks** for state management and side effects

## 6. Do's and Don'ts

### ✅ Do's
- Use `async/await` consistently for all I/O operations
- Implement proper cancellation token support in async methods
- Follow the established folder structure and naming conventions
- Write comprehensive unit tests for domain entities and business logic
- Use strongly-typed configuration options
- Implement proper error handling and validation
- Use dependency injection for all service dependencies
- Follow SOLID principles in class design
- Use meaningful variable and method names
- Implement proper logging and monitoring

### ❌ Don'ts
- Don't use `Task.Result` or `.Wait()` - always use `await`
- Don't expose domain entities directly in API responses - use DTOs
- Don't put business logic in controllers or infrastructure layer
- Don't ignore compiler warnings - treat them as errors
- Don't use magic strings - use constants or configuration
- Don't skip input validation in public APIs
- Don't implement data access logic in application handlers
- Don't use `var` when the type isn't obvious from context
- Don't create circular dependencies between layers
- Don't hardcode connection strings or sensitive configuration

## 7. Tools & Dependencies

### Core Backend Dependencies
- **.NET 8**: Target framework with latest language features
- **Entity Framework Core 9.0.6**: ORM for data persistence
- **MediatR 11.1.0**: CQRS implementation
- **AutoMapper 12.0.1**: Object-to-object mapping
- **FluentValidation 11.11.0**: Input validation
- **Swashbuckle.AspNetCore 6.5.0**: API documentation

### Testing Dependencies
- **xUnit 2.7.0**: Testing framework
- **FluentAssertions 6.12.0**: Assertion library
- **Moq 4.20.70**: Mocking framework
- **EF Core InMemory**: In-memory database for testing

### Frontend Dependencies
- **React 19.1.0**: UI framework
- **TypeScript 5.8.3**: Type safety
- **Vite 6.3.5**: Build tool and dev server
- **TanStack Query 5.83.0**: Data fetching and caching
- **React Router 7.7.0**: Client-side routing
- **Tailwind CSS 3.4.15**: Utility-first CSS framework

### Development Tools
- **ESLint**: Code linting for TypeScript/React
- **Prettier**: Code formatting
- **Vitest**: Testing framework for frontend

### Project Setup
1. Ensure .NET 8 SDK is installed
2. Run `dotnet restore` in the root directory
3. Set up SQL Server connection string in appsettings.json
4. Run `dotnet ef database update` to apply migrations
5. For frontend: `cd frontend && npm install && npm run dev`

## 8. Other Notes

### Security Considerations
- **CORS policies** configured for different environments (development vs production)
- **API key authentication** implemented for external integrations
- **Cookie-based authentication** with secure settings
- **Input validation middleware** for request sanitization
- **Rate limiting** to prevent abuse

### Real-time Features
- **SignalR** implementation for live stock updates and notifications
- **Background services** for processing notifications
- **Hub-based communication** for client-server real-time data exchange

### Database Strategy
- **Database-first approach** prioritizing persistent data over mock data
- **Migration-based schema management** with EF Core
- **Centralized package management** for consistent versioning across projects

### Performance Considerations
- **Async/await patterns** throughout the application
- **Pagination support** for large data sets
- **Caching strategies** with appropriate cache headers
- **Optimized queries** with Entity Framework projections

### Code Quality Enforcement
- **Treat warnings as errors** enabled globally
- **Code style enforcement** in build process
- **Nullable reference types** for null safety
- **XML documentation generation** for all projects

### LLM Development Guidelines
When generating new code for this repository:
- Follow the established Clean Architecture layers and dependencies
- Use the existing patterns for CQRS handlers, repositories, and DTOs
- Implement proper validation using FluentValidation
- Include comprehensive unit tests following the established patterns
- Use the configured dependencies and avoid introducing new ones without justification
- Follow the naming conventions and folder structure
- Implement proper error handling and logging
- Consider real-time updates via SignalR when appropriate
- Ensure frontend code follows the hexagonal architecture pattern
- Use TypeScript strictly and follow the established component patterns