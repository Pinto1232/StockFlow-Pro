using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockFlowPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropSubscriptionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop specific known foreign key constraints first
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserSubscriptions_SubscriptionPackages_SubscriptionPackageId') ALTER TABLE [UserSubscriptions] DROP CONSTRAINT [FK_UserSubscriptions_SubscriptionPackages_SubscriptionPackageId]");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserSubscriptions_Users_UserId') ALTER TABLE [UserSubscriptions] DROP CONSTRAINT [FK_UserSubscriptions_Users_UserId]");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PaymentHistories_UserSubscriptions_UserSubscriptionId') ALTER TABLE [PaymentHistories] DROP CONSTRAINT [FK_PaymentHistories_UserSubscriptions_UserSubscriptionId]");
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PaymentHistories_Users_UserId') ALTER TABLE [PaymentHistories] DROP CONSTRAINT [FK_PaymentHistories_Users_UserId]");
            
            // Drop the tables
            migrationBuilder.Sql("IF OBJECT_ID('dbo.PaymentHistories', 'U') IS NOT NULL DROP TABLE [PaymentHistories]");
            migrationBuilder.Sql("IF OBJECT_ID('dbo.UserSubscriptions', 'U') IS NOT NULL DROP TABLE [UserSubscriptions]");
            migrationBuilder.Sql("IF OBJECT_ID('dbo.SubscriptionPackages', 'U') IS NOT NULL DROP TABLE [SubscriptionPackages]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot recreate tables as their original schema is unknown
            // If you need to rollback this migration, you'll need to manually recreate the tables
        }
    }
}
