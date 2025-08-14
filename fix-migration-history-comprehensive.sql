-- Comprehensive fix for migration history issues
-- This script will analyze the current database state and mark appropriate migrations as applied

PRINT '=== STOCKFLOW PRO MIGRATION HISTORY FIX ==='
PRINT 'Analyzing current database state...'
PRINT ''

-- Clear any existing migration history first (if needed)
PRINT 'Current migration history:'
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId

-- Check key columns that indicate which migrations have been applied
DECLARE @HasFailedLoginAttempts bit = 0
DECLARE @HasProfilePhotoUrl bit = 0
DECLARE @HasImageUrl bit = 0
DECLARE @HasNotificationTables bit = 0
DECLARE @HasEmployeeTables bit = 0
DECLARE @HasLandingTables bit = 0

-- Check Users table columns
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'FailedLoginAttempts')
    SET @HasFailedLoginAttempts = 1

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'ProfilePhotoUrl')
    SET @HasProfilePhotoUrl = 1

-- Check Products table columns
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'ImageUrl')
    SET @HasImageUrl = 1

-- Check for Notification system tables
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications')
    SET @HasNotificationTables = 1

-- Check for Employee tables
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Employees')
    SET @HasEmployeeTables = 1

-- Check for Landing page tables
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('HeroSections', 'Features', 'Testimonials', 'LandingPageSettings'))
    SET @HasLandingTables = 1

-- Report findings
PRINT 'Database Analysis Results:'
PRINT '------------------------'
PRINT 'FailedLoginAttempts column exists: ' + CASE WHEN @HasFailedLoginAttempts = 1 THEN 'YES' ELSE 'NO' END
PRINT 'ProfilePhotoUrl column exists: ' + CASE WHEN @HasProfilePhotoUrl = 1 THEN 'YES' ELSE 'NO' END
PRINT 'Product ImageUrl column exists: ' + CASE WHEN @HasImageUrl = 1 THEN 'YES' ELSE 'NO' END
PRINT 'Notification tables exist: ' + CASE WHEN @HasNotificationTables = 1 THEN 'YES' ELSE 'NO' END
PRINT 'Employee tables exist: ' + CASE WHEN @HasEmployeeTables = 1 THEN 'YES' ELSE 'NO' END
PRINT 'Landing page tables exist: ' + CASE WHEN @HasLandingTables = 1 THEN 'YES' ELSE 'NO' END
PRINT ''

-- Mark migrations as applied based on database state
PRINT 'Marking migrations as applied...'

-- Always mark these basic migrations if core tables exist
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Products') 
   AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    -- Core migrations
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250628052135_InitialSqlServerCreate', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked InitialSqlServerCreate as applied'
END

-- Mark UpdatedRoleManagement if FailedLoginAttempts exists
IF @HasFailedLoginAttempts = 1
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250628062253_UpdatedRoleManagement', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked UpdatedRoleManagement as applied'
END

-- Check if Role column is string type (indicates ConvertRoleToString was applied)
DECLARE @RoleDataType nvarchar(50)
SELECT @RoleDataType = DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Role'

IF @RoleDataType = 'nvarchar'
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250629171332_ConvertRoleToString', '8.0.6'),
        ('20250629171510_UpdateRoleColumnLength', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked role conversion migrations as applied'
END

-- Mark ProfilePhotoUrl migration if column exists
IF @HasProfilePhotoUrl = 1
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250629214223_AddProfilePhotoUrl', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked AddProfilePhotoUrl as applied'
END

-- Mark subscription migrations if Subscriptions table exists
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Subscriptions')
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250701122654_DropSubscriptionTables', '8.0.6'),
        ('20250701124652_AddSubscriptionSystem', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked subscription migrations as applied'
END

-- Mark ImageUrl migration if column exists
IF @HasImageUrl = 1
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250718234853_AddImageUrlToProducts', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked AddImageUrlToProducts as applied'
END

-- Mark notification migration if tables exist
IF @HasNotificationTables = 1
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250723083408_AddNotificationSystem', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked AddNotificationSystem as applied'
END

-- Mark employee migrations if tables exist
IF @HasEmployeeTables = 1
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250808190021_AddEmployees', '8.0.6'),
        ('20250808215543_AddEmployeeImageUrl', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked employee migrations as applied'
END

-- Mark landing page migrations if tables exist
IF @HasLandingTables = 1
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    SELECT * FROM (VALUES 
        ('20250813150056_AddLandingTables', '8.0.6'),
        ('20250813152536_FixLandingTables', '8.0.6')
    ) AS V(MigrationId, ProductVersion)
    WHERE NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = V.MigrationId)
    
    PRINT 'Marked landing page migrations as applied'
END

PRINT ''
PRINT 'Migration history update completed!'
PRINT ''
PRINT 'Final migration history:'
SELECT MigrationId, ProductVersion FROM __EFMigrationsHistory ORDER BY MigrationId

PRINT ''
PRINT 'Next steps:'
PRINT '1. Run: dotnet ef migrations list'
PRINT '2. Run: dotnet ef database update'
PRINT '3. Only the latest migrations should be pending'
