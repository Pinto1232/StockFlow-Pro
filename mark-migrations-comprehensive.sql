-- Comprehensive script to mark migrations as applied
-- WARNING: Only run this if you're confident these migrations have been applied to your database

-- Check current state
PRINT 'Current migration history:'
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;

-- Check if key tables exist to verify migrations have been applied
DECLARE @HasProducts bit = 0
DECLARE @HasUsers bit = 0  
DECLARE @HasSubscriptions bit = 0
DECLARE @HasNotifications bit = 0
DECLARE @HasEmployees bit = 0

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Products')
    SET @HasProducts = 1
    
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
    SET @HasUsers = 1
    
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Subscriptions')
    SET @HasSubscriptions = 1
    
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications')
    SET @HasNotifications = 1
    
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Employees')
    SET @HasEmployees = 1

PRINT 'Table existence check:'
PRINT 'Products: ' + CAST(@HasProducts as varchar(1))
PRINT 'Users: ' + CAST(@HasUsers as varchar(1))
PRINT 'Subscriptions: ' + CAST(@HasSubscriptions as varchar(1))
PRINT 'Notifications: ' + CAST(@HasNotifications as varchar(1))
PRINT 'Employees: ' + CAST(@HasEmployees as varchar(1))

-- Only proceed if core tables exist
IF @HasProducts = 1 AND @HasUsers = 1
BEGIN
    PRINT 'Core tables exist - proceeding with migration marking'
    
    -- Mark migrations as applied based on table existence
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT MigrationId, ProductVersion FROM (VALUES
        ('20250628052135_InitialSqlServerCreate', '8.0.6'),
        ('20250628062253_UpdatedRoleManagement', '8.0.6'),
        ('20250629171332_ConvertRoleToString', '8.0.6'),
        ('20250629171510_UpdateRoleColumnLength', '8.0.6'),
        ('20250629214223_AddProfilePhotoUrl', '8.0.6')
    ) AS migrations(MigrationId, ProductVersion)
    WHERE NOT EXISTS (
        SELECT 1 FROM __EFMigrationsHistory h 
        WHERE h.MigrationId = migrations.MigrationId
    )
    
    -- Add subscription-related migrations if Subscriptions table exists
    IF @HasSubscriptions = 1
    BEGIN
        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
        SELECT MigrationId, ProductVersion FROM (VALUES
            ('20250701122654_DropSubscriptionTables', '8.0.6'),
            ('20250701124652_AddSubscriptionSystem', '8.0.6')
        ) AS migrations(MigrationId, ProductVersion)
        WHERE NOT EXISTS (
            SELECT 1 FROM __EFMigrationsHistory h 
            WHERE h.MigrationId = migrations.MigrationId
        )
    END
    
    -- Add other migrations if corresponding tables exist
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT MigrationId, ProductVersion FROM (VALUES
        ('20250718234853_AddImageUrlToProducts', '8.0.6')
    ) AS migrations(MigrationId, ProductVersion)
    WHERE NOT EXISTS (
        SELECT 1 FROM __EFMigrationsHistory h 
        WHERE h.MigrationId = migrations.MigrationId
    )
    
    IF @HasNotifications = 1
    BEGIN
        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
        SELECT MigrationId, ProductVersion FROM (VALUES
            ('20250723083408_AddNotificationSystem', '8.0.6')
        ) AS migrations(MigrationId, ProductVersion)
        WHERE NOT EXISTS (
            SELECT 1 FROM __EFMigrationsHistory h 
            WHERE h.MigrationId = migrations.MigrationId
        )
    END
    
    IF @HasEmployees = 1
    BEGIN
        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
        SELECT MigrationId, ProductVersion FROM (VALUES
            ('20250808190021_AddEmployees', '8.0.6'),
            ('20250808215543_AddEmployeeImageUrl', '8.0.6')
        ) AS migrations(MigrationId, ProductVersion)
        WHERE NOT EXISTS (
            SELECT 1 FROM __EFMigrationsHistory h 
            WHERE h.MigrationId = migrations.MigrationId
        )
    END
    
    PRINT 'Migration marking completed'
END
ELSE
BEGIN
    PRINT 'Core tables missing - manual verification required'
END

-- Show final state
PRINT 'Final migration history:'
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;
