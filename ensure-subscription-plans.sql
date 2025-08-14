-- Script to populate subscription plans in the database if they don't exist
-- This ensures the backend has data to serve to the frontend

-- Check if we have subscription plans
DECLARE @PlanCount INT
SELECT @PlanCount = COUNT(*) FROM SubscriptionPlans WHERE IsActive = 1 AND IsPublic = 1

IF @PlanCount < 3
BEGIN
    PRINT 'Adding default subscription plans to database...'
    
    -- Delete existing plans first (optional)
    DELETE FROM SubscriptionPlans WHERE IsActive = 1 AND IsPublic = 1
    
    -- Insert Basic Monthly Plan
    INSERT INTO SubscriptionPlans (
        Id, Name, Description, Price, Currency, BillingInterval, BillingIntervalCount,
        IsActive, IsPublic, MaxUsers, MaxProjects, MaxStorageGB, HasAdvancedReporting,
        HasApiAccess, HasPrioritySupport, SortOrder, CreatedAt
    ) VALUES (
        NEWID(), 
        'Basic', 
        'Perfect for individuals and small teams getting started with inventory management',
        29.99, 'USD', 1, 1, 1, 1, 5, 10, 10, 0, 0, 0, 1, GETDATE()
    )
    
    -- Insert Professional Monthly Plan  
    INSERT INTO SubscriptionPlans (
        Id, Name, Description, Price, Currency, BillingInterval, BillingIntervalCount,
        IsActive, IsPublic, MaxUsers, MaxProjects, MaxStorageGB, HasAdvancedReporting,
        HasApiAccess, HasPrioritySupport, SortOrder, CreatedAt
    ) VALUES (
        NEWID(), 
        'Professional', 
        'Ideal for growing businesses with advanced features and team collaboration',
        79.99, 'USD', 1, 1, 1, 1, 25, 50, 100, 1, 1, 1, 2, GETDATE()
    )
    
    -- Insert Enterprise Monthly Plan
    INSERT INTO SubscriptionPlans (
        Id, Name, Description, Price, Currency, BillingInterval, BillingIntervalCount,
        IsActive, IsPublic, MaxUsers, MaxProjects, MaxStorageGB, HasAdvancedReporting,
        HasApiAccess, HasPrioritySupport, SortOrder, CreatedAt
    ) VALUES (
        NEWID(), 
        'Enterprise', 
        'For large organizations with unlimited users and premium support',
        199.99, 'USD', 1, 1, 1, 1, NULL, NULL, NULL, 1, 1, 1, 3, GETDATE()
    )
    
    -- Insert Annual Plans (with 20% discount)
    INSERT INTO SubscriptionPlans (
        Id, Name, Description, Price, Currency, BillingInterval, BillingIntervalCount,
        IsActive, IsPublic, MaxUsers, MaxProjects, MaxStorageGB, HasAdvancedReporting,
        HasApiAccess, HasPrioritySupport, SortOrder, CreatedAt
    ) VALUES (
        NEWID(), 
        'Basic Annual', 
        'Basic plan with annual billing - Save 20%',
        287.99, 'USD', 4, 1, 1, 1, 5, 10, 10, 0, 0, 0, 4, GETDATE()
    )
    
    INSERT INTO SubscriptionPlans (
        Id, Name, Description, Price, Currency, BillingInterval, BillingIntervalCount,
        IsActive, IsPublic, MaxUsers, MaxProjects, MaxStorageGB, HasAdvancedReporting,
        HasApiAccess, HasPrioritySupport, SortOrder, CreatedAt
    ) VALUES (
        NEWID(), 
        'Professional Annual', 
        'Professional plan with annual billing - Save 20%',
        767.99, 'USD', 4, 1, 1, 1, 25, 50, 100, 1, 1, 1, 5, GETDATE()
    )
    
    INSERT INTO SubscriptionPlans (
        Id, Name, Description, Price, Currency, BillingInterval, BillingIntervalCount,
        IsActive, IsPublic, MaxUsers, MaxProjects, MaxStorageGB, HasAdvancedReporting,
        HasApiAccess, HasPrioritySupport, SortOrder, CreatedAt
    ) VALUES (
        NEWID(), 
        'Enterprise Annual', 
        'Enterprise plan with annual billing - Save 20%',
        1919.99, 'USD', 4, 1, 1, 1, NULL, NULL, NULL, 1, 1, 1, 6, GETDATE()
    )
    
    PRINT 'Default subscription plans added successfully!'
END
ELSE
BEGIN
    PRINT 'Subscription plans already exist in database.'
END

-- Show current plans
SELECT 
    Name, 
    Description, 
    Price, 
    CASE BillingInterval 
        WHEN 1 THEN 'Monthly' 
        WHEN 4 THEN 'Annual' 
        ELSE 'Other' 
    END as BillingType,
    IsActive, 
    IsPublic, 
    SortOrder
FROM SubscriptionPlans 
WHERE IsActive = 1 AND IsPublic = 1 
ORDER BY SortOrder
