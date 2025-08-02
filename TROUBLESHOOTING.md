# StockFlow Pro - Local Development Troubleshooting

This guide helps resolve common issues when running StockFlow Pro in local development mode.

## Quick Start for Local Development

### Option 1: Automated Setup
```bash
# Windows Batch
.\start-local-development.bat

# PowerShell
.\start-local-development.ps1
```

### Option 2: Manual Setup
```bash
# Terminal 1: Start Backend
cd StockFlowPro.Web
dotnet run --launch-profile https

# Terminal 2: Start Frontend
cd StockFlowPro.UI
.\start-dev-local.bat
# OR
npm run dev:local
```

## Common Issues and Solutions

### 1. Connection Refused Errors (ERR_CONNECTION_REFUSED)

**Symptoms:**
- Frontend shows `Failed to load resource: net::ERR_CONNECTION_REFUSED`
- API calls to `:7046` or `:5000` fail

**Solutions:**

#### Check Backend Status
```bash
# Test if backend is running
.\test-backend.ps1

# Or manually check
curl https://localhost:7046/health
```

#### Verify Environment Configuration
```bash
# Check frontend environment
cd StockFlowPro.UI
type .env.local

# Should show:
# VITE_API_BASE_URL=https://localhost:7046/api
# VITE_WS_URL=wss://localhost:7046
```

#### Fix Environment Configuration
```bash
# For local .NET development
cd StockFlowPro.UI
copy .env.development.local .env.local

# For Docker development
copy .env.development.docker .env.local
```

### 2. HTTPS/SSL Certificate Issues

**Symptoms:**
- SSL certificate errors
- "This site is not secure" warnings
- HTTPS connection failures

**Solutions:**

#### Trust Development Certificates
```bash
# Trust .NET development certificates
dotnet dev-certs https --trust

# Clean and recreate certificates if needed
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

#### Verify Certificate Installation
```bash
# Check certificate status
dotnet dev-certs https --check --trust
```

### 3. Port Conflicts

**Symptoms:**
- "Port already in use" errors
- Services fail to start

**Solutions:**

#### Check Port Usage
```bash
# Windows
netstat -an | findstr :7046
netstat -an | findstr :5173

# PowerShell
Get-NetTCPConnection -LocalPort 7046
Get-NetTCPConnection -LocalPort 5173
```

#### Kill Conflicting Processes
```bash
# Find and kill process using port 7046
netstat -ano | findstr :7046
taskkill /PID <PID> /F
```

### 4. Database Connection Issues

**Symptoms:**
- Backend fails to start
- Database-related errors in logs
- Authentication failures

**Solutions:**

#### Check SQL Server Status
```bash
# If using local SQL Server
services.msc
# Look for SQL Server services

# If using Docker for database
docker ps
docker-compose logs stockflow-db
```

#### Update Connection String
Edit `StockFlowPro.Web/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=StockFlowProDB;Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true;"
  }
}
```

#### Run Database Migrations
```bash
cd StockFlowPro.Web
dotnet ef database update
```

### 5. CORS Issues

**Symptoms:**
- CORS policy errors in browser console
- API calls blocked by browser

**Solutions:**

#### Verify CORS Configuration
The backend should automatically use `DevelopmentCors` policy in development mode, which allows:
- `http://localhost:5173` (Vite dev server)
- `https://localhost:5173`
- `http://localhost:3000`

#### Check Browser Console
Look for CORS-related error messages and verify the origin matches the allowed origins.

### 6. Authentication/Authorization Issues

**Symptoms:**
- Infinite redirect loops
- "Authentication required" messages
- Login successful but still redirected to login

**Solutions:**

#### Clear Browser Data
```bash
# Clear cookies, localStorage, and sessionStorage
# In browser: F12 → Application → Storage → Clear All
```

#### Check Authentication Flow
1. Login should set authentication cookies
2. Subsequent requests should include cookies
3. Backend should recognize authenticated state

#### Verify Cookie Settings
Check browser developer tools → Application → Cookies for:
- `StockFlowProAuth` cookie
- Proper domain and path settings

### 7. Frontend Build Issues

**Symptoms:**
- Vite build failures
- TypeScript compilation errors
- Module resolution issues

**Solutions:**

#### Clear Node Modules
```bash
cd StockFlowPro.UI
rm -rf node_modules package-lock.json
npm install
```

#### Check Node.js Version
```bash
node --version
# Should be Node.js 18+ for Vite 6
```

#### Update Dependencies
```bash
npm update
```

## Environment-Specific Configurations

### Local .NET Development
- **Backend**: `https://localhost:7046`
- **Frontend**: `http://localhost:5173`
- **Environment File**: `.env.development.local`

### Docker Development
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000` (in container) or `http://localhost:5173` (local dev)
- **Environment File**: `.env.development.docker`

## Debugging Tools

### Backend Debugging
```bash
# Run with verbose logging
cd StockFlowPro.Web
dotnet run --launch-profile https --verbosity detailed

# Check application logs
# Logs appear in console output
```

### Frontend Debugging
```bash
# Run with debug output
cd StockFlowPro.UI
npm run dev -- --debug

# Check browser console for:
# - Network requests
# - Authentication state
# - API responses
```

### Network Debugging
```bash
# Test API endpoints directly
curl -k https://localhost:7046/health
curl -k https://localhost:7046/api/auth/available-roles

# Test with authentication
curl -k -X POST https://localhost:7046/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@stockflowpro.com","password":"Admin123!"}'
```

## Performance Optimization

### Development Mode Optimizations
1. **Disable unnecessary middleware** in development
2. **Use in-memory database** for faster startup
3. **Enable hot reload** for both frontend and backend
4. **Optimize Vite configuration** for faster builds

### Memory Usage
- **Backend**: Typically uses 100-200MB
- **Frontend**: Vite dev server uses 50-100MB
- **Database**: SQL Server LocalDB uses 200-500MB

## Getting Help

### Log Locations
- **Backend Logs**: Console output when running `dotnet run`
- **Frontend Logs**: Browser console (F12)
- **Vite Logs**: Terminal where `npm run dev` is running

### Common Log Messages
- `[AUTH DEBUG]`: Authentication-related debugging
- `[HOME DEBUG]`: Home controller routing
- `[SWAGGER DEBUG]`: Swagger access attempts

### Support Resources
1. Check `StockFlowPro.UI/DEVELOPMENT.md` for frontend-specific issues
2. Review `DOCKER_README.md` for containerized development
3. Examine `BEST_PRACTICES.md` for architectural guidance

## Quick Fixes Checklist

When experiencing issues, try these in order:

1. ✅ **Restart both backend and frontend**
2. ✅ **Clear browser cache and cookies**
3. ✅ **Verify environment files are correct**
4. ✅ **Check if all required services are running**
5. ✅ **Trust SSL certificates**: `dotnet dev-certs https --trust`
6. ✅ **Update database**: `dotnet ef database update`
7. ✅ **Reinstall frontend dependencies**: `npm install`
8. ✅ **Check port availability**
9. ✅ **Review console logs for specific errors**
10. ✅ **Test backend connectivity**: `.\test-backend.ps1`

If issues persist, check the specific error messages in browser console and backend logs for more targeted troubleshooting.