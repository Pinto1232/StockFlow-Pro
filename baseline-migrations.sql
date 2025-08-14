-- Baseline existing database to align with EF Core migrations
-- Run this on (localdb)\MSSQLLocalDB, database: StockFlowProDb
-- It marks earlier migrations as applied so EF won't try to re-create existing tables

BEGIN TRANSACTION;

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250628052135_InitialSqlServerCreate')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250628052135_InitialSqlServerCreate', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250628062253_UpdatedRoleManagement')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250628062253_UpdatedRoleManagement', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250629171332_ConvertRoleToString')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250629171332_ConvertRoleToString', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250629171510_UpdateRoleColumnLength')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250629171510_UpdateRoleColumnLength', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250629214223_AddProfilePhotoUrl')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250629214223_AddProfilePhotoUrl', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250701122654_DropSubscriptionTables')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250701122654_DropSubscriptionTables', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250701124652_AddSubscriptionSystem')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250701124652_AddSubscriptionSystem', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250718234853_AddImageUrlToProducts')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250718234853_AddImageUrlToProducts', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250723083408_AddNotificationSystem')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250723083408_AddNotificationSystem', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250808190021_AddEmployees')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250808190021_AddEmployees', '9.0.8');

IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20250808215543_AddEmployeeImageUrl')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20250808215543_AddEmployeeImageUrl', '9.0.8');

COMMIT;