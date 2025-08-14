using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockFlowPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixLandingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop existing tables if they exist (to ensure clean recreation)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sysobjects WHERE name='LandingFeatures' AND xtype='U')
                    DROP TABLE [LandingFeatures];
                IF EXISTS (SELECT * FROM sysobjects WHERE name='LandingTestimonials' AND xtype='U')
                    DROP TABLE [LandingTestimonials];
                IF EXISTS (SELECT * FROM sysobjects WHERE name='LandingStats' AND xtype='U')
                    DROP TABLE [LandingStats];
            ");

            // Create LandingFeatures table
            migrationBuilder.Sql(@"
                CREATE TABLE [LandingFeatures] (
                    [Id] uniqueidentifier NOT NULL,
                    [Title] nvarchar(200) NOT NULL,
                    [Description] nvarchar(1000) NOT NULL,
                    [IconName] nvarchar(100) NOT NULL,
                    [ColorClass] nvarchar(200) NOT NULL,
                    [SortOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NULL,
                    CONSTRAINT [PK_LandingFeatures] PRIMARY KEY ([Id])
                );
                
                CREATE INDEX [IX_LandingFeatures_IsActive] ON [LandingFeatures] ([IsActive]);
                CREATE INDEX [IX_LandingFeatures_SortOrder] ON [LandingFeatures] ([SortOrder]);
                CREATE UNIQUE INDEX [IX_LandingFeatures_Title] ON [LandingFeatures] ([Title]);
            ");

            // Create LandingStats table
            migrationBuilder.Sql(@"
                CREATE TABLE [LandingStats] (
                    [Id] uniqueidentifier NOT NULL,
                    [Number] nvarchar(50) NOT NULL,
                    [Label] nvarchar(200) NOT NULL,
                    [IconName] nvarchar(100) NOT NULL,
                    [SortOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NULL,
                    CONSTRAINT [PK_LandingStats] PRIMARY KEY ([Id])
                );
                
                CREATE INDEX [IX_LandingStats_IsActive] ON [LandingStats] ([IsActive]);
                CREATE UNIQUE INDEX [IX_LandingStats_Label] ON [LandingStats] ([Label]);
                CREATE INDEX [IX_LandingStats_SortOrder] ON [LandingStats] ([SortOrder]);
            ");

            // Create LandingTestimonials table
            migrationBuilder.Sql(@"
                CREATE TABLE [LandingTestimonials] (
                    [Id] uniqueidentifier NOT NULL,
                    [Name] nvarchar(200) NOT NULL,
                    [Role] nvarchar(200) NOT NULL,
                    [Company] nvarchar(200) NOT NULL,
                    [ImageUrl] nvarchar(500) NOT NULL,
                    [Quote] nvarchar(2000) NOT NULL,
                    [SortOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NULL,
                    CONSTRAINT [PK_LandingTestimonials] PRIMARY KEY ([Id])
                );
                
                CREATE INDEX [IX_LandingTestimonials_IsActive] ON [LandingTestimonials] ([IsActive]);
                CREATE INDEX [IX_LandingTestimonials_Name] ON [LandingTestimonials] ([Name]);
                CREATE INDEX [IX_LandingTestimonials_SortOrder] ON [LandingTestimonials] ([SortOrder]);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
