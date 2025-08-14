-- Check specific user details for pintotnet@gmail.com
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    PasswordHash,
    Role,
    IsActive,
    CreatedAt,
    LastLoginAt
FROM Users 
WHERE Email = 'pintotnet@gmail.com';

-- Also check if there are any case sensitivity issues
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    PasswordHash,
    Role,
    IsActive,
    CreatedAt,
    LastLoginAt
FROM Users 
WHERE LOWER(Email) = LOWER('pintotnet@gmail.com');
