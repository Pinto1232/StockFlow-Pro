-- Create StockFlowPro database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'StockFlowProDb')
BEGIN
    CREATE DATABASE StockFlowProDb;
    PRINT 'Database StockFlowProDb created successfully';
END
ELSE
BEGIN
    PRINT 'Database StockFlowProDb already exists';
END

-- Use the database
USE StockFlowProDb;

-- Create a basic health check table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HealthCheck' AND xtype='U')
BEGIN
    CREATE TABLE HealthCheck (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CheckTime DATETIME2 DEFAULT GETUTCDATE(),
        Status NVARCHAR(50) DEFAULT 'OK'
    );
    
    INSERT INTO HealthCheck (Status) VALUES ('Database Initialized');
    PRINT 'HealthCheck table created and initialized';
END

-- Grant permissions for the application user
-- Note: In production, create a dedicated application user instead of using 'sa'
PRINT 'Database initialization completed successfully';