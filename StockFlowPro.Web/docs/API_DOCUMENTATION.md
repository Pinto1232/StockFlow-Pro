# StockFlow Pro - API Documentation

## Overview

StockFlow Pro provides a comprehensive RESTful API for inventory management, user administration, and business operations. The API follows REST principles and returns JSON responses.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Credentials (Development)
- **Username**: admin
- **Password**: admin

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 204  | No Content - Request successful, no content returned |
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation errors |
| 500  | Internal Server Error - Server error |

---

# User Management API

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users` | Get all users | ✅ | Admin, Manager |
| GET | `/api/users/{id}` | Get user by ID | ✅ | User, Manager, Admin |
| GET | `/api/users/by-email/{email}` | Get user by email | ✅ | User, Manager, Admin |
| GET | `/api/users/search` | Search users | ✅ | User, Manager, Admin |
| POST | `/api/users` | Create new user | ✅ | Admin |
| PUT | `/api/users/{id}` | Update user | ✅ | User, Manager, Admin |
| PUT | `/api/users/{id}/email` | Update user email | ✅ | User, Manager, Admin |
| PATCH | `/api/users/{id}/status` | Toggle user status | ✅ | Admin |
| DELETE | `/api/users/{id}` | Delete user | ✅ | Admin |
| GET | `/api/users/reporting` | Get reporting data | ✅ | Manager, Admin |

## Data Models

### UserDto
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "age": 34,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "role": "User"
}
```

### CreateUserDto
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "role": "User"
}
```

### UpdateUserDto
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "role": "Manager"
}
```

### UpdateUserEmailDto
```json
{
  "email": "newemail@example.com"
}
```

### User Roles
- `User` - Basic access to core functionality
- `Manager` - Enhanced access with reporting capabilities
- `Admin` - Full system access and user management

## API Endpoints

### Get All Users
```http
GET /api/users?activeOnly=false&page=1&pageSize=50
```

**Query Parameters:**
- `activeOnly` (boolean, optional) - Filter active users only
- `page` (integer, optional) - Page number (default: 1)
- `pageSize` (integer, optional) - Items per page (default: 50, max: 100)

**Response Headers:**
- `X-Total-Count` - Total number of users
- `X-Page` - Current page number
- `X-Page-Size` - Items per page

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "dateOfBirth": "1990-01-01T00:00:00Z",
    "age": 34,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "role": "User"
  }
]
```

### Get User by ID
```http
GET /api/users/{id}
```

**Path Parameters:**
- `id` (GUID, required) - User ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "age": 34,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "role": "User"
}
```

### Get User by Email
```http
GET /api/users/by-email/{email}
```

**Path Parameters:**
- `email` (string, required) - User email address

### Search Users
```http
GET /api/users/search?searchTerm=john&maxResults=20
```

**Query Parameters:**
- `searchTerm` (string, required) - Search term (minimum 2 characters)
- `maxResults` (integer, optional) - Maximum results (default: 20, max: 50)

### Create User
```http
POST /api/users
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "role": "User"
}
```

**Validation Rules:**
- `firstName`: Required, 1-50 characters
- `lastName`: Required, 1-50 characters
- `email`: Required, valid email format, unique
- `phoneNumber`: Optional, valid phone format
- `dateOfBirth`: Required, must be in the past
- `role`: Required, valid UserRole enum

### Update User
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-0123",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "role": "Manager"
}
```

### Update User Email
```http
PUT /api/users/{id}/email
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

### Toggle User Status
```http
PATCH /api/users/{id}/status
Content-Type: application/json

true
```

**Request Body:** Boolean value (true for active, false for inactive)

### Delete User
```http
DELETE /api/users/{id}
```

**Response:** 204 No Content

### Get User Statistics
```http
GET /api/optimizedusers/statistics
```

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 142,
  "inactiveUsers": 8,
  "adminUsers": 2,
  "managerUsers": 15,
  "regularUsers": 133,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

---

# Product Management API (Planned)

> **Note:** These endpoints are planned based on the system requirements but not yet implemented.

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/products` | Get all products | ✅ | User, Manager, Admin |
| GET | `/api/products/{id}` | Get product by ID | ✅ | User, Manager, Admin |
| GET | `/api/products/search` | Search products | ✅ | User, Manager, Admin |
| GET | `/api/products/low-stock` | Get low stock products | ✅ | Manager, Admin |
| POST | `/api/products` | Create new product | ✅ | Manager, Admin |
| PUT | `/api/products/{id}` | Update product | ✅ | Manager, Admin |
| PATCH | `/api/products/{id}/stock` | Update stock level | ✅ | User, Manager, Admin |
| DELETE | `/api/products/{id}` | Delete product | ✅ | Admin |

## Data Models

### ProductDto
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Product Name",
  "description": "Product description",
  "sku": "SKU-001",
  "category": "Electronics",
  "costPerItem": 29.99,
  "sellingPrice": 49.99,
  "stockLevel": 100,
  "minimumStockLevel": 10,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

# Invoice Management API (Planned)

> **Note:** These endpoints are planned based on the system requirements but not yet implemented.

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/invoices` | Get all invoices | ✅ | User, Manager, Admin |
| GET | `/api/invoices/{id}` | Get invoice by ID | ✅ | User, Manager, Admin |
| GET | `/api/invoices/search` | Search invoices | ✅ | User, Manager, Admin |
| POST | `/api/invoices` | Create new invoice | ✅ | User, Manager, Admin |
| PUT | `/api/invoices/{id}` | Update invoice | ✅ | User, Manager, Admin |
| DELETE | `/api/invoices/{id}` | Delete invoice | ✅ | Manager, Admin |
| POST | `/api/invoices/{id}/items` | Add invoice item | ✅ | User, Manager, Admin |
| PUT | `/api/invoices/{id}/items/{itemId}` | Update invoice item | ✅ | User, Manager, Admin |
| DELETE | `/api/invoices/{id}/items/{itemId}` | Remove invoice item | ✅ | User, Manager, Admin |

## Data Models

### InvoiceDto
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "invoiceNumber": "INV-2024-001",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "customerName": "Customer Name",
  "invoiceDate": "2024-01-01T00:00:00Z",
  "dueDate": "2024-01-31T00:00:00Z",
  "status": "Pending",
  "subtotal": 100.00,
  "taxAmount": 8.00,
  "totalAmount": 108.00,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "productId": "550e8400-e29b-41d4-a716-446655440003",
      "productName": "Product Name",
      "quantity": 2,
      "unitPrice": 50.00,
      "totalPrice": 100.00
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

# Reporting API (Planned)

## Endpoints Overview

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/reports/dashboard` | Get dashboard data | ✅ | Manager, Admin |
| GET | `/api/reports/sales` | Get sales reports | ✅ | Manager, Admin |
| GET | `/api/reports/inventory` | Get inventory reports | ✅ | Manager, Admin |
| GET | `/api/reports/users` | Get user activity reports | ✅ | Admin |

---

# Error Handling

## Common Error Responses

### Validation Error (422)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "firstName": ["First name is required"],
      "email": ["Email format is invalid"]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Not Found Error (404)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User with ID 550e8400-e29b-41d4-a716-446655440000 not found"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Unauthorized Error (401)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Forbidden Error (403)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to access this resource"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

# Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **Search endpoints**: 60 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

---

# Caching

The API uses caching to improve performance:

- **User data**: Cached for 10 minutes
- **User lists**: Cached for 5 minutes with sliding expiration
- **Search results**: Cached for 2 minutes
- **Statistics**: Cached for 15 minutes

Cache headers:
- `Cache-Control`: Caching directives
- `ETag`: Entity tag for cache validation
- `Last-Modified`: Last modification timestamp

---

# Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 50, max: 100)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Page`: Current page number
- `X-Page-Size`: Items per page
- `X-Total-Pages`: Total number of pages

---

# Testing

## Mock Endpoints

For testing purposes, mock endpoints are available:

- `GET /api/users/mock` - Get mock users
- `POST /api/users/mock` - Create mock user
- `PUT /api/users/mock/{id}` - Update mock user
- `DELETE /api/users/mock/{id}` - Delete mock user

These endpoints don't require authentication and use in-memory data.

## Integration Tests

Run integration tests:
```bash
dotnet test StockFlowPro.Web.Tests
```

---

# SDK and Client Libraries

## JavaScript/TypeScript
```javascript
// Example usage
const api = new StockFlowProAPI({
  baseUrl: 'https://your-domain.com/api',
  token: 'your-jwt-token'
});

const users = await api.users.getAll({ activeOnly: true });
const user = await api.users.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'User'
});
```

## C# Client
```csharp
// Example usage
var client = new StockFlowProClient("https://your-domain.com/api", "your-jwt-token");
var users = await client.Users.GetAllAsync(activeOnly: true);
var user = await client.Users.CreateAsync(new CreateUserDto
{
    FirstName = "John",
    LastName = "Doe",
    Email = "john.doe@example.com",
    Role = UserRole.User
});
```

---

# Changelog

## Version 1.0.0 (Current)
- User management API
- Authentication and authorization
- Role-based access control
- Caching and optimization
- Rate limiting
- Comprehensive error handling

## Version 1.1.0 (Planned)
- Product management API
- Invoice management API
- Reporting API
- Notification system
- Bulk operations
- Export functionality

---

# Support

For API support and questions:
- **Documentation**: [GitHub Wiki](https://github.com/your-username/StockFlow-Pro/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/StockFlow-Pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/StockFlow-Pro/discussions)

---

*Last updated: 2024-01-01*