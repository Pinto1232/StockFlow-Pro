-- StockFlow Pro Database Initialization Script
-- This script creates the database, users, and basic structure
-- =====================================================

USE master;
GO

-- Print initialization start message
PRINT '=================================================='
PRINT 'Starting StockFlow Pro Database Initialization'
PRINT 'Timestamp: ' + CONVERT(VARCHAR, GETDATE(), 120)
PRINT '=================================================='
GO

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StockFlowProDb')
BEGIN
    PRINT 'Creating database StockFlowProDb...'
    CREATE DATABASE [StockFlowProDb]
    COLLATE SQL_Latin1_General_CP1_CI_AS;
    
    PRINT '✓ Database StockFlowProDb created successfully.'
END
ELSE
BEGIN
    PRINT 'ℹ Database StockFlowProDb already exists.'
END
GO

-- Switch to the new database
USE [StockFlowProDb];
GO

-- Enable contained database authentication (optional for future use)
IF NOT EXISTS (SELECT * FROM sys.database_scoped_configurations WHERE name = 'CONTAINMENT')
BEGIN
    PRINT 'Configuring database containment...'
    ALTER DATABASE [StockFlowProDb] SET CONTAINMENT = PARTIAL;
    PRINT '✓ Database containment configured.'
END
GO

-- Create a dedicated login for the application if it doesn't exist
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'StockFlowUser')
BEGIN
    PRINT 'Creating SQL Server login: StockFlowUser...'
    CREATE LOGIN [StockFlowUser] 
    WITH PASSWORD = 'StockFlow123!',
         DEFAULT_DATABASE = [StockFlowProDb],
         CHECK_EXPIRATION = OFF,
         CHECK_POLICY = OFF;
    
    PRINT '✓ Login StockFlowUser created successfully.'
END
ELSE
BEGIN
    PRINT 'ℹ Login StockFlowUser already exists.'
END
GO

-- Switch back to the application database
USE [StockFlowProDb];
GO

-- Create a user mapped to the login if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'StockFlowUser')
BEGIN
    PRINT 'Creating database user: StockFlowUser...'
    CREATE USER [StockFlowUser] FOR LOGIN [StockFlowUser] WITH DEFAULT_SCHEMA=[dbo];
    
    -- Grant necessary permissions
    ALTER ROLE [db_owner] ADD MEMBER [StockFlowUser];
    
    PRINT '✓ Database user StockFlowUser created and granted db_owner permissions.'
END
ELSE
BEGIN
    PRINT 'ℹ Database user StockFlowUser already exists.'
    
    -- Ensure proper role membership
    IF NOT IS_ROLEMEMBER('db_owner', 'StockFlowUser') = 1
    BEGIN
        ALTER ROLE [db_owner] ADD MEMBER [StockFlowUser];
        PRINT '✓ Added StockFlowUser to db_owner role.'
    END
END
GO

-- Create basic application schemas (if needed for organizing tables)
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Identity')
BEGIN
    PRINT 'Creating Identity schema...'
    EXEC('CREATE SCHEMA [Identity]');
    PRINT '✓ Identity schema created.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Inventory')
BEGIN
    PRINT 'Creating Inventory schema...'
    EXEC('CREATE SCHEMA [Inventory]');
    PRINT '✓ Inventory schema created.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Sales')
BEGIN
    PRINT 'Creating Sales schema...'
    EXEC('CREATE SCHEMA [Sales]');
    PRINT '✓ Sales schema created.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Purchasing')
BEGIN
    PRINT 'Creating Purchasing schema...'
    EXEC('CREATE SCHEMA [Purchasing]');
    PRINT '✓ Purchasing schema created.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Reporting')
BEGIN
    PRINT 'Creating Reporting schema...'
    EXEC('CREATE SCHEMA [Reporting]');
    PRINT '✓ Reporting schema created.'
END
GO

-- Set database options for optimal performance
PRINT 'Configuring database options...'

-- Enable snapshot isolation for better concurrency
IF (SELECT snapshot_isolation_state FROM sys.databases WHERE name = 'StockFlowProDb') = 0
BEGIN
    ALTER DATABASE [StockFlowProDb] SET ALLOW_SNAPSHOT_ISOLATION ON;
    PRINT '✓ Snapshot isolation enabled.'
END

-- Enable read committed snapshot isolation
IF (SELECT is_read_committed_snapshot_on FROM sys.databases WHERE name = 'StockFlowProDb') = 0
BEGIN
    ALTER DATABASE [StockFlowProDb] SET READ_COMMITTED_SNAPSHOT ON;
    PRINT '✓ Read committed snapshot isolation enabled.'
END

-- Set recovery model to SIMPLE for development (change to FULL for production)
IF (SELECT recovery_model FROM sys.databases WHERE name = 'StockFlowProDb') != 3
BEGIN
    ALTER DATABASE [StockFlowProDb] SET RECOVERY SIMPLE;
    PRINT '✓ Recovery model set to SIMPLE.'
END

-- Enable auto-statistics updates
ALTER DATABASE [StockFlowProDb] SET AUTO_CREATE_STATISTICS ON;
ALTER DATABASE [StockFlowProDb] SET AUTO_UPDATE_STATISTICS ON;
ALTER DATABASE [StockFlowProDb] SET AUTO_UPDATE_STATISTICS_ASYNC ON;
PRINT '✓ Auto-statistics options configured.'

-- Configure compatibility level
ALTER DATABASE [StockFlowProDb] SET COMPATIBILITY_LEVEL = 160; -- SQL Server 2022
PRINT '✓ Compatibility level set to 160 (SQL Server 2022).'

GO

-- Create a simple test table to verify everything is working
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemInfo')
BEGIN
    PRINT 'Creating SystemInfo table for verification...'
    CREATE TABLE [dbo].[SystemInfo] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Key] NVARCHAR(100) NOT NULL UNIQUE,
        [Value] NVARCHAR(MAX) NULL,
        [Description] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Insert initial system information
    INSERT INTO [dbo].[SystemInfo] ([Key], [Value], [Description])
    VALUES 
        ('DatabaseVersion', '1.0.0', 'Initial database version'),
        ('InitializedAt', CONVERT(VARCHAR, GETDATE(), 120), 'Database initialization timestamp'),
        ('Environment', 'Development', 'Current environment'),
        ('Status', 'Active', 'Database status');
    
    PRINT '✓ SystemInfo table created and populated.'
END
ELSE
BEGIN
    PRINT 'ℹ SystemInfo table already exists.'
END
GO

-- Verify the installation
PRINT 'Verifying database installation...'

-- Check database exists and is accessible
DECLARE @DbName NVARCHAR(128) = DB_NAME()
DECLARE @UserName NVARCHAR(128) = USER_NAME()
DECLARE @SchemaCount INT = (SELECT COUNT(*) FROM sys.schemas WHERE name IN ('Identity', 'Inventory', 'Sales', 'Purchasing', 'Reporting'))
DECLARE @TableCount INT = (SELECT COUNT(*) FROM sys.tables)

PRINT 'Database Name: ' + @DbName
PRINT 'Current User: ' + @UserName
PRINT 'Custom Schemas Created: ' + CAST(@SchemaCount AS VARCHAR(10))
PRINT 'Tables Created: ' + CAST(@TableCount AS VARCHAR(10))

-- Final verification query
SELECT 
    'Database' as Component,
    DB_NAME() as Name,
    'Operational' as Status,
    GETDATE() as VerifiedAt
UNION ALL
SELECT 
    'Login',
    'StockFlowUser',
    CASE WHEN EXISTS(SELECT 1 FROM sys.server_principals WHERE name = 'StockFlowUser') 
         THEN 'Created' 
         ELSE 'Missing' 
    END,
    GETDATE()
UNION ALL
SELECT 
    'User',
    'StockFlowUser',
    CASE WHEN EXISTS(SELECT 1 FROM sys.database_principals WHERE name = 'StockFlowUser') 
         THEN 'Created' 
         ELSE 'Missing' 
    END,
    GETDATE()
UNION ALL
SELECT 
    'SystemInfo Table',
    'dbo.SystemInfo',
    CASE WHEN EXISTS(SELECT 1 FROM sys.tables WHERE name = 'SystemInfo') 
         THEN 'Created' 
         ELSE 'Missing' 
    END,
    GETDATE();

GO

-- Final success message
PRINT '=================================================='
PRINT '✅ StockFlow Pro Database Initialization Complete!'
PRINT 'Database: StockFlowProDb'
PRINT 'Status: Ready for application use'
PRINT 'Timestamp: ' + CONVERT(VARCHAR, GETDATE(), 120)
PRINT '=================================================='

GO