-- Script to mark migrations as applied in __EFMigrationsHistory
-- This should be run when the database already has the schema but EF Core migration history is missing

-- Check current migration history
SELECT 'Current migrations in history:' as Status;
SELECT * FROM __EFMigrationsHistory;

-- Based on the existing tables in the database, mark these migrations as applied
-- You should verify each migration before running this script

INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES
('20250628052135_InitialSqlServerCreate', '8.0.6'),
('20250628062253_UpdatedRoleManagement', '8.0.6'),
('20250629171332_ConvertRoleToString', '8.0.6'),
('20250629171510_UpdateRoleColumnLength', '8.0.6'),
('20250629214223_AddProfilePhotoUrl', '8.0.6'),
('20250701122654_DropSubscriptionTables', '8.0.6'),
('20250701124652_AddSubscriptionSystem', '8.0.6'),
('20250718234853_AddImageUrlToProducts', '8.0.6'),
('20250723083408_AddNotificationSystem', '8.0.6'),
('20250808190021_AddEmployees', '8.0.6'),
('20250808215543_AddEmployeeImageUrl', '8.0.6'),
('20250813150056_AddLandingTables', '8.0.6'),
('20250813152536_FixLandingTables', '8.0.6');

-- Check what migrations are now marked as applied
SELECT 'Migrations now marked as applied:' as Status;
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;

-- Show remaining pending migrations
SELECT 'After running this script, check pending migrations with:' as Instructions;
SELECT 'dotnet ef migrations list' as Command;
