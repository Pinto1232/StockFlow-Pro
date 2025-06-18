# StockFlow Pro

A comprehensive inventory management system built with .NET Core and Razor Pages, following Clean Architecture principles and SOLID design patterns.

## 🚀 Project Overview

StockFlow Pro is a robust inventory management system designed to handle product tracking, invoice management, and comprehensive reporting. The system supports role-based access control with three distinct user roles, ensuring secure and efficient operations.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure user authentication and registration
- Role-based access control (Admin, User, Manager)
- User profile management

### 👥 User Management
- **Admin**: Full CRUD operations on users
- **User**: Basic access to core functionality
- **Manager**: Enhanced access with reporting capabilities

### 📦 Product Management
- Complete product inventory tracking
- Stock level monitoring
- Cost per item management
- Product naming and categorization

### 🧾 Invoice System
- Create and edit invoices
- Real-time total calculation (client-side)
- Invoice item management
- Date and user tracking

### 📊 Reporting & Analytics
- Items sold per product analysis
- Total product count tracking
- Products sold vs. in-stock comparison
- Comprehensive stock level reports

### ⚠️ Smart Notifications
- Automated restock alerts for managers
- Low inventory warnings
- Consolidated notification system

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
StockFlowPro/
├── StockFlowPro.Domain/          # Core business logic and entities
├── StockFlowPro.Application/     # Use cases and application services
├── StockFlowPro.Infrastructure/  # Data access and external services
├── StockFlowPro.Web/            # Presentation layer (Razor Pages)
└── Tests/                       # Comprehensive test suite
```

### 🎯 Design Principles

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Architecture**: Dependency inversion with clear layer boundaries
- **Domain-Driven Design**: Rich domain models with business logic encapsulation
- **CQRS Pattern**: Command Query Responsibility Segregation using MediatR
- **Repository Pattern**: Data access abstraction
- **Unit of Work**: Transaction management

## 🛠️ Technology Stack

- **.NET Core 8.0**: Modern, cross-platform framework
- **ASP.NET Core Razor Pages**: Server-side rendering with clean separation
- **Entity Framework Core**: Object-relational mapping
- **SQL Server**: Robust database management
- **ASP.NET Core Identity**: Authentication and authorization
- **AutoMapper**: Object-to-object mapping
- **FluentValidation**: Input validation
- **MediatR**: Mediator pattern implementation
- **xUnit**: Unit testing framework
- **FluentAssertions**: Fluent test assertions
- **Moq**: Mocking framework

## 🚦 Getting Started

### Prerequisites
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or VS Code

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd StockFlow-Pro
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Update database connection string**
   - Edit `appsettings.json` in StockFlowPro.Web
   - Configure your SQL Server connection string

4. **Apply database migrations**
   ```bash
   dotnet ef database update --project StockFlowPro.Infrastructure --startup-project StockFlowPro.Web
   ```

5. **Run the application**
   ```bash
   dotnet run --project StockFlowPro.Web
   ```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test StockFlowPro.Domain.Tests
```

## 📁 Project Structure

### Domain Layer
- **Entities**: Core business objects (User, Product, Invoice, InvoiceItem)
- **Value Objects**: Immutable objects representing concepts
- **Enums**: System enumerations (UserRole, InvoiceStatus)
- **Interfaces**: Domain service contracts
- **Services**: Domain business logic
- **Exceptions**: Custom domain exceptions

### Application Layer
- **DTOs**: Data transfer objects
- **Commands/Queries**: CQRS implementation
- **Services**: Application business logic
- **Interfaces**: Application service contracts
- **Validators**: Input validation rules
- **Mappings**: AutoMapper profiles

### Infrastructure Layer
- **Data**: Entity Framework DbContext and configurations
- **Repositories**: Data access implementations
- **Services**: External service implementations

### Web Layer
- **Controllers**: HTTP request handling
- **Views**: Razor page templates
- **ViewModels**: Presentation models
- **Areas**: Feature-based organization

## 🔒 Security Features

- Password hashing and salting
- Role-based authorization
- CSRF protection
- Input validation and sanitization
- Secure session management

## 📈 Performance Considerations

- Efficient database queries with EF Core
- Client-side calculations for real-time updates
- Optimized data transfer with DTOs
- Lazy loading where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards and write tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- RESTful API for mobile applications
- Advanced reporting with charts and graphs
- Email notifications for low stock
- Barcode scanning integration
- Multi-location inventory support
- Advanced user permissions

---

**Built with ❤️ using Clean Architecture and SOLID principles**