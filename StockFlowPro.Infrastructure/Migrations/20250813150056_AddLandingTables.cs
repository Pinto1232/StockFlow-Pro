using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockFlowPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLandingTables : Migration
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
                BEGIN
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
                END
            ");

            // Create LandingStats table
            migrationBuilder.Sql(@"
                BEGIN
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
                END
            ");

            // Create LandingTestimonials table
            migrationBuilder.Sql(@"
                BEGIN
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
                END
            ");

            // Keep the original CreateTable calls commented out as backup
            /*
            migrationBuilder.CreateTable(
                name: "LandingFeatures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ColorClass = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingFeatures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandingStats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingStats", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandingTestimonials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Company = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Quote = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingTestimonials", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LandingFeatures_IsActive",
                table: "LandingFeatures",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_LandingFeatures_SortOrder",
                table: "LandingFeatures",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_LandingFeatures_Title",
                table: "LandingFeatures",
                column: "Title",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LandingStats_IsActive",
                table: "LandingStats",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_LandingStats_Label",
                table: "LandingStats",
                column: "Label",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LandingStats_SortOrder",
                table: "LandingStats",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_LandingTestimonials_IsActive",
                table: "LandingTestimonials",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_LandingTestimonials_Name",
                table: "LandingTestimonials",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_LandingTestimonials_SortOrder",
                table: "LandingTestimonials",
                column: "SortOrder");
            */
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LandingFeatures");

            migrationBuilder.DropTable(
                name: "LandingStats");

            migrationBuilder.DropTable(
                name: "LandingTestimonials");
        }
    }
}
