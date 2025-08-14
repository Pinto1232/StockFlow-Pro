-- Query for specific emails that exist in your SSMS view
-- Based on the screenshot, these emails should exist:

-- Query for john.doe@example.com (visible in your SSMS)
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    PasswordHash,
    IsActive,
    Role,
    CreatedAt,
    LastLoginAt
FROM Users 
WHERE Email = 'john.doe@example.com';

-- Query for alice.smith@stockflowpro.com (visible in your SSMS)
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    PasswordHash,
    IsActive,
    Role,
    CreatedAt,
    LastLoginAt
FROM Users 
WHERE Email = 'alice.smith@stockflowpro.com';

-- Query for jane@gmail.com (visible in your SSMS)
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    PasswordHash,
    IsActive,
    Role,
    CreatedAt,
    LastLoginAt
FROM Users 
WHERE Email = 'jane@gmail.com';

-- Show all users with their emails for reference
SELECT 
    FirstName + ' ' + LastName as FullName,
    Email,
    Role,
    IsActive,
    CreatedAt
FROM Users 
ORDER BY CreatedAt DESC;
