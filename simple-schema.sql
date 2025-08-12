-- Simple direct SQL script to create Users table and test data
-- Execute in SQL Server Management Studio or command line

USE master;
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'StockFlowProDB')
BEGIN
    CREATE DATABASE StockFlowProDB;
    PRINT 'Database StockFlowProDB created';
END
ELSE
BEGIN
    PRINT 'Database StockFlowProDB already exists';
END

USE StockFlowProDB;

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Email] nvarchar(255) NOT NULL,
        [PasswordHash] nvarchar(500) NULL,
        [FirstName] nvarchar(100) NOT NULL,
        [LastName] nvarchar(100) NOT NULL,
        [Role] nvarchar(50) NOT NULL,
        [IsActive] bit NOT NULL DEFAULT 1,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] datetime2 NULL,
        [DateOfBirth] datetime2 NULL,
        [PhoneNumber] nvarchar(20) NULL,
        [FailedLoginAttempts] int NOT NULL DEFAULT 0,
        [LastLoginAt] datetime2 NULL,
        [LastLoginIp] nvarchar(45) NULL,
        [LockedUntil] datetime2 NULL,
        [PasswordChangedAt] datetime2 NULL,
        [RequirePasswordChange] bit NOT NULL DEFAULT 0,
        [RoleId] uniqueidentifier NULL,
        [SecurityStamp] nvarchar(100) NULL,
        [ProfilePhotoUrl] nvarchar(500) NULL
    );
    
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users]([Email]);
    PRINT 'Users table created';
END
ELSE
BEGIN
    PRINT 'Users table already exists';
END

-- Insert test users (only if they don't exist)
-- Password hash format: Base64Hash:Salt
-- admin password: admin (salt: 550e8400-e29b-41d4-a716-446655440000)
-- admin@stockflowpro.com password: SecureAdmin2024! (salt: 550e8400-e29b-41d4-a716-446655440001)
-- manager@stockflowpro.com password: SecureManager2024! (salt: 550e8400-e29b-41d4-a716-446655440002)
-- user@stockflowpro.com password: SecureUser2024! (salt: 550e8400-e29b-41d4-a716-446655440003)

DELETE FROM [Users]; -- Clear existing data for fresh start

INSERT INTO [Users] ([Id], [Email], [PasswordHash], [FirstName], [LastName], [Role], [IsActive], [CreatedAt], [PhoneNumber], [DateOfBirth])
VALUES 
    (NEWID(), 'admin', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=:550e8400-e29b-41d4-a716-446655440000', 'Admin', 'User', 'Admin', 1, GETUTCDATE(), '+1-555-0100', '1980-01-01T00:00:00.000Z'),
    (NEWID(), 'admin@stockflowpro.com', 'RUzF4HdBBGs2wKqBSKWfLWwjQnoJXYPNy2DGvi2HvZI=:550e8400-e29b-41d4-a716-446655440001', 'John', 'Admin', 'Admin', 1, GETUTCDATE(), '+1-555-0101', '1985-05-15T00:00:00.000Z'),
    (NEWID(), 'manager@stockflowpro.com', 'YBLOsXoS4wF2AWJ9dSS4L8mP3u8LlJtkltViHBcIyWg=:550e8400-e29b-41d4-a716-446655440002', 'Jane', 'Manager', 'Manager', 1, GETUTCDATE(), '+1-555-0102', '1990-08-22T00:00:00.000Z'),
    (NEWID(), 'user@stockflowpro.com', 'AzVJmtx6fWx7QGtafBDQDIw31SWQX8xp7WP2lNQ8rJ8=:550e8400-e29b-41d4-a716-446655440003', 'Bob', 'User', 'User', 1, GETUTCDATE(), '+1-555-0103', '1992-12-10T00:00:00.000Z');

PRINT 'Test users inserted successfully';
PRINT 'Available credentials:';
PRINT '  admin / admin';
PRINT '  admin@stockflowpro.com / SecureAdmin2024!';
PRINT '  manager@stockflowpro.com / SecureManager2024!';
PRINT '  user@stockflowpro.com / SecureUser2024!';

-- Verify the data
SELECT COUNT(*) as UserCount FROM [Users];
SELECT [Email], [FirstName], [LastName], [Role], [IsActive] FROM [Users];
