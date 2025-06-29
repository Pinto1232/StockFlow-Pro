using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockFlowPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConvertRoleToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add a temporary column for the string role
            migrationBuilder.AddColumn<string>(
                name: "RoleTemp",
                table: "Users",
                type: "nvarchar(50)",
                nullable: true);

            // Step 2: Convert existing numeric roles to string roles
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET RoleTemp = CASE 
                    WHEN Role = 1 THEN 'Admin'
                    WHEN Role = 2 THEN 'User' 
                    WHEN Role = 3 THEN 'Manager'
                    ELSE 'User'
                END");

            // Step 3: Drop the old Role column
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            // Step 4: Rename the temporary column to Role
            migrationBuilder.RenameColumn(
                name: "RoleTemp",
                table: "Users",
                newName: "Role");

            // Step 5: Make the Role column non-nullable
            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "User");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add a temporary column for the numeric role
            migrationBuilder.AddColumn<int>(
                name: "RoleTemp",
                table: "Users",
                type: "int",
                nullable: true);

            // Step 2: Convert existing string roles back to numeric roles
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET RoleTemp = CASE 
                    WHEN Role = 'Admin' THEN 1
                    WHEN Role = 'User' THEN 2
                    WHEN Role = 'Manager' THEN 3
                    ELSE 2
                END");

            // Step 3: Drop the old Role column
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            // Step 4: Rename the temporary column to Role
            migrationBuilder.RenameColumn(
                name: "RoleTemp",
                table: "Users",
                newName: "Role");

            // Step 5: Make the Role column non-nullable
            migrationBuilder.AlterColumn<int>(
                name: "Role",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 2);
        }
    }
}
