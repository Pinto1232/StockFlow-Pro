#!/bin/bash
# StockFlow-Pro Podman Runner Script
# This script runs your Docker Compose services using Podman

PODMAN_PATH="/c/Program Files/RedHat/Podman/podman.exe"
ACTION=${1:-up}

echo "🚀 StockFlow-Pro Podman Runner"
echo "Action: $ACTION"

case $ACTION in
    "up")
        echo "Starting StockFlow-Pro services..."
        
        # Create network
        "$PODMAN_PATH" network create stockflow-network 2>/dev/null || true
        
        # Create volumes
        "$PODMAN_PATH" volume create mssql-data 2>/dev/null || true
        "$PODMAN_PATH" volume create stockflow-redis-data 2>/dev/null || true
        "$PODMAN_PATH" volume create backend-logs 2>/dev/null || true
        "$PODMAN_PATH" volume create nginx-logs 2>/dev/null || true
        
        echo "✅ Network and volumes created"
        
        # Build and start database first
        echo "🗄️ Building SQL Server image..."
        "$PODMAN_PATH" build -f Dockerfile.mssql -t stockflow-db .
        
        echo "🗄️ Starting SQL Server..."
        "$PODMAN_PATH" run -d \
            --name stockflow-db \
            --network stockflow-network \
            -p 1433:1433 \
            -e ACCEPT_EULA=Y \
            -e SA_PASSWORD="StockFlow123!" \
            -e MSSQL_PID=Developer \
            -v mssql-data:/var/opt/mssql \
            stockflow-db
        
        # Start Redis
        echo "🔴 Starting Redis..."
        "$PODMAN_PATH" run -d \
            --name stockflow-redis \
            --network stockflow-network \
            -p 6379:6379 \
            -v stockflow-redis-data:/data \
            redis:7.4-alpine \
            redis-server --appendonly yes
        
        # Start MailHog
        echo "📧 Starting MailHog..."
        "$PODMAN_PATH" run -d \
            --name stockflow-mailhog \
            --network stockflow-network \
            -p 1025:1025 -p 8025:8025 \
            mailhog/mailhog:v1.0.1
        
        echo "✅ Infrastructure services started!"
        echo "🌐 Access points:"
        echo "  - SQL Server: localhost:1433"
        echo "  - Redis: localhost:6379"
        echo "  - MailHog UI: http://localhost:8025"
        ;;
    
    "down")
        echo "Stopping StockFlow-Pro services..."
        
        # Stop and remove containers
        containers=("stockflow-nginx" "stockflow-frontend" "stockflow-api" "stockflow-mailhog" "stockflow-redis" "stockflow-db")
        for container in "${containers[@]}"; do
            "$PODMAN_PATH" stop "$container" 2>/dev/null || true
            "$PODMAN_PATH" rm "$container" 2>/dev/null || true
        done
        
        echo "✅ All services stopped"
        ;;
    
    "logs")
        echo "Showing logs for all services..."
        containers=("stockflow-db" "stockflow-redis" "stockflow-mailhog" "stockflow-api" "stockflow-frontend" "stockflow-nginx")
        for container in "${containers[@]}"; do
            echo "=== $container ==="
            "$PODMAN_PATH" logs --tail 10 "$container" 2>/dev/null || true
        done
        ;;
    
    "status")
        echo "Service Status:"
        "$PODMAN_PATH" ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    
    *)
        echo "Usage: ./run-with-podman.sh [up|down|logs|status]"
        echo "  up     - Start all services"
        echo "  down   - Stop all services"
        echo "  logs   - Show service logs"
        echo "  status - Show service status"
        ;;
esac