# Invoice API Test

## Issue Analysis

The `/api/invoices` endpoint was returning a 400 Bad Request error. After investigation, I found several issues:

### Root Causes:
1. **Conflicting Authorization**: The `CreateInvoice` method had `[AllowAnonymous]` attribute but still required authentication internally
2. **Authentication Logic**: The method was checking for authentication but allowing anonymous access
3. **User Claims**: The method expects a valid `ClaimTypes.NameIdentifier` claim with a valid GUID

### Fixes Applied:
1. Removed the `[AllowAnonymous]` attribute from the `CreateInvoice` method
2. Simplified the authentication logic to be more straightforward
3. Improved error messages for better debugging

## Testing the API

### Prerequisites:
- User must be authenticated (logged in)
- Valid authentication cookie must be present

### Request Format:
```http
POST /api/invoices
Content-Type: application/json
Authorization: Required (via cookie authentication)

{
  "createdDate": "2024-01-15T10:30:00Z" // Optional, defaults to current UTC time
}
```

### Expected Response:
```http
HTTP/1.1 201 Created
Location: /api/invoices/{invoice-id}

{
  "id": "guid",
  "createdDate": "2024-01-15T10:30:00Z",
  "createdByUserId": "user-guid",
  "createdByUserName": "User Name",
  "total": 0.00,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": null,
  "items": [],
  "totalItemCount": 0,
  "hasItems": false
}
```

### Common Error Scenarios:

1. **401 Unauthorized**: User not logged in
2. **400 Bad Request**: 
   - "User authentication required. Please log in." - Missing user claims
   - "Invalid user authentication data." - Invalid GUID format in claims
   - "User not found" - User ID from claims doesn't exist in database

## Next Steps:
1. Ensure user is properly authenticated before making the request
2. Test with a valid authenticated session
3. Verify the user exists in the database