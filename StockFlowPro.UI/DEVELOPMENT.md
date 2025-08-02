# Frontend Development Setup

This document explains how to run the frontend in different development environments.

## Development Modes

The frontend can be configured to work with two different backend setups:

### 1. Docker Development (Default)
- **Backend URL**: `http://localhost:5000`
- **Use when**: Running the full stack with `docker-compose`
- **Backend command**: `docker-compose up -d`

### 2. Local .NET Development
- **Backend URL**: `https://localhost:7046`
- **Use when**: Running the .NET backend directly with `dotnet run`
- **Backend command**: `cd StockFlowPro.Web && dotnet run --launch-profile https`

## Quick Start

### Option 1: Using Scripts (Recommended)

**For Docker Development:**
```bash
# Windows Batch
.\start-dev-docker.bat

# PowerShell
.\start-dev-docker.ps1

# NPM
npm run dev:docker
```

**For Local .NET Development:**
```bash
# Windows Batch
.\start-dev-local.bat

# PowerShell
.\start-dev-local.ps1

# NPM
npm run dev:local
```

### Option 2: Manual Configuration

1. **Copy the appropriate environment file:**
   ```bash
   # For Docker development
   copy .env.development.docker .env.local

   # For Local .NET development
   copy .env.development.local .env.local
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

## Environment Files

- `.env.development` - Default configuration (Docker)
- `.env.development.docker` - Docker backend configuration
- `.env.development.local` - Local .NET backend configuration
- `.env.local` - Active configuration (auto-generated, gitignored)

## Troubleshooting

### Connection Refused Errors

If you see `ERR_CONNECTION_REFUSED` errors:

1. **Check which backend you're trying to connect to:**
   - Look at the URL in the error (e.g., `:7046` vs `:5000`)

2. **Ensure the backend is running:**
   - **Docker**: `docker-compose ps` should show `stockflow-api` as running
   - **Local .NET**: Check that `dotnet run` is active in StockFlowPro.Web

3. **Use the correct frontend configuration:**
   - **For Docker**: Use `start-dev-docker.bat` or `npm run dev:docker`
   - **For Local .NET**: Use `start-dev-local.bat` or `npm run dev:local`

### Port Conflicts

- **Frontend**: Runs on `http://localhost:5173` (Vite default)
- **Docker API**: Runs on `http://localhost:5000`
- **Local .NET API**: Runs on `https://localhost:7046`

### HTTPS/SSL Issues

When using local .NET development:
- The backend uses HTTPS (`https://localhost:7046`)
- You may need to accept the self-signed certificate
- Run `dotnet dev-certs https --trust` if needed

## Development Workflow

### Full Stack Docker Development
1. Start Docker stack: `docker-compose up -d`
2. Start frontend: `.\start-dev-docker.bat`
3. Access app: `http://localhost:5173`

### Local .NET Development
1. Start .NET backend: `cd StockFlowPro.Web && dotnet run --launch-profile https`
2. Start frontend: `.\start-dev-local.bat`
3. Access app: `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with current .env.local
- `npm run dev:docker` - Configure for Docker and start dev server
- `npm run dev:local` - Configure for local .NET and start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## API Endpoints

The frontend will proxy API requests to the configured backend:

- **Authentication**: `/api/auth/*`
- **CSRF**: `/api/csrf/*`
- **SignalR Hub**: `/stockflowhub` (WebSocket)

## Notes

- The `.env.local` file is automatically generated and should not be committed
- Environment files are loaded in this order: `.env.local` > `.env.development` > `.env`
- Vite automatically reloads when environment files change