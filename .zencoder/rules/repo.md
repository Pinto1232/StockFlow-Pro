---
description: Repository Information Overview
alwaysApply: true
---

# StockFlow-Pro Information

## Summary
StockFlow-Pro is a full-stack application for stock flow management, built with a .NET 8 backend and React 19 frontend. It follows a clean architecture pattern with separate domain, application, infrastructure, and presentation layers.

## Structure
- **StockFlowPro.Domain**: Core domain entities and business logic
- **StockFlowPro.Application**: Application services, interfaces, and DTOs
- **StockFlowPro.Infrastructure**: Data access, external services integration
- **StockFlowPro.Web**: ASP.NET Core Web API backend
- **StockFlowPro.UI**: React TypeScript frontend
- **StockFlowPro.*.Tests**: Test projects for each component

## Projects

### Backend (.NET Core API)
**Configuration File**: StockFlowPro.Web.csproj

#### Language & Runtime
**Language**: C#
**Version**: .NET 8.0 (SDK 8.0.206)
**Build System**: MSBuild
**Package Manager**: NuGet (Centralized package management)

#### Dependencies
**Main Dependencies**:
- Entity Framework Core 9.0.6
- MediatR 11.1.0
- AutoMapper 12.0.1
- FluentValidation 11.11.0
- Swashbuckle.AspNetCore 6.5.0
- DotNetEnv 3.1.1

#### Build & Installation
```bash
dotnet restore
dotnet build
dotnet run --project StockFlowPro.Web/StockFlowPro.Web.csproj
```

#### Docker
**Dockerfile**: StockFlowPro.Web/Dockerfile
**Image**: ASP.NET Core 8.0 (Debian Bookworm Slim)
**Configuration**: Multi-stage build with security hardening

#### Testing
**Framework**: xUnit 2.7.0
**Test Location**: StockFlowPro.*.Tests projects
**Naming Convention**: *Tests.cs
**Run Command**:
```bash
dotnet test
```

### Frontend (React)
**Configuration File**: StockFlowPro.UI/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js 20.18.2
**Build System**: Vite 6.3.5
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- React 19.1.0
- React Router 7.7.0
- Axios 1.10.0
- TanStack Query 5.83.0
- SignalR 8.0.7
- TailwindCSS 3.4.15

#### Build & Installation
```bash
cd StockFlowPro.UI
npm install
npm run dev
```

#### Docker
**Dockerfile**: StockFlowPro.UI/Dockerfile.dev
**Image**: Node 20.18.2 (Debian Bullseye Slim)
**Configuration**: Development environment with security hardening

#### Testing
**Framework**: Vitest 3.2.4
**Test Location**: src/**/*.test.ts, src/**/*.test.tsx
**Run Command**:
```bash
npm test
```

## Docker Deployment
The application uses Docker Compose for local development and production deployment with the following services:
- **stockflow-db**: SQL Server database
- **redis**: Redis cache
- **mailhog**: Email testing service
- **stockflow-api**: .NET Core backend API
- **stockflow-frontend**: React frontend
- **stockflow-nginx**: Nginx reverse proxy

Run with:
```bash
docker-compose up -d
```

For production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```---
description: Repository Information Overview
alwaysApply: true
---

# StockFlow-Pro Information

## Summary
StockFlow-Pro is a full-stack application for stock flow management, built with a .NET 8 backend and React 19 frontend. It follows a clean architecture pattern with separate domain, application, infrastructure, and presentation layers.

## Structure
- **StockFlowPro.Domain**: Core domain entities and business logic
- **StockFlowPro.Application**: Application services, interfaces, and DTOs
- **StockFlowPro.Infrastructure**: Data access, external services integration
- **StockFlowPro.Web**: ASP.NET Core Web API backend
- **StockFlowPro.UI**: React TypeScript frontend
- **StockFlowPro.*.Tests**: Test projects for each component

## Projects

### Backend (.NET Core API)
**Configuration File**: StockFlowPro.Web.csproj

#### Language & Runtime
**Language**: C#
**Version**: .NET 8.0 (SDK 8.0.206)
**Build System**: MSBuild
**Package Manager**: NuGet (Centralized package management)

#### Dependencies
**Main Dependencies**:
- Entity Framework Core 9.0.6
- MediatR 11.1.0
- AutoMapper 12.0.1
- FluentValidation 11.11.0
- Swashbuckle.AspNetCore 6.5.0
- DotNetEnv 3.1.1

#### Build & Installation
```bash
dotnet restore
dotnet build
dotnet run --project StockFlowPro.Web/StockFlowPro.Web.csproj
```

#### Docker
**Dockerfile**: StockFlowPro.Web/Dockerfile
**Image**: ASP.NET Core 8.0 (Debian Bookworm Slim)
**Configuration**: Multi-stage build with security hardening

#### Testing
**Framework**: xUnit 2.7.0
**Test Location**: StockFlowPro.*.Tests projects
**Naming Convention**: *Tests.cs
**Run Command**:
```bash
dotnet test
```

### Frontend (React)
**Configuration File**: StockFlowPro.UI/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js 20.18.2
**Build System**: Vite 6.3.5
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- React 19.1.0
- React Router 7.7.0
- Axios 1.10.0
- TanStack Query 5.83.0
- SignalR 8.0.7
- TailwindCSS 3.4.15

#### Build & Installation
```bash
cd StockFlowPro.UI
npm install
npm run dev
```

#### Docker
**Dockerfile**: StockFlowPro.UI/Dockerfile.dev
**Image**: Node 20.18.2 (Debian Bullseye Slim)
**Configuration**: Development environment with security hardening

#### Testing
**Framework**: Vitest 3.2.4
**Test Location**: src/**/*.test.ts, src/**/*.test.tsx
**Run Command**:
```bash
npm test
```

## Docker Deployment
The application uses Docker Compose for local development and production deployment with the following services:
- **stockflow-db**: SQL Server database
- **redis**: Redis cache
- **mailhog**: Email testing service
- **stockflow-api**: .NET Core backend API
- **stockflow-frontend**: React frontend
- **stockflow-nginx**: Nginx reverse proxy

Run with:
```bash
docker-compose up -d
```

For production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```