# StockFlow Pro

## ๐ Quick Start

From the project root folder (`StockFlow-Pro`), run the following commands:

```bash
cd StockFlowPro.Web
dotnet watch run
```

This will start the web application with hot reload enabled.

---

A comprehensive inventory management system built with .NET Core and Razor Pages, following Clean Architecture principles and SOLID design patterns.

## ๐ Project Overview

StockFlow Pro is a robust inventory management system designed to handle product tracking, invoice management, and comprehensive reporting. The system supports role-based access control with three distinct user roles, ensuring secure and efficient operations.

## โจ Key Features

### ๐ Authentication & Authorization
- Secure user authentication and registration
- Role-based access control (Admin, User, Manager)
- User profile management

### ๐ฅ User Management
- **Admin**: Full CRUD operations on users
- **User**: Basic access to core functionality
- **Manager**: Enhanced access with reporting capabilities

### ๐ฆ Product Management
- Complete product inventory tracking
- Stock level monitoring
- Cost per item management
- Product naming and categorization

### ๐งพ Invoice System
- Create and edit invoices
- Real-time total calculation (client-side)
- Invoice item management
- Date and user tracking

### ๐ Reporting & Analytics
- Items sold per product analysis
- Total product count tracking
- Products sold vs. in-stock comparison
- Comprehensive stock level reports

### โ ๏ธ Smart Notifications
- Automated restock alerts for managers
- Low inventory warnings
- Consolidated notification system

## ๐๏ธ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
StockFlowPro/
โโโ StockFlowPro.Domain/          # Core business logic and entities
โโโ StockFlowPro.Application/     # Use cases and application services
โโโ StockFlowPro.Infrastructure/  # Data access and external services
โโโ StockFlowPro.Web/            # Presentation layer (Razor Pages)
โโโ Tests/                       # Comprehensive test suite
```

### ๐ฏ Design Principles

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Architecture**: Dependency inversion with clear layer boundaries
- **Domain-Driven Design**: Rich domain models with business logic encapsulation
- **CQRS Pattern**: Command Query Responsibility Segregation using MediatR
- **Repository Pattern**: Data access abstraction
- **Unit of Work**: Transaction management

## ๐ ๏ธ Technology Stack

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

## ๐ฆ Getting Started

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

## ๐งช Testing

Run the comprehensive test suite:

```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test StockFlowPro.Domain.Tests
```

## ๐ Project Structure

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

## ๐โโ๏ธ How to Run the Application

From the project root folder (`StockFlow-Pro`), run the following commands:

```bash
cd StockFlowPro.Web
dotnet watch run
```

This will start the web application with hot reload enabled.

## ๐ Security Features

- Password hashing and salting
- Role-based authorization
- CSRF protection
- Input validation and sanitization
- Secure session management

## ๐ Performance Considerations

- Efficient database queries with EF Core
- Client-side calculations for real-time updates
- Optimized data transfer with DTOs
- Lazy loading where appropriate

## ๐ GitHub Configuration for StockFlow Pro

### Repository Setup
1. **Initialize Git repository** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Connect to GitHub repository**
   ```bash
   git remote add origin https://github.com/yourusername/StockFlow-Pro.git
   git branch -M main
   git push -u origin main
   ```

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature branches
- **hotfix/***: Critical bug fixes

### Recommended Git Workflow
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push feature branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# After review and merge, clean up
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

### GitHub Actions (CI/CD)
Create `.github/workflows/dotnet.yml` for automated testing:
```yaml
name: .NET Core CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    - name: Restore dependencies
      run: dotnet restore
    - name: Build
      run: dotnet build --no-restore
    - name: Test
      run: dotnet test --no-build --verbosity normal
```

### Issue Templates
Create issue templates in `.github/ISSUE_TEMPLATE/`:
- Bug reports
- Feature requests
- Documentation improvements

### Pull Request Template
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## ๐ค Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards and write tests
4. Submit a pull request

## login credentials
username: admin password: admin

## ๐ License

This project is licensed under the MIT License - see the LICENSE file for details.

## ๐ฏ Future Enhancements

- RESTful API for mobile applications
- Advanced reporting with charts and graphs
- Email notifications for low stock
- Barcode scanning integration
- Multi-location inventory support
- Advanced user permissions

---

**Built with โค๏ธ using Clean Architecture and SOLID principles**
## ํดง Environment Configuration

This project now supports environment-based configuration using `.env` files for better security and flexibility.

**Quick Setup:**
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration values
```

ํณ **For detailed setup instructions, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)**
