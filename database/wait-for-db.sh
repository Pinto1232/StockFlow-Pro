#!/bin/bash
# Enhanced wait-for-db script with improved error handling and diagnostics
set -euo pipefail

# Debugging: Trace command execution
set -x

# Validate required environment variables
: "${SA_PASSWORD:?Environment variable SA_PASSWORD must be set}"

echo "🔍 Starting SQL Server readiness probe..."

# Function to test SQL connectivity
test_sql_connection() {
    /opt/mssql-tools/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "${SA_PASSWORD}" \
        -C -d master \
        -Q "SELECT 1" \
        -b >/dev/null 2>&1
}

# Wait for SQL Server to become responsive
MAX_ATTEMPTS=240  # 12 minutes total (30s intervals)
INTERVAL=30s
attempt=1

while ! test_sql_connection; do
    if [ $attempt -ge $MAX_ATTEMPTS ]; then
        echo "❌ SQL Server failed to start within 12 minutes"
        exit 1
    fi
    
    echo "⏳ Waiting for SQL Server... (Attempt $attempt/$MAX_ATTEMPTS)"
    sleep $INTERVAL
    ((attempt++))
done

echo "✅ SQL Server is ready!"

# Execute initialization script if available
if [ -f /docker-entrypoint-initdb.d/init.sql ]; then
    echo "📝 Running initialization script..."
    
    # Default application user password if not overridden
    : "${DB_APP_USER_PASSWORD:=ChangeMe_StrongAppPwd123!}"
    
    /opt/mssql-tools/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "${SA_PASSWORD}" \
        -C -d master \
        -v APP_USER_PWD="${DB_APP_USER_PASSWORD}" \
        -i /docker-entrypoint-initdb.d/init.sql
    
    echo "✅ Initialization script completed!"
else
    echo "ℹ️ No initialization script found"
fi

# Keep container alive while streaming logs
echo "🚀 Database container active - streaming SQL Server logs"
tail -f /var/opt/mssql/log/errorlog || tail -f /dev/null