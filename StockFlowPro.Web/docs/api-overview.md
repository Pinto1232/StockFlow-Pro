# StockFlow Pro API Overview

## Introduction

StockFlow Pro provides a comprehensive REST API for inventory management, user authentication, and reporting.

## Authentication

The API uses cookie-based authentication. Users must log in through the `/api/auth/login` endpoint to receive authentication cookies.

## Base URL

```
http://localhost:5131/api
```

## Core Endpoints

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Product Management
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Inventory Operations
- `POST /api/products/{id}/stock` - Update stock levels
- `GET /api/products/low-stock` - Get low stock products

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes and descriptive messages.