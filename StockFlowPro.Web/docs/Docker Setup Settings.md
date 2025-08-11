# Docker Development Setup and Routing Notes

## CORS alignment for Nginx proxy

- Problem: Backend CORS policies did not include http://localhost:8080 (Nginx dev).
- Fix: Added http://localhost:8080 and http://127.0.0.1:8080 to AllowFrontend and added port 8080 to the DevelopmentCors allowed ports.

## Healthchecks and minor cleanups

- Converted healthchecks to CMD-SHELL for reliability.
- Removed Redis empty requirepass ("") which forces AUTH with an empty password; now using redis-server with appendonly yes for dev.
- Cleaned nginx volume mounts in docker-compose (removed dist mount since we proxy to Vite in dev).

## What now works and where

- Frontend (dev via Nginx proxy): http://localhost:8080
  - Nginx proxies to the Vite dev server (stockflow-frontend:5173)
  - HMR and assets work through Nginx
- Frontend (direct dev server): http://localhost:5173
- Backend API:
  - Direct: http://localhost:5000/api
  - Via Nginx proxy: http://localhost:8080/api
- SignalR:
  - WebSocket via Nginx: ws://localhost:8080/stockflowhub
  - Direct: ws://localhost:5000/stockflowhub
- Swagger (dev only; note your middleware returns 401 if not authenticated):
  - http://localhost:8080/swagger/ (proxied)
  - http://localhost:5000/swagger/
- SQL Server: localhost:1433 (sa/StockFlow123!)
- Redis: localhost:6379
- Mailhog (SMTP/Web UI): smtp: 1025; http: http://localhost:8025

## How to run (dev)

- Build and start: `docker compose up -d --build`
- View logs (if needed):
  - `docker compose logs -f stockflow-api`
  - `docker compose logs -f stockflow-frontend`
  - `docker compose logs -f stockflow-nginx`

## Production notes

- docker-compose.prod.yml is set up for a production build with:
  - stockflow-api and stockflow-frontend scaled (replicas)
  - Nginx at ports 80/443 using ./nginx/nginx.conf
  - External secrets (db_password, jwt_secret, redis_password)
- Before using production compose:
  - Ensure Docker Swarm if you intend to use deploy/replicas/overlay networks.
  - Provide the external secrets or switch to environment variables.
  - Confirm each service attaches to the desired network (stockflow-network) in that file if using overlay and swarm.
  - Set strong secrets in .env.docker (copy to .env).

## Summary of files changed

- docker-compose.yml
  - backend -> stockflow-api, fixed ports, healthchecks, redis command, removed UI dist mount, set VITE_API_BASE_URL=/api, updated dependencies
- StockFlowPro.UI/nginx.conf
  - Proxy root to Vite dev server, proxy /api/, /stockflowhub, and /swagger/
- StockFlowPro.Web/Program.cs
  - CORS: added localhost:8080 and 127.0.0.1:8080, added 8080 to allowed dev ports

This configuration brings the stack into a working state in development with correct routing through Nginx and consistent service URLs.
