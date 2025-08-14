-- Check if tables exist and their structure
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('LandingFeatures', 'LandingTestimonials', 'LandingStats')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Check if tables exist
SELECT name FROM sys.tables WHERE name LIKE 'Landing%';