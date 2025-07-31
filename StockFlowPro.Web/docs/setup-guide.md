# StockFlow Pro Setup Guide

## Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or VS Code

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/stockflow-pro.git
   cd stockflow-pro
   ```

2. **Configure Database**
   - Update connection string in `appsettings.json`
   - Run database migrations:
   ```bash
   dotnet ef database update
   ```

3. **Install Dependencies**
   ```bash
   dotnet restore
   ```

4. **Run the Application**
   ```bash
   dotnet run --project StockFlowPro.Web
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=StockFlowPro;Trusted_Connection=true;
```

## First Time Setup

1. Navigate to `http://localhost:5131`
2. Register an admin account
3. Configure your inventory categories
4. Import initial product data

## Troubleshooting

### Common Issues

- **Database Connection Failed**: Check your connection string
- **Port Already in Use**: Change the port in `launchSettings.json`
- **Migration Errors**: Delete the database and run migrations again