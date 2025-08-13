# Docker Compose Watch Configuration

This project now includes Docker Compose Watch functionality for automatic rebuilds during development.

## What's Configured

### Backend (ASP.NET Core)
- **Action**: `rebuild` - Full container rebuild when changes are detected
- **Watched paths**:
  - All C# projects (`StockFlowPro.Web`, `StockFlowPro.Application`, `StockFlowPro.Domain`, `StockFlowPro.Infrastructure`, `StockFlowPro.Shared`)
  - Project files (`.csproj`, `.sln`)
  - Configuration files (`Directory.*.props`, `global.json`, `nuget.config`)
- **Ignored**: `bin/`, `obj/`, and `App_Data/` folders

### Frontend (React/TypeScript)
- **Action**: `sync` - Fast file synchronization with hot reload
- **Watched paths**:
  - Source files (`./StockFlowPro.UI/src/`)
  - Public assets (`./StockFlowPro.UI/public/`)
- **Action**: `rebuild` - Full rebuild for configuration changes
- **Watched paths**:
  - Package files (`package.json`, `package-lock.json`)
  - Build configuration (`vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, etc.)

## How to Use

### Option 1: Using the provided scripts (Recommended)

**Windows:**
```bash
./docker-watch.bat
```

**Linux/Mac:**
```bash
chmod +x docker-watch.sh
./docker-watch.sh
```

### Option 2: Direct command

```bash
docker compose watch
```

## What Happens

1. **Frontend changes**: Files are synced instantly, Vite hot reload works
2. **Backend changes**: Container rebuilds automatically (takes 30-60 seconds)
3. **Configuration changes**: Full rebuild triggered

## Benefits

- ✅ No need to manually rebuild after code changes
- ✅ Frontend hot reload still works
- ✅ Backend automatically rebuilds on C# changes
- ✅ Faster development cycle
- ✅ Automatic dependency installation when package files change

## Stopping

Press `Ctrl+C` to stop the watch mode and all containers.

## Notes

- Initial startup takes the same time as regular `docker compose up`
- Frontend changes are nearly instant (sync action)
- Backend changes trigger a rebuild (30-60 seconds)
- Make sure Docker Desktop is updated to the latest version for best compatibility
