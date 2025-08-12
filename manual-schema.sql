-- Manual schema creation for StockFlowPro database
-- This script creates the essential tables needed for authentication

USE StockFlowProDB;

-- Create Users table if it doesn't exist
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
    PRINT 'Users table created successfully';
END
ELSE
BEGIN
    PRINT 'Users table already exists';
END

-- Create Notifications table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Notifications] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Title] nvarchar(255) NOT NULL,
        [Message] nvarchar(1000) NOT NULL,
        [Type] nvarchar(50) NOT NULL,
        [Status] nvarchar(50) NOT NULL,
        [Priority] nvarchar(50) NOT NULL,
        [RecipientId] uniqueidentifier NULL,
        [SenderId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [ReadAt] datetime2 NULL,
        [SentAt] datetime2 NULL,
        [DeliveredAt] datetime2 NULL,
        [ExpiresAt] datetime2 NULL,
        [ActionUrl] nvarchar(500) NULL,
        [Metadata] nvarchar(max) NULL,
        [Channels] nvarchar(255) NULL,
        [TemplateId] uniqueidentifier NULL,
        [RelatedEntityType] nvarchar(100) NULL,
        [RelatedEntityId] uniqueidentifier NULL,
        [IsPersistent] bit NOT NULL DEFAULT 0,
        [IsDismissible] bit NOT NULL DEFAULT 1,
        [DeliveryAttempts] int NOT NULL DEFAULT 0,
        [LastError] nvarchar(1000) NULL
    );
    PRINT 'Notifications table created successfully';
END
ELSE
BEGIN
    PRINT 'Notifications table already exists';
END

-- Insert default admin user if no users exist
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = 'admin@stockflowpro.com')
BEGIN
    INSERT INTO [Users] ([Email], [FirstName], [LastName], [Role], [PasswordHash], [IsActive], [CreatedAt])
    VALUES (
        'admin@stockflowpro.com',
        'System',
        'Administrator', 
        'Admin',
        'SwyUTpQzQmDEBMQFYJl2jE23IVSJOEjNNrQ5iNM4kLE=:tGu3HyLG6Aa8LSKC7cUREg==', -- SecureAdmin2024!
        1,
        GETUTCDATE()
    );
    PRINT 'Default admin user created';
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END

-- Insert additional test users
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = 'manager@stockflowpro.com')
BEGIN
    INSERT INTO [Users] ([Email], [FirstName], [LastName], [Role], [PasswordHash], [IsActive], [CreatedAt])
    VALUES (
        'manager@stockflowpro.com',
        'John',
        'Manager', 
        'Manager',
        'w8kUuhtSttOSd5QDHQ5ZKWTr0YHv/Lz9fgHVYqwETPU=:tGu3HyLG6Aa8LSKC7cUREg==', -- SecureManager2024!
        1,
        GETUTCDATE()
    );
    PRINT 'Manager user created';
END

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = 'user@stockflowpro.com')
BEGIN
    INSERT INTO [Users] ([Email], [FirstName], [LastName], [Role], [PasswordHash], [IsActive], [CreatedAt])
    VALUES (
        'user@stockflowpro.com',
        'Jane',
        'User', 
        'User',
        'oLKLJg2IJwFj4zz/qzEhYhKVcOL8fZl3fT8vOxVV1xA=:tGu3HyLG6Aa8LSKC7cUREg==', -- SecureUser2024!
        1,
        GETUTCDATE()
    );
    PRINT 'Regular user created';
END

PRINT 'Manual schema setup completed successfully';
