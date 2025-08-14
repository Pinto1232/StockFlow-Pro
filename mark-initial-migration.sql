-- Conservative approach: Mark only the most essential migrations as applied
-- Start with just the initial migration that creates core tables

-- Check if Products table exists (created by InitialSqlServerCreate)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Products')
BEGIN
    PRINT 'Products table exists - marking InitialSqlServerCreate as applied'
    
    -- Only mark the initial migration as applied for now
    IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId = '20250628052135_InitialSqlServerCreate')
    BEGIN
        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
        VALUES ('20250628052135_InitialSqlServerCreate', '8.0.6')
        PRINT 'Marked InitialSqlServerCreate as applied'
    END
    ELSE
    BEGIN
        PRINT 'InitialSqlServerCreate already marked as applied'
    END
END
ELSE
BEGIN
    PRINT 'Products table does not exist - do not run this script'
END

-- Show current migration status
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;
