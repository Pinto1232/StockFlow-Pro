# Admin Test Credentials

For testing purposes, the following admin credentials have been added to the system:

## Test Admin Account
- **Username:** `admin` (you can use either "admin" or "admin@gmail.com")
- **Password:** `admin`
- **Role:** Admin (full privileges)

This account is automatically available and can be used for testing all admin functionality.

## How It Works

The admin/admin credentials work through the dual data service system:
1. **Mock Data Service** - The JSON file contains the admin user with the correct password hash
2. **Database** - Falls back to database if needed
3. **Authentication** - The system checks both sources for user authentication

## Login Process

You can log in using:
- **Username/Email field:** `admin` or `admin@gmail.com`
- **Password field:** `admin`

The system will authenticate you with full admin privileges, allowing access to all features including:
- User management
- Product management  
- Admin panel
- All CRUD operations

## Technical Details

The password "admin" has been properly hashed using the system's SHA256 + salt method and stored in:
- `StockFlowPro.Web/App_Data/mock-users.json` - Admin user with ID `1b6f550e-6b8a-47ae-bc0b-52d88e507272`

## Security Note

These are test credentials only. In a production environment, ensure to:
1. Remove or change these default credentials
2. Use strong passwords
3. Implement proper user management

## Troubleshooting

If login fails:
1. Ensure the application is using the updated mock-users.json file
2. Check that the DualDataService is properly configured
3. Verify the password hash matches the expected format
4. Check application logs for authentication details