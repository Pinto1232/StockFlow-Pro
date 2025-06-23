# Admin Test Credentials

For testing purposes, the following admin credentials have been added to the system:

## Test Admin Account
- **Username:** `admin`
- **Password:** `admin`
- **Role:** Admin (full privileges)

This account is automatically created when the application starts and can be used for testing all admin functionality.

## Existing Admin Accounts
The following admin accounts are also available:

- **Email:** `admin@stockflowpro.com`
- **Password:** `admin123`
- **Role:** Admin

## How It Works

The admin/admin credentials are added to both:
1. **Database seeding** - When the database is first created or when users without password hashes are found
2. **Mock data service** - For testing with mock data

## Security Note

These are test credentials only. In a production environment, ensure to:
1. Remove or change these default credentials
2. Use strong passwords
3. Implement proper user management

## Login Process

You can log in using either:
- The username/email field with "admin" 
- The password field with "admin"

The system will authenticate you with full admin privileges, allowing access to all features including:
- User management
- Product management  
- Admin panel
- All CRUD operations