#!/bin/bash
set -e

# Function to wait for SQL Server to be ready
wait_for_sql() {
    echo "Waiting for SQL Server to be ready..."
    for i in {1..50};
    do
        if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'StockFlow123!' -C -d master -Q "SELECT 1" &> /dev/null
        then
            echo "SQL Server is ready"
            return 0
        else
            echo "SQL Server is not ready yet... (attempt $i/50)"
            sleep 2
        fi
    done
    echo "SQL Server did not start in time"
    return 1
}

# Wait for SQL Server to be ready
wait_for_sql

# Run the initialization script
if [ -f /docker-entrypoint-initdb.d/init.sql ]; then
    echo "Running initialization script..."
    if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'StockFlow123!' -C -d master -i /docker-entrypoint-initdb.d/init.sql; then
        echo "Initialization script completed successfully"
    else
        echo "Error running initialization script"
        exit 1
    fi
else
    echo "No initialization script found at /docker-entrypoint-initdb.d/init.sql"
fi

# Keep the container running
echo "Database initialization complete. SQL Server is running..."
tail -f /dev/null
