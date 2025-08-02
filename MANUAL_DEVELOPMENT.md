# Manual Development Workflow

This guide explains how to run StockFlow Pro manually using separate commands for backend and frontend, following best practices.

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK installed
- Node.js 18+ installed
- SQL Server running (local or Docker)

### Step 1: Start Backend
```bash
cd StockFlowPro.Web
dotnet run
```
**Backend will be available at:** `http://localhost:5131`

### Step 2: Start Frontend
```bash
cd StockFlowPro.UI
npm run dev
```
**Frontend will be available at:** `http://localhost:5173`

## 🔧 Configuration

### Default Configuration
The project is now configured by default for manual development:

- **Frontend** (`npm run dev`): Automatically connects to `http://localhost:5131`
- **Backend** (`dotnet run`): Runs on `http://localhost:5131`
- **No manual configuration needed** - just run the commands!

### Port Configuration
- **Local .NET HTTP**: `http://localhost:5131` (default profile)
- **Local .NET HTTPS**: `https://localhost:7046` (https profile)
- **Docker**: `http://localhost:5000`

### Smart Environment Detection
The Vite configuration automatically detects and configures the backend:

1. **Environment Variables** (highest priority)
2. **Local .NET Development HTTP** (default - port 5131)
3. **Docker Fallback** (port 5000)

## 📋 Available Commands

### Backend Commands
```bash
# Standard development (HTTP - port 5131)
cd StockFlowPro.Web
dotnet run

# With HTTPS (port 7046)
dotnet run --launch-profile https

# With verbose logging
dotnet run --verbosity detailed

# Run migrations
dotnet ef database update
```

### Frontend Commands
```bash
# Local .NET development (default - connects to port 5131)
cd StockFlowPro.UI
npm run dev

# Docker backend development (connects to port 5000)
npm run dev:docker

# Other commands
npm run build          # Build for production
npm run lint           # Run ESLint
npm run test           # Run tests
npm run type-check     # TypeScript checking
```

## 🔍 Debugging & Monitoring

### Console Output
The configuration provides helpful console output:

**Frontend (Vite):**
```
🔧 Using local .NET development configuration (http://localhost:5131)
📤 API Request: POST /api/auth/login → http://localhost:5131
✅ API Response: 200 /api/auth/login
```

**Backend (.NET):**
```
[AUTH DEBUG] Login attempt for username: admin@stockflowpro.com
[AUTH DEBUG] Authentication successful for user: 123 - admin@stockflowpro.com
```

### Error Handling
If the backend isn't running, you'll see helpful error messages:
```
❌ Proxy error connecting to http://localhost:5131: ECONNREFUSED
💡 Make sure your backend is running:
   cd StockFlowPro.Web && dotnet run
   Backend should be available at: http://localhost:5131
```

### Quick Diagnostics
Run the diagnostic script to check your setup:
```bash
.\check-backend.ps1
```

## 🔄 Switching Between Environments

### For Local .NET Development (Default)
```bash
# Backend (HTTP - port 5131)
cd StockFlowPro.Web
dotnet run

# Frontend
cd StockFlowPro.UI
npm run dev
```

### For Local .NET Development (HTTPS)
```bash
# Backend (HTTPS - port 7046)
cd StockFlowPro.Web
dotnet run --launch-profile https

# Frontend (you'll need to update config for HTTPS)
cd StockFlowPro.UI
# Set environment variable for HTTPS
set VITE_API_BASE_URL=https://localhost:7046/api
npm run dev
```

### For Docker Development
```bash
# Backend (Docker)
docker-compose up -d

# Frontend
cd StockFlowPro.UI
npm run dev:docker
```

### Using Environment Variables
```bash
# Set environment variables for custom configuration
set VITE_API_BASE_URL=http://localhost:5131/api
set VITE_WS_URL=ws://localhost:5131

# Then run frontend
npm run dev
```

## 🛠️ Best Practices Implemented

### 1. **Zero Configuration**
- Default settings work out of the box
- No manual file copying required
- Smart environment detection

### 2. **Clear Feedback**
- Helpful console messages
- Error messages with solutions
- Visual indicators for API requests/responses

### 3. **Flexible Configuration**
- Environment variables override defaults
- Easy switching between backends
- Graceful fallbacks

### 4. **Developer Experience**
- Fast startup times
- Hot reload for both frontend and backend
- Comprehensive error handling

### 5. **Production Ready**
- Same configuration works for production builds
- Environment-specific optimizations
- Security best practices

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check .NET SDK
dotnet --version

# Trust development certificates (for HTTPS)
dotnet dev-certs https --trust

# Check database connection
dotnet ef database update
```

### Frontend Connection Issues
```bash
# Check if backend is running
curl http://localhost:5131/health

# Run diagnostics
.\check-backend.ps1

# Clear browser cache
# F12 → Application → Storage → Clear All

# Check environment configuration
echo $VITE_API_BASE_URL
```

### Port Conflicts
```bash
# Check what's using ports
netstat -an | findstr :5131
netstat -an | findstr :5173

# Kill conflicting processes
taskkill /PID <PID> /F
```

### Common Issues

#### "ERR_CONNECTION_REFUSED" on port 7046
**Problem**: Frontend trying to connect to HTTPS port but backend running on HTTP port
**Solution**: 
```bash
# Either start backend with HTTP (recommended)
cd StockFlowPro.Web
dotnet run

# OR start backend with HTTPS and update frontend
dotnet run --launch-profile https
# Then set: VITE_API_BASE_URL=https://localhost:7046/api
```

#### "ERR_CONNECTION_REFUSED" on port 5131
**Problem**: Backend not running
**Solution**:
```bash
cd StockFlowPro.Web
dotnet run
```

## 📊 Performance Tips

### Backend Optimization
- Use `dotnet run` for HTTP (faster startup)
- Use `dotnet watch run` for hot reload
- Use in-memory database for faster development

### Frontend Optimization
- Vite provides fast hot module replacement
- TypeScript checking runs in parallel
- Optimized proxy configuration reduces latency

## 🎯 Development Workflow

### Typical Development Session
1. **Start Backend**: `cd StockFlowPro.Web && dotnet run`
2. **Start Frontend**: `cd StockFlowPro.UI && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Develop**: Make changes and see them reflected immediately
5. **Test**: Use browser dev tools and backend console for debugging

### Code Changes
- **Frontend**: Hot reload automatically updates the browser
- **Backend**: Restart `dotnet run` to see changes (or use `dotnet watch run`)
- **Database**: Run `dotnet ef database update` after schema changes

## 🚀 Production Deployment

The same configuration works for production:

```bash
# Build frontend
cd StockFlowPro.UI
npm run build

# Run backend in production mode
cd StockFlowPro.Web
dotnet run --configuration Release
```

## 📝 Summary

This manual development setup provides:

✅ **Simple Commands**: Just `dotnet run` and `npm run dev`  
✅ **Smart Configuration**: Automatic backend detection  
✅ **Clear Feedback**: Helpful console messages  
✅ **Best Practices**: Following .NET and React conventions  
✅ **Flexible**: Easy switching between environments  
✅ **Production Ready**: Same config for dev and prod  
✅ **Correct Ports**: HTTP on 5131, Docker on 5000  

No scripts, no complex setup - just the standard development commands with the correct port configuration!