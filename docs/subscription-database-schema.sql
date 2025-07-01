-- StockFlow Pro Subscription Payment System Database Schema
-- This script creates the complete database schema for the subscription system

-- =====================================================
-- Create Tables
-- =====================================================

-- Subscription Plans Table
CREATE TABLE [dbo].[SubscriptionPlans] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT 'USD',
    [BillingInterval] int NOT NULL, -- 1=Monthly, 2=Quarterly, 3=SemiAnnual, 4=Annual, 5=Weekly, 6=OneTime
    [BillingIntervalCount] int NOT NULL DEFAULT 1,
    [IsActive] bit NOT NULL DEFAULT 1,
    [IsPublic] bit NOT NULL DEFAULT 1,
    [TrialPeriodDays] int NULL,
    [MaxUsers] int NULL,
    [MaxProjects] int NULL,
    [MaxStorageGB] int NULL,
    [HasAdvancedReporting] bit NOT NULL DEFAULT 0,
    [HasApiAccess] bit NOT NULL DEFAULT 0,
    [HasPrioritySupport] bit NOT NULL DEFAULT 0,
    [Features] nvarchar(max) NULL, -- JSON string
    [Metadata] nvarchar(max) NULL, -- JSON string
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL,
    [SortOrder] int NOT NULL DEFAULT 0,
    [StripeProductId] nvarchar(100) NULL,
    [StripePriceId] nvarchar(100) NULL,
    [PayPalPlanId] nvarchar(100) NULL
);

-- Subscriptions Table
CREATE TABLE [dbo].[Subscriptions] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [UserId] uniqueidentifier NOT NULL,
    [SubscriptionPlanId] uniqueidentifier NOT NULL,
    [Status] int NOT NULL, -- 1=Active, 2=Suspended, 3=Cancelled, 4=Expired, 5=Trial, 6=PastDue, 7=Pending
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NULL,
    [TrialEndDate] datetime2 NULL,
    [CurrentPeriodStart] datetime2 NOT NULL,
    [CurrentPeriodEnd] datetime2 NOT NULL,
    [CancelledAt] datetime2 NULL,
    [CancelAtPeriodEnd] datetime2 NULL,
    [CancellationReason] nvarchar(500) NULL,
    [CurrentPrice] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT 'USD',
    [Quantity] int NOT NULL DEFAULT 1,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL,
    [StripeSubscriptionId] nvarchar(100) NULL,
    [StripeCustomerId] nvarchar(100) NULL,
    [PayPalSubscriptionId] nvarchar(100) NULL,
    [PayPalPayerId] nvarchar(100) NULL,
    [NextBillingDate] datetime2 NULL,
    [GracePeriodDays] int NULL,
    [GracePeriodEndDate] datetime2 NULL,
    [FailedPaymentAttempts] int NOT NULL DEFAULT 0,
    [LastPaymentAttemptDate] datetime2 NULL,
    [Notes] nvarchar(1000) NULL,
    [Metadata] nvarchar(max) NULL -- JSON string
);

-- Payments Table
CREATE TABLE [dbo].[Payments] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [SubscriptionId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT 'USD',
    [Status] int NOT NULL, -- 1=Pending, 2=Completed, 3=Failed, 4=Cancelled, 5=Refunded, 6=PartiallyRefunded, 7=Processing, 8=RequiresAction, 9=Disputed
    [PaymentMethod] int NOT NULL, -- 1=CreditCard, 2=DebitCard, 3=PayPal, 4=BankTransfer, etc.
    [PaymentDate] datetime2 NOT NULL,
    [ProcessedAt] datetime2 NULL,
    [TransactionId] nvarchar(50) NOT NULL,
    [ExternalTransactionId] nvarchar(100) NULL,
    [PaymentIntentId] nvarchar(100) NULL,
    [FailureReason] nvarchar(500) NULL,
    [FailureCode] nvarchar(50) NULL,
    [RefundedAmount] decimal(18,2) NULL,
    [RefundedAt] datetime2 NULL,
    [RefundReason] nvarchar(500) NULL,
    [Description] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL,
    [StripeChargeId] nvarchar(100) NULL,
    [StripePaymentIntentId] nvarchar(100) NULL,
    [PayPalTransactionId] nvarchar(100) NULL,
    [PayPalPaymentId] nvarchar(100) NULL,
    [BillingPeriodStart] datetime2 NULL,
    [BillingPeriodEnd] datetime2 NULL,
    [PaymentMethodDetails] nvarchar(max) NULL, -- JSON string
    [BillingAddress] nvarchar(max) NULL, -- JSON string
    [Metadata] nvarchar(max) NULL, -- JSON string
    [AttemptCount] int NOT NULL DEFAULT 1,
    [NextRetryAt] datetime2 NULL,
    [RetryReason] nvarchar(500) NULL
);

-- Payment Refunds Table
CREATE TABLE [dbo].[PaymentRefunds] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [PaymentId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT 'USD',
    [Reason] nvarchar(500) NULL,
    [RefundDate] datetime2 NOT NULL,
    [ExternalRefundId] nvarchar(100) NULL,
    [StripeRefundId] nvarchar(100) NULL,
    [PayPalRefundId] nvarchar(100) NULL,
    [Notes] nvarchar(1000) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL
);

-- Subscription History Table
CREATE TABLE [dbo].[SubscriptionHistories] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [SubscriptionId] uniqueidentifier NOT NULL,
    [FromStatus] int NOT NULL,
    [ToStatus] int NOT NULL,
    [Reason] nvarchar(500) NULL,
    [ChangedAt] datetime2 NOT NULL,
    [ChangedBy] nvarchar(100) NULL,
    [Notes] nvarchar(1000) NULL,
    [Metadata] nvarchar(max) NULL, -- JSON string
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE()
);

-- Plan Features Table
CREATE TABLE [dbo].[PlanFeatures] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [FeatureKey] nvarchar(100) NOT NULL,
    [DefaultValue] nvarchar(500) NULL,
    [FeatureType] nvarchar(50) NOT NULL DEFAULT 'boolean',
    [IsActive] bit NOT NULL DEFAULT 1,
    [SortOrder] int NOT NULL DEFAULT 0,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL
);

-- Subscription Plan Features Table (Many-to-Many)
CREATE TABLE [dbo].[SubscriptionPlanFeatures] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [SubscriptionPlanId] uniqueidentifier NOT NULL,
    [PlanFeatureId] uniqueidentifier NOT NULL,
    [Value] nvarchar(500) NULL,
    [IsEnabled] bit NOT NULL DEFAULT 1,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL
);

-- Payment Methods Table
CREATE TABLE [dbo].[PaymentMethods] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [UserId] uniqueidentifier NOT NULL,
    [Type] int NOT NULL, -- 1=CreditCard, 2=DebitCard, 3=PayPal, etc.
    [Last4Digits] nvarchar(4) NULL,
    [Brand] nvarchar(50) NULL,
    [ExpiryMonth] int NULL,
    [ExpiryYear] int NULL,
    [HolderName] nvarchar(100) NULL,
    [IsDefault] bit NOT NULL DEFAULT 0,
    [IsActive] bit NOT NULL DEFAULT 1,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL,
    [StripePaymentMethodId] nvarchar(100) NULL,
    [PayPalPaymentMethodId] nvarchar(100) NULL,
    [BillingAddress] nvarchar(max) NULL, -- JSON string
    [Metadata] nvarchar(max) NULL -- JSON string
);

-- =====================================================
-- Create Indexes
-- =====================================================

-- SubscriptionPlans Indexes
CREATE UNIQUE INDEX [IX_SubscriptionPlans_Name] ON [dbo].[SubscriptionPlans] ([Name]);
CREATE INDEX [IX_SubscriptionPlans_IsActive] ON [dbo].[SubscriptionPlans] ([IsActive]);
CREATE INDEX [IX_SubscriptionPlans_IsPublic] ON [dbo].[SubscriptionPlans] ([IsPublic]);
CREATE INDEX [IX_SubscriptionPlans_SortOrder] ON [dbo].[SubscriptionPlans] ([SortOrder]);
CREATE UNIQUE INDEX [IX_SubscriptionPlans_StripeProductId] ON [dbo].[SubscriptionPlans] ([StripeProductId]) WHERE [StripeProductId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_SubscriptionPlans_StripePriceId] ON [dbo].[SubscriptionPlans] ([StripePriceId]) WHERE [StripePriceId] IS NOT NULL;

-- Subscriptions Indexes
CREATE INDEX [IX_Subscriptions_UserId] ON [dbo].[Subscriptions] ([UserId]);
CREATE INDEX [IX_Subscriptions_SubscriptionPlanId] ON [dbo].[Subscriptions] ([SubscriptionPlanId]);
CREATE INDEX [IX_Subscriptions_Status] ON [dbo].[Subscriptions] ([Status]);
CREATE INDEX [IX_Subscriptions_StartDate] ON [dbo].[Subscriptions] ([StartDate]);
CREATE INDEX [IX_Subscriptions_EndDate] ON [dbo].[Subscriptions] ([EndDate]);
CREATE INDEX [IX_Subscriptions_CurrentPeriodEnd] ON [dbo].[Subscriptions] ([CurrentPeriodEnd]);
CREATE INDEX [IX_Subscriptions_NextBillingDate] ON [dbo].[Subscriptions] ([NextBillingDate]);
CREATE UNIQUE INDEX [IX_Subscriptions_StripeSubscriptionId] ON [dbo].[Subscriptions] ([StripeSubscriptionId]) WHERE [StripeSubscriptionId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_Subscriptions_PayPalSubscriptionId] ON [dbo].[Subscriptions] ([PayPalSubscriptionId]) WHERE [PayPalSubscriptionId] IS NOT NULL;
CREATE INDEX [IX_Subscriptions_UserId_Status] ON [dbo].[Subscriptions] ([UserId], [Status]);
CREATE INDEX [IX_Subscriptions_SubscriptionPlanId_Status] ON [dbo].[Subscriptions] ([SubscriptionPlanId], [Status]);

-- Payments Indexes
CREATE INDEX [IX_Payments_SubscriptionId] ON [dbo].[Payments] ([SubscriptionId]);
CREATE INDEX [IX_Payments_UserId] ON [dbo].[Payments] ([UserId]);
CREATE INDEX [IX_Payments_Status] ON [dbo].[Payments] ([Status]);
CREATE INDEX [IX_Payments_PaymentDate] ON [dbo].[Payments] ([PaymentDate]);
CREATE UNIQUE INDEX [IX_Payments_TransactionId] ON [dbo].[Payments] ([TransactionId]);
CREATE UNIQUE INDEX [IX_Payments_ExternalTransactionId] ON [dbo].[Payments] ([ExternalTransactionId]) WHERE [ExternalTransactionId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_Payments_StripeChargeId] ON [dbo].[Payments] ([StripeChargeId]) WHERE [StripeChargeId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_Payments_PayPalTransactionId] ON [dbo].[Payments] ([PayPalTransactionId]) WHERE [PayPalTransactionId] IS NOT NULL;
CREATE INDEX [IX_Payments_UserId_Status] ON [dbo].[Payments] ([UserId], [Status]);
CREATE INDEX [IX_Payments_SubscriptionId_Status] ON [dbo].[Payments] ([SubscriptionId], [Status]);
CREATE INDEX [IX_Payments_PaymentDate_Status] ON [dbo].[Payments] ([PaymentDate], [Status]);

-- PaymentRefunds Indexes
CREATE INDEX [IX_PaymentRefunds_PaymentId] ON [dbo].[PaymentRefunds] ([PaymentId]);
CREATE INDEX [IX_PaymentRefunds_RefundDate] ON [dbo].[PaymentRefunds] ([RefundDate]);
CREATE UNIQUE INDEX [IX_PaymentRefunds_ExternalRefundId] ON [dbo].[PaymentRefunds] ([ExternalRefundId]) WHERE [ExternalRefundId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_PaymentRefunds_StripeRefundId] ON [dbo].[PaymentRefunds] ([StripeRefundId]) WHERE [StripeRefundId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_PaymentRefunds_PayPalRefundId] ON [dbo].[PaymentRefunds] ([PayPalRefundId]) WHERE [PayPalRefundId] IS NOT NULL;

-- SubscriptionHistories Indexes
CREATE INDEX [IX_SubscriptionHistories_SubscriptionId] ON [dbo].[SubscriptionHistories] ([SubscriptionId]);
CREATE INDEX [IX_SubscriptionHistories_ChangedAt] ON [dbo].[SubscriptionHistories] ([ChangedAt]);
CREATE INDEX [IX_SubscriptionHistories_FromStatus] ON [dbo].[SubscriptionHistories] ([FromStatus]);
CREATE INDEX [IX_SubscriptionHistories_ToStatus] ON [dbo].[SubscriptionHistories] ([ToStatus]);
CREATE INDEX [IX_SubscriptionHistories_SubscriptionId_ChangedAt] ON [dbo].[SubscriptionHistories] ([SubscriptionId], [ChangedAt]);

-- PlanFeatures Indexes
CREATE UNIQUE INDEX [IX_PlanFeatures_FeatureKey] ON [dbo].[PlanFeatures] ([FeatureKey]);
CREATE INDEX [IX_PlanFeatures_IsActive] ON [dbo].[PlanFeatures] ([IsActive]);
CREATE INDEX [IX_PlanFeatures_SortOrder] ON [dbo].[PlanFeatures] ([SortOrder]);

-- SubscriptionPlanFeatures Indexes
CREATE INDEX [IX_SubscriptionPlanFeatures_SubscriptionPlanId] ON [dbo].[SubscriptionPlanFeatures] ([SubscriptionPlanId]);
CREATE INDEX [IX_SubscriptionPlanFeatures_PlanFeatureId] ON [dbo].[SubscriptionPlanFeatures] ([PlanFeatureId]);
CREATE INDEX [IX_SubscriptionPlanFeatures_IsEnabled] ON [dbo].[SubscriptionPlanFeatures] ([IsEnabled]);
CREATE UNIQUE INDEX [IX_SubscriptionPlanFeatures_SubscriptionPlanId_PlanFeatureId] ON [dbo].[SubscriptionPlanFeatures] ([SubscriptionPlanId], [PlanFeatureId]);

-- PaymentMethods Indexes
CREATE INDEX [IX_PaymentMethods_UserId] ON [dbo].[PaymentMethods] ([UserId]);
CREATE INDEX [IX_PaymentMethods_IsDefault] ON [dbo].[PaymentMethods] ([IsDefault]);
CREATE INDEX [IX_PaymentMethods_IsActive] ON [dbo].[PaymentMethods] ([IsActive]);
CREATE UNIQUE INDEX [IX_PaymentMethods_StripePaymentMethodId] ON [dbo].[PaymentMethods] ([StripePaymentMethodId]) WHERE [StripePaymentMethodId] IS NOT NULL;
CREATE UNIQUE INDEX [IX_PaymentMethods_PayPalPaymentMethodId] ON [dbo].[PaymentMethods] ([PayPalPaymentMethodId]) WHERE [PayPalPaymentMethodId] IS NOT NULL;
CREATE INDEX [IX_PaymentMethods_UserId_IsDefault] ON [dbo].[PaymentMethods] ([UserId], [IsDefault]);
CREATE INDEX [IX_PaymentMethods_UserId_IsActive] ON [dbo].[PaymentMethods] ([UserId], [IsActive]);

-- =====================================================
-- Create Foreign Key Constraints
-- =====================================================

-- Subscriptions Foreign Keys
ALTER TABLE [dbo].[Subscriptions] ADD CONSTRAINT [FK_Subscriptions_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]);

ALTER TABLE [dbo].[Subscriptions] ADD CONSTRAINT [FK_Subscriptions_SubscriptionPlans_SubscriptionPlanId] 
    FOREIGN KEY ([SubscriptionPlanId]) REFERENCES [dbo].[SubscriptionPlans] ([Id]);

-- Payments Foreign Keys
ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [FK_Payments_Subscriptions_SubscriptionId] 
    FOREIGN KEY ([SubscriptionId]) REFERENCES [dbo].[Subscriptions] ([Id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [FK_Payments_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]);

-- PaymentRefunds Foreign Keys
ALTER TABLE [dbo].[PaymentRefunds] ADD CONSTRAINT [FK_PaymentRefunds_Payments_PaymentId] 
    FOREIGN KEY ([PaymentId]) REFERENCES [dbo].[Payments] ([Id]) ON DELETE CASCADE;

-- SubscriptionHistories Foreign Keys
ALTER TABLE [dbo].[SubscriptionHistories] ADD CONSTRAINT [FK_SubscriptionHistories_Subscriptions_SubscriptionId] 
    FOREIGN KEY ([SubscriptionId]) REFERENCES [dbo].[Subscriptions] ([Id]) ON DELETE CASCADE;

-- SubscriptionPlanFeatures Foreign Keys
ALTER TABLE [dbo].[SubscriptionPlanFeatures] ADD CONSTRAINT [FK_SubscriptionPlanFeatures_SubscriptionPlans_SubscriptionPlanId] 
    FOREIGN KEY ([SubscriptionPlanId]) REFERENCES [dbo].[SubscriptionPlans] ([Id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[SubscriptionPlanFeatures] ADD CONSTRAINT [FK_SubscriptionPlanFeatures_PlanFeatures_PlanFeatureId] 
    FOREIGN KEY ([PlanFeatureId]) REFERENCES [dbo].[PlanFeatures] ([Id]) ON DELETE CASCADE;

-- PaymentMethods Foreign Keys
ALTER TABLE [dbo].[PaymentMethods] ADD CONSTRAINT [FK_PaymentMethods_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE;

-- =====================================================
-- Sample Data
-- =====================================================

-- Insert Sample Plan Features
INSERT INTO [dbo].[PlanFeatures] ([Id], [Name], [Description], [FeatureKey], [FeatureType], [DefaultValue])
VALUES 
    (NEWID(), 'Advanced Analytics', 'Access to advanced analytics and reporting', 'advanced_analytics', 'boolean', 'false'),
    (NEWID(), 'API Access', 'Full API access for integrations', 'api_access', 'boolean', 'false'),
    (NEWID(), 'Priority Support', '24/7 priority customer support', 'priority_support', 'boolean', 'false'),
    (NEWID(), 'Custom Branding', 'White-label and custom branding options', 'custom_branding', 'boolean', 'false'),
    (NEWID(), 'Data Export', 'Export data in various formats', 'data_export', 'boolean', 'true'),
    (NEWID(), 'Team Collaboration', 'Advanced team collaboration features', 'team_collaboration', 'boolean', 'false');

-- Insert Sample Subscription Plans
DECLARE @BasicPlanId uniqueidentifier = NEWID();
DECLARE @ProPlanId uniqueidentifier = NEWID();
DECLARE @EnterprisePlanId uniqueidentifier = NEWID();

INSERT INTO [dbo].[SubscriptionPlans] ([Id], [Name], [Description], [Price], [BillingInterval], [TrialPeriodDays], [MaxUsers], [MaxProjects], [MaxStorageGB])
VALUES 
    (@BasicPlanId, 'Basic', 'Perfect for individuals and small teams getting started', 29.99, 1, 14, 5, 10, 10),
    (@ProPlanId, 'Professional', 'Ideal for growing businesses and teams', 79.99, 1, 14, 25, 50, 100),
    (@EnterprisePlanId, 'Enterprise', 'For large organizations with advanced needs', 199.99, 1, 14, NULL, NULL, NULL);

-- Link features to plans
DECLARE @AdvancedAnalyticsId uniqueidentifier = (SELECT Id FROM [dbo].[PlanFeatures] WHERE [FeatureKey] = 'advanced_analytics');
DECLARE @ApiAccessId uniqueidentifier = (SELECT Id FROM [dbo].[PlanFeatures] WHERE [FeatureKey] = 'api_access');
DECLARE @PrioritySupportId uniqueidentifier = (SELECT Id FROM [dbo].[PlanFeatures] WHERE [FeatureKey] = 'priority_support');
DECLARE @CustomBrandingId uniqueidentifier = (SELECT Id FROM [dbo].[PlanFeatures] WHERE [FeatureKey] = 'custom_branding');
DECLARE @DataExportId uniqueidentifier = (SELECT Id FROM [dbo].[PlanFeatures] WHERE [FeatureKey] = 'data_export');
DECLARE @TeamCollaborationId uniqueidentifier = (SELECT Id FROM [dbo].[PlanFeatures] WHERE [FeatureKey] = 'team_collaboration');

-- Basic Plan Features
INSERT INTO [dbo].[SubscriptionPlanFeatures] ([Id], [SubscriptionPlanId], [PlanFeatureId], [Value], [IsEnabled])
VALUES 
    (NEWID(), @BasicPlanId, @DataExportId, 'true', 1);

-- Pro Plan Features
INSERT INTO [dbo].[SubscriptionPlanFeatures] ([Id], [SubscriptionPlanId], [PlanFeatureId], [Value], [IsEnabled])
VALUES 
    (NEWID(), @ProPlanId, @AdvancedAnalyticsId, 'true', 1),
    (NEWID(), @ProPlanId, @ApiAccessId, 'true', 1),
    (NEWID(), @ProPlanId, @DataExportId, 'true', 1),
    (NEWID(), @ProPlanId, @TeamCollaborationId, 'true', 1);

-- Enterprise Plan Features
INSERT INTO [dbo].[SubscriptionPlanFeatures] ([Id], [SubscriptionPlanId], [PlanFeatureId], [Value], [IsEnabled])
VALUES 
    (NEWID(), @EnterprisePlanId, @AdvancedAnalyticsId, 'true', 1),
    (NEWID(), @EnterprisePlanId, @ApiAccessId, 'true', 1),
    (NEWID(), @EnterprisePlanId, @PrioritySupportId, 'true', 1),
    (NEWID(), @EnterprisePlanId, @CustomBrandingId, 'true', 1),
    (NEWID(), @EnterprisePlanId, @DataExportId, 'true', 1),
    (NEWID(), @EnterprisePlanId, @TeamCollaborationId, 'true', 1);

-- =====================================================
-- Useful Views for Reporting
-- =====================================================

-- Active Subscriptions View
CREATE VIEW [dbo].[vw_ActiveSubscriptions] AS
SELECT 
    s.[Id],
    s.[UserId],
    u.[FirstName] + ' ' + u.[LastName] AS [UserName],
    u.[Email],
    sp.[Name] AS [PlanName],
    s.[Status],
    s.[CurrentPrice],
    s.[Currency],
    s.[CurrentPeriodStart],
    s.[CurrentPeriodEnd],
    s.[NextBillingDate],
    s.[CreatedAt]
FROM [dbo].[Subscriptions] s
INNER JOIN [dbo].[Users] u ON s.[UserId] = u.[Id]
INNER JOIN [dbo].[SubscriptionPlans] sp ON s.[SubscriptionPlanId] = sp.[Id]
WHERE s.[Status] IN (1, 5); -- Active or Trial

-- Monthly Revenue View
CREATE VIEW [dbo].[vw_MonthlyRevenue] AS
SELECT 
    YEAR(p.[PaymentDate]) AS [Year],
    MONTH(p.[PaymentDate]) AS [Month],
    COUNT(*) AS [PaymentCount],
    SUM(p.[Amount]) AS [TotalRevenue],
    AVG(p.[Amount]) AS [AveragePayment]
FROM [dbo].[Payments] p
WHERE p.[Status] = 2 -- Completed
GROUP BY YEAR(p.[PaymentDate]), MONTH(p.[PaymentDate]);

-- Subscription Plan Analytics View
CREATE VIEW [dbo].[vw_PlanAnalytics] AS
SELECT 
    sp.[Id],
    sp.[Name],
    sp.[Price],
    COUNT(s.[Id]) AS [TotalSubscriptions],
    COUNT(CASE WHEN s.[Status] = 1 THEN 1 END) AS [ActiveSubscriptions],
    COUNT(CASE WHEN s.[Status] = 5 THEN 1 END) AS [TrialSubscriptions],
    COUNT(CASE WHEN s.[Status] = 3 THEN 1 END) AS [CancelledSubscriptions],
    SUM(CASE WHEN s.[Status] = 1 THEN s.[CurrentPrice] * s.[Quantity] ELSE 0 END) AS [MonthlyRecurringRevenue]
FROM [dbo].[SubscriptionPlans] sp
LEFT JOIN [dbo].[Subscriptions] s ON sp.[Id] = s.[SubscriptionPlanId]
GROUP BY sp.[Id], sp.[Name], sp.[Price];

PRINT 'Subscription payment system database schema created successfully!';