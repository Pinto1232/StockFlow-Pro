# Subscription Payment System Database Design

## Overview

This document outlines the comprehensive database design for the StockFlow Pro subscription payment system. The design supports multiple subscription plans, flexible billing intervals, payment processing, refunds, and detailed audit trails.

## Database Schema

### Core Entities

#### 1. SubscriptionPlans
Defines the available subscription plans with pricing and features.

**Key Fields:**
- `Id` (Guid) - Primary key
- `Name` (string, 100) - Plan name (e.g., "Basic", "Pro", "Enterprise")
- `Description` (string, 500) - Plan description
- `Price` (decimal) - Plan price
- `Currency` (string, 3) - Currency code (default: USD)
- `BillingInterval` (enum) - Monthly, Quarterly, Annual, etc.
- `BillingIntervalCount` (int) - Number of intervals (default: 1)
- `TrialPeriodDays` (int?) - Trial period in days
- `IsActive` (bool) - Whether plan is active
- `IsPublic` (bool) - Whether plan is publicly available

**Features & Limits:**
- `MaxUsers` (int?) - Maximum users allowed
- `MaxProjects` (int?) - Maximum projects allowed
- `MaxStorageGB` (int?) - Storage limit in GB
- `HasAdvancedReporting` (bool) - Advanced reporting access
- `HasApiAccess` (bool) - API access
- `HasPrioritySupport` (bool) - Priority support

**External Integration:**
- `StripeProductId` (string?) - Stripe product ID
- `StripePriceId` (string?) - Stripe price ID
- `PayPalPlanId` (string?) - PayPal plan ID

#### 2. Subscriptions
Represents user subscriptions to specific plans.

**Key Fields:**
- `Id` (Guid) - Primary key
- `UserId` (Guid) - Foreign key to Users table
- `SubscriptionPlanId` (Guid) - Foreign key to SubscriptionPlans
- `Status` (enum) - Active, Suspended, Cancelled, Expired, Trial, PastDue, Pending
- `StartDate` (DateTime) - Subscription start date
- `EndDate` (DateTime?) - Subscription end date
- `TrialEndDate` (DateTime?) - Trial end date
- `CurrentPeriodStart` (DateTime) - Current billing period start
- `CurrentPeriodEnd` (DateTime) - Current billing period end
- `CurrentPrice` (decimal) - Current subscription price
- `Quantity` (int) - Subscription quantity (default: 1)

**Cancellation:**
- `CancelledAt` (DateTime?) - Cancellation timestamp
- `CancelAtPeriodEnd` (DateTime?) - Scheduled cancellation date
- `CancellationReason` (string?) - Reason for cancellation

**Payment Tracking:**
- `NextBillingDate` (DateTime?) - Next billing date
- `FailedPaymentAttempts` (int) - Failed payment count
- `GracePeriodDays` (int?) - Grace period duration
- `GracePeriodEndDate` (DateTime?) - Grace period end

**External Integration:**
- `StripeSubscriptionId` (string?) - Stripe subscription ID
- `StripeCustomerId` (string?) - Stripe customer ID
- `PayPalSubscriptionId` (string?) - PayPal subscription ID

#### 3. Payments
Records all payment transactions.

**Key Fields:**
- `Id` (Guid) - Primary key
- `SubscriptionId` (Guid) - Foreign key to Subscriptions
- `UserId` (Guid) - Foreign key to Users
- `Amount` (decimal) - Payment amount
- `Currency` (string, 3) - Currency code
- `Status` (enum) - Pending, Completed, Failed, Cancelled, Refunded, etc.
- `PaymentMethod` (enum) - CreditCard, PayPal, BankTransfer, etc.
- `PaymentDate` (DateTime) - Payment date
- `ProcessedAt` (DateTime?) - Processing timestamp
- `TransactionId` (string) - Internal transaction ID
- `ExternalTransactionId` (string?) - External provider transaction ID

**Failure Handling:**
- `FailureReason` (string?) - Failure reason
- `FailureCode` (string?) - Failure code
- `AttemptCount` (int) - Retry attempt count
- `NextRetryAt` (DateTime?) - Next retry timestamp

**Refunds:**
- `RefundedAmount` (decimal?) - Total refunded amount
- `RefundedAt` (DateTime?) - Refund timestamp
- `RefundReason` (string?) - Refund reason

**Billing Period:**
- `BillingPeriodStart` (DateTime?) - Billing period start
- `BillingPeriodEnd` (DateTime?) - Billing period end

#### 4. PaymentRefunds
Detailed refund records for payments.

**Key Fields:**
- `Id` (Guid) - Primary key
- `PaymentId` (Guid) - Foreign key to Payments
- `Amount` (decimal) - Refund amount
- `Currency` (string, 3) - Currency code
- `Reason` (string?) - Refund reason
- `RefundDate` (DateTime) - Refund date
- `ExternalRefundId` (string?) - External refund ID
- `StripeRefundId` (string?) - Stripe refund ID
- `PayPalRefundId` (string?) - PayPal refund ID

#### 5. SubscriptionHistories
Audit trail for subscription status changes.

**Key Fields:**
- `Id` (Guid) - Primary key
- `SubscriptionId` (Guid) - Foreign key to Subscriptions
- `FromStatus` (enum) - Previous status
- `ToStatus` (enum) - New status
- `Reason` (string?) - Change reason
- `ChangedAt` (DateTime) - Change timestamp
- `ChangedBy` (string?) - User or system identifier

#### 6. PlanFeatures
Defines available features that can be assigned to plans.

**Key Fields:**
- `Id` (Guid) - Primary key
- `Name` (string, 100) - Feature name
- `Description` (string, 500) - Feature description
- `FeatureKey` (string, 100) - Unique feature identifier
- `FeatureType` (string, 50) - boolean, numeric, text, json
- `DefaultValue` (string?) - Default feature value
- `IsActive` (bool) - Whether feature is active

#### 7. SubscriptionPlanFeatures
Many-to-many relationship between plans and features.

**Key Fields:**
- `Id` (Guid) - Primary key
- `SubscriptionPlanId` (Guid) - Foreign key to SubscriptionPlans
- `PlanFeatureId` (Guid) - Foreign key to PlanFeatures
- `Value` (string?) - Feature value for this plan
- `IsEnabled` (bool) - Whether feature is enabled

#### 8. PaymentMethods
Saved payment methods for users.

**Key Fields:**
- `Id` (Guid) - Primary key
- `UserId` (Guid) - Foreign key to Users
- `Type` (enum) - CreditCard, DebitCard, PayPal, etc.
- `Last4Digits` (string?) - Last 4 digits of card
- `Brand` (string?) - Card brand (Visa, MasterCard, etc.)
- `ExpiryMonth` (int?) - Card expiry month
- `ExpiryYear` (int?) - Card expiry year
- `HolderName` (string?) - Cardholder name
- `IsDefault` (bool) - Default payment method
- `IsActive` (bool) - Whether method is active

## Enums

### SubscriptionStatus
- `Active` (1) - Subscription is active
- `Suspended` (2) - Temporarily suspended
- `Cancelled` (3) - Cancelled but may be active until period end
- `Expired` (4) - Subscription has expired
- `Trial` (5) - In trial period
- `PastDue` (6) - Payment failed, outside grace period
- `Pending` (7) - Pending activation

### BillingInterval
- `Monthly` (1) - Monthly billing
- `Quarterly` (2) - Every 3 months
- `SemiAnnual` (3) - Every 6 months
- `Annual` (4) - Annual billing
- `Weekly` (5) - Weekly billing
- `OneTime` (6) - One-time payment

### PaymentStatus
- `Pending` (1) - Payment pending
- `Completed` (2) - Payment successful
- `Failed` (3) - Payment failed
- `Cancelled` (4) - Payment cancelled
- `Refunded` (5) - Fully refunded
- `PartiallyRefunded` (6) - Partially refunded
- `Processing` (7) - Being processed
- `RequiresAction` (8) - Requires additional action
- `Disputed` (9) - Payment disputed

### PaymentMethod
- `CreditCard` (1) - Credit card
- `DebitCard` (2) - Debit card
- `PayPal` (3) - PayPal
- `BankTransfer` (4) - Bank transfer/ACH
- `ApplePay` (5) - Apple Pay
- `GooglePay` (6) - Google Pay
- `Stripe` (7) - Stripe
- `WireTransfer` (8) - Wire transfer
- `Cryptocurrency` (9) - Cryptocurrency
- `Other` (10) - Other methods

## Key Relationships

1. **User → Subscriptions** (1:N)
   - A user can have multiple subscriptions (current and historical)

2. **SubscriptionPlan → Subscriptions** (1:N)
   - A plan can have multiple subscriptions

3. **Subscription → Payments** (1:N)
   - A subscription can have multiple payments

4. **Payment → PaymentRefunds** (1:N)
   - A payment can have multiple refunds

5. **Subscription → SubscriptionHistories** (1:N)
   - A subscription has multiple history records

6. **SubscriptionPlan ↔ PlanFeatures** (N:N via SubscriptionPlanFeatures)
   - Plans can have multiple features with specific values

7. **User → PaymentMethods** (1:N)
   - A user can have multiple saved payment methods

## Indexes

### Performance Indexes
- `Subscriptions.UserId` - User subscription lookups
- `Subscriptions.Status` - Status-based queries
- `Subscriptions.NextBillingDate` - Billing processing
- `Payments.SubscriptionId` - Payment history
- `Payments.Status` - Payment status queries
- `Payments.PaymentDate` - Date-based queries

### Unique Indexes
- `SubscriptionPlans.Name` - Unique plan names
- `PlanFeatures.FeatureKey` - Unique feature keys
- `Payments.TransactionId` - Unique transaction IDs
- External provider IDs (Stripe, PayPal) - Prevent duplicates

### Composite Indexes
- `(UserId, Status)` - User subscription status queries
- `(SubscriptionPlanId, Status)` - Plan-based analytics
- `(PaymentDate, Status)` - Payment reporting

## Data Integrity

### Constraints
- Foreign key constraints with appropriate cascade/restrict rules
- Check constraints for positive amounts and valid date ranges
- Unique constraints for external provider IDs

### Business Rules
- Only one default payment method per user
- Subscription end date must be after start date
- Refund amount cannot exceed payment amount
- Trial end date must be after start date

## Security Considerations

### Sensitive Data
- Payment method details stored as encrypted JSON
- PCI compliance for card data (use tokenization)
- Audit trails for all financial transactions

### Access Control
- Role-based access to financial data
- Separate permissions for viewing vs. modifying payments
- Admin-only access to refund operations

## Extensibility

### Metadata Fields
- JSON metadata fields in key entities for future extensions
- Feature system allows adding new plan capabilities
- External provider ID fields support multiple payment processors

### Scalability
- Partitioning strategies for large payment tables
- Archiving strategies for historical data
- Read replicas for reporting queries

## Migration Strategy

### Phase 1: Core Tables
1. Create subscription plans and features
2. Set up basic subscription management
3. Implement payment processing

### Phase 2: Advanced Features
1. Add payment method storage
2. Implement refund processing
3. Add comprehensive audit trails

### Phase 3: Optimization
1. Add performance indexes
2. Implement archiving
3. Add reporting views

## Sample Data

### Basic Subscription Plans
```sql
-- Basic Plan
INSERT INTO SubscriptionPlans (Id, Name, Description, Price, BillingInterval, TrialPeriodDays, MaxUsers, MaxProjects)
VALUES (NEWID(), 'Basic', 'Perfect for small teams', 29.99, 1, 14, 5, 10);

-- Pro Plan
INSERT INTO SubscriptionPlans (Id, Name, Description, Price, BillingInterval, TrialPeriodDays, MaxUsers, MaxProjects, HasAdvancedReporting, HasApiAccess)
VALUES (NEWID(), 'Pro', 'For growing businesses', 79.99, 1, 14, 25, 50, 1, 1);

-- Enterprise Plan
INSERT INTO SubscriptionPlans (Id, Name, Description, Price, BillingInterval, TrialPeriodDays, MaxUsers, MaxProjects, HasAdvancedReporting, HasApiAccess, HasPrioritySupport)
VALUES (NEWID(), 'Enterprise', 'For large organizations', 199.99, 1, 14, NULL, NULL, 1, 1, 1);
```

This database design provides a robust foundation for a subscription payment system with comprehensive audit trails, flexible billing options, and support for multiple payment providers.