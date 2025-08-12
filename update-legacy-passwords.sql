-- Create users with legacy SHA256 password format
USE StockFlowProDB;
GO

-- Update admin@example.com with legacy hash for "admin" password
UPDATE Users 
SET PasswordHash = '+EbsAtgJ5ZeBf2C67ZPc2Qu/kvCCWinWOZs19Ewa0qA=:salt123'
WHERE Email = 'admin@example.com';

-- Update admin@stockflowpro.com with legacy hash for "SecureAdmin2024!" password  
UPDATE Users 
SET PasswordHash = 'rMeDszvWGRrrThJWFR2IpwVx7dNIYfN91vZUYgLW9wY=:salt456'
WHERE Email = 'admin@stockflowpro.com';

-- Verify the updates
SELECT Id, FirstName, LastName, Email, PasswordHash, IsActive, Role, CreatedAt
FROM Users 
WHERE Email IN ('admin@example.com', 'admin@stockflowpro.com');

PRINT 'Legacy password hashes updated successfully!';
