-- Mark the landing page migration as applied since tables already exist
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES ('20250813142752_AddLandingPageContent', '9.0.8');
