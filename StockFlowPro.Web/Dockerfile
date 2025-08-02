# Use the official .NET 8 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Use the official .NET 8 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files in dependency order for better layer caching
COPY ["Directory.Build.props", "."]
COPY ["Directory.Packages.props", "."]
COPY ["global.json", "."]
COPY ["nuget.config", "."]

# Copy project files
COPY ["StockFlowPro.Domain/StockFlowPro.Domain.csproj", "StockFlowPro.Domain/"]
COPY ["StockFlowPro.Shared/StockFlowPro.Shared.csproj", "StockFlowPro.Shared/"]
COPY ["StockFlowPro.Application/StockFlowPro.Application.csproj", "StockFlowPro.Application/"]
COPY ["StockFlowPro.Infrastructure/StockFlowPro.Infrastructure.csproj", "StockFlowPro.Infrastructure/"]
COPY ["StockFlowPro.Web/StockFlowPro.Web.csproj", "StockFlowPro.Web/"]

# Restore dependencies
RUN dotnet restore "StockFlowPro.Web/StockFlowPro.Web.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/StockFlowPro.Web"
RUN dotnet build "StockFlowPro.Web.csproj" -c Release -o /app/build --no-restore

# Publish the application
FROM build AS publish
WORKDIR "/src/StockFlowPro.Web"
RUN dotnet publish "StockFlowPro.Web.csproj" -c Release -o /app/publish --no-restore

# Final stage - runtime image
FROM base AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Create directories for data and uploads
RUN mkdir -p /app/App_Data /app/wwwroot/uploads

# Set permissions
RUN chown -R app:app /app
USER app

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Set entry point
ENTRYPOINT ["dotnet", "StockFlowPro.Web.dll"]