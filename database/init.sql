-- StockFlow Pro Database Initialization Script (OPTIMIZED)
USE master;
GO

-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StockFlowProDb')
BEGIN
    CREATE DATABASE [StockFlowProDb]
    COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE [StockFlowProDb];
GO

-- Create test table for health verification
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemInfo')
BEGIN
    CREATE TABLE [dbo].[SystemInfo] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Key] NVARCHAR(100) NOT NULL UNIQUE,
        [Value] NVARCHAR(MAX) NULL,
        [Description] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    INSERT INTO [dbo].[SystemInfo] ([Key], [Value], [Description])
    VALUES 
        ('DatabaseVersion', '1.0.0', 'Initial database version'),
        ('InitializedAt', CONVERT(VARCHAR, GETDATE(), 120), 'Database initialization timestamp'),
        ('Environment', 'Development', 'Current environment'),
        ('Status', 'Active', 'Database status');
END
GO

-- Final health check
SELECT 
    'Database' as Component,
    DB_NAME() as Name,
    'Operational' as Status,
    GETDATE() as VerifiedAt
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