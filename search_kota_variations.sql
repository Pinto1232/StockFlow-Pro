-- Search for emails containing 'kota' (case-insensitive)
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    PasswordHash,
    IsActive,
    Role,
    CreatedAt
FROM Users 
WHERE Email LIKE '%kota%' OR Email LIKE '%KOTA%';

-- Search for Gmail users
SELECT 
    Id,
    FirstName,
    LastName,
    Email,
    LEFT(PasswordHash, 50) + '...' as PasswordHash_Preview,
    IsActive,
    Role,
    CreatedAt
FROM Users 
WHERE Email LIKE '%gmail.com%'
ORDER BY CreatedAt DESC;

-- Get a count of all users by email domain
SELECT 
    RIGHT(Email, LEN(Email) - CHARINDEX('@', Email)) as EmailDomain,
    COUNT(*) as UserCount
FROM Users 
GROUP BY RIGHT(Email, LEN(Email) - CHARINDEX('@', Email))
ORDER BY UserCount DESC;
