# 🐳 StockFlow Pro Docker Setup

Complete Docker containerization for the StockFlow Pro inventory management system with .NET 8 backend and React TypeScript frontend.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)
- 8GB+ RAM recommended

### One-Command Setup
```bash
# Windows
.\start-development.bat

# PowerShell/Linux/Mac
.\start-development.ps1
```

This will start:
- **Frontend**: http://localhost:3000 (React TypeScript)
- **API**: http://localhost:5000 (.NET 8 Web API)
- **Swagger**: http://localhost:5000/swagger (API Documentation)
- **Database**: localhost:1433 (SQL Server)
- **Redis**: localhost:6379 (Caching & SignalR)
- **MailHog**: http://localhost:8025 (Email testing)

## 📁 Docker Configuration Files

```
StockFlow-Pro/
├── docker-compose.yml              # Main application stack
├── docker-compose.override.yml     # Development overrides
├── docker-compose.prod.yml         # Production configuration
├── docker-compose.monitoring.yml   # Monitoring stack (existing)
├── .dockerignore                   # Docker build exclusions
├── .env.docker                     # Environment template
├── StockFlowPro.Web/
│   └── Dockerfile                  # .NET 8 API container
├── StockFlowPro.UI/
│   ├── Dockerfile                  # React frontend container
│   └── nginx.conf                  # Nginx configuration
├── nginx/
│   └── nginx.conf                  # Reverse proxy configuration
├── database/
│   └── init/
│       └── 01-create-database.sql  # Database initialization
└── scripts/
    ├── start-development.bat       # Windows startup
    └── start-development.ps1       # PowerShell startup
```

## 🛠️ Available Commands

### Development
```bash
# Start development environment
docker-compose up -d

# Start with logs
docker-compose up

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f stockflow-api
docker-compose logs -f stockflow-frontend
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale stockflow-api=3
```

### Monitoring
```bash
# Start monitoring stack (existing)
docker-compose -f docker-compose.monitoring.yml up -d

# Start everything (app + monitoring)
docker-compose up -d && docker-compose -f docker-compose.monitoring.yml up -d
```

## 🔧 Environment Configuration

### Development (.env)
```bash
# Copy template and customize
cp .env.docker .env

# Key settings
DB_PASSWORD=StockFlow123!
JWT_SECRET_KEY=your-secret-key
REDIS_PASSWORD=StockFlowRedis123!
ASPNETCORE_ENVIRONMENT=Development
```

### Production
```bash
# Use environment variables or Docker secrets
export DB_PASSWORD="your-secure-password"
export JWT_SECRET_KEY="your-production-jwt-secret"
export REDIS_PASSWORD="your-redis-password"
```

## 🏗️ Architecture Overview

### Container Stack
```
┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Monitoring    │
│   (Port 80)     │    │   (Grafana)     │
└─────────────────┘    └─────────────────┘
         │                       │
┌─────────────────┐    ┌─────────────────┐
│ React Frontend  │    │ Prometheus      │
│   (Port 3000)   │    │ AlertManager    │
└─────────────────┘    └─────────────────┘
         │
┌─────────────────┐    ┌─────────────────┐
│  .NET 8 API     │────│   SQL Server    │
│   (Port 5000)   │    │   (Port 1433)   │
└─────────────────┘    └─────────────────┘
         │
┌─────────────────┐
│     Redis       │
│   (Port 6379)   │
└─────────────────┘
```

### Network Communication
- **Frontend** → **API**: HTTP/HTTPS + SignalR WebSockets
- **API** → **Database**: SQL Server connection
- **API** → **Redis**: Caching and SignalR backplane
- **Nginx** → **All Services**: Reverse proxy with load balancing

## 🔍 Service Details

### StockFlow API (.NET 8)
- **Image**: Custom build from `StockFlowPro.Web/Dockerfile`
- **Ports**: 5000 (HTTP), 5001 (HTTPS)
- **Health Check**: `/health` endpoint
- **Features**: 
  - Entity Framework Core with SQL Server
  - SignalR for real-time updates
  - JWT + Cookie authentication
  - Swagger documentation
  - Prometheus metrics

### StockFlow Frontend (React)
- **Image**: Custom build from `StockFlowPro.UI/Dockerfile`
- **Port**: 3000
- **Features**:
  - TypeScript + Vite
  - Nginx serving static files
  - API proxy configuration
  - Hot reload in development

### SQL Server Database
- **Image**: `mcr.microsoft.com/mssql/server:2022-latest`
- **Port**: 1433
- **Credentials**: sa/StockFlow123! (development)
- **Features**:
  - Persistent data storage
  - Automatic database creation
  - Health checks
  - Backup support

### Redis Cache
- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Features**:
  - Session storage
  - SignalR backplane
  - Application caching
  - Persistent data

## 🔒 Security Features

### Development
- Container isolation
- Network segmentation
- Non-root user execution
- Health checks
- Resource limits

### Production
- SSL/TLS termination
- Rate limiting
- Security headers
- Secret management
- Multi-replica deployment

## 📊 Monitoring Integration

The Docker setup integrates seamlessly with the existing monitoring stack:

```bash
# Start application
docker-compose up -d

# Start monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Access monitoring
# Grafana: http://localhost:3000
# Prometheus: http://localhost:9090
# AlertManager: http://localhost:9093
```

### Metrics Collected
- Application performance (API response times)
- Database connections and queries
- Redis cache hit/miss ratios
- Container resource usage
- Business metrics (inventory levels, user activity)

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -an | findstr :3000
netstat -an | findstr :5000
netstat -an | findstr :1433

# Stop conflicting services
docker-compose down
```

#### Database Connection Issues
```bash
# Check database logs
docker-compose logs stockflow-db

# Connect to database manually
docker exec -it stockflow-database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P StockFlow123!
```

#### Build Failures
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up -d --build
```

#### Memory Issues
```bash
# Check resource usage
docker stats

# Increase Docker Desktop memory allocation
# Settings → Resources → Memory → 8GB+
```

### Health Checks
```bash
# Check all service health
docker-compose ps

# Individual service health
curl http://localhost:5000/health
curl http://localhost:3000/health
```

### Logs and Debugging
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f stockflow-api

# Follow new logs only
docker-compose logs -f --tail=0

# Container shell access
docker exec -it stockflow-api /bin/bash
docker exec -it stockflow-frontend /bin/sh
```

## 🔄 Development Workflow

### Frontend Development Options

The frontend can be run in two modes:

#### 1. Docker Development (Default)
```bash
# Start full Docker stack
docker-compose up -d

# Start frontend for Docker backend
cd StockFlowPro.UI
.\start-dev-docker.bat  # or npm run dev:docker
```

#### 2. Local .NET Development
```bash
# Start .NET backend locally
cd StockFlowPro.Web
dotnet run --launch-profile https

# Start frontend for local backend
cd StockFlowPro.UI
.\start-dev-local.bat  # or npm run dev:local
```

See `StockFlowPro.UI/DEVELOPMENT.md` for detailed frontend setup instructions.

### Hot Reload Setup
Development containers support hot reload:
- **API**: File changes trigger automatic rebuild
- **Frontend**: Vite hot module replacement
- **Database**: Schema changes via EF migrations

### Database Migrations
```bash
# Run migrations in container
docker exec stockflow-api dotnet ef database update

# Generate new migration
docker exec stockflow-api dotnet ef migrations add NewMigration
```

### Testing
```bash
# Run tests in containers
docker exec stockflow-api dotnet test
docker exec stockflow-frontend npm test
```

## 🚀 Deployment

### Staging/Production
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With monitoring
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.monitoring.yml up -d
```

### Scaling
```bash
# Scale API instances
docker-compose up -d --scale stockflow-api=3

# Scale frontend instances
docker-compose up -d --scale stockflow-frontend=2
```

### Updates
```bash
# Update images
docker-compose pull

# Restart with new images
docker-compose up -d
```

## ���� Performance Optimization

### Resource Limits
Production containers have defined resource limits:
- **API**: 1 CPU, 1GB RAM
- **Frontend**: 0.5 CPU, 256MB RAM
- **Database**: 2 CPU, 4GB RAM

### Caching Strategy
- **Redis**: Application data caching
- **Nginx**: Static file caching
- **Browser**: Asset caching with proper headers

### Database Optimization
- Connection pooling
- Query optimization
- Index management
- Backup strategies

## 🆘 Support

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [.NET Docker Guide](https://docs.microsoft.com/en-us/dotnet/core/docker/)
- [React Docker Guide](https://create-react-app.dev/docs/deployment/#docker)

### StockFlow Pro Specific
- Check existing monitoring documentation
- Review API documentation at `/swagger`
- Consult application logs for business logic issues

---

## 🎉 Success!

Your StockFlow Pro application is now fully containerized with:
- ✅ Complete development environment
- ✅ Production-ready configuration
- ✅ Integrated monitoring
- ✅ Hot reload support
- ✅ Database persistence
- ✅ Security best practices
- ✅ Scalability features

Start developing with confidence! 🚀