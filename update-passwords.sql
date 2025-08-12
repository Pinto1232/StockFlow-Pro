-- Update existing users with proper password hashes
USE StockFlowProDB;
GO

-- Update admin user with proper PBKDF2 hash for "admin" password
UPDATE Users 
SET PasswordHash = 'IloP18Hg6XNq2fLHwBfsrYSFSojwvT++KLivbGb6UN0fGPXNrwRTd4KNwwVl/w6pljOO74U05PHqD0xjn/Jp5g=='
WHERE Email = 'admin@example.com';

-- Update admin@stockflowpro.com user with proper PBKDF2 hash for "SecureAdmin2024!" password
UPDATE Users 
SET PasswordHash = 'FBaHsHTWSdEZBEfVCpevZLuaRLXWPXjxikHRKVFLxcwaTZk+M8WoVfnK+wbQzf/FrXTFn5K25mfWN1ALJAaYqQ=='
WHERE Email = 'admin@stockflowpro.com';

-- Verify the updates
SELECT Id, FirstName, LastName, Email, 
       LEFT(PasswordHash, 50) + '...' as PasswordHashPreview,
       IsActive, Role, CreatedAt
FROM Users 
WHERE Email IN ('admin@example.com', 'admin@stockflowpro.com');

PRINT 'Password hashes updated successfully!';
