-- Test script to verify role conversion
-- Run this in SQL Server Management Studio or similar tool

-- Check the current roles in the database
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    Role,
    IsActive
FROM Users
ORDER BY Role, FirstName;

-- Verify the Role column is now nvarchar(50)
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Role';