# Real-Time Updates Implementation

This document describes the implementation of automatic table updates for products and invoices in the StockFlow Pro React frontend application.

## Overview

The implementation uses a combination of **React Query** for state management and caching, and **SignalR** for real-time communication to ensure that tables update automatically when new data is created, updated, or deleted without requiring browser refresh.

## Architecture

### 1. React Query Integration

React Query provides:
- **Automatic caching** of API responses
- **Background refetching** to keep data fresh
- **Optimistic updates** for better UX
- **Query invalidation** to trigger refetches when data changes

### 2. SignalR Real-Time Communication

SignalR provides:
- **Real-time event notifications** from the server
- **Automatic reconnection** handling
- **Group-based messaging** for targeted updates
- **Event-driven architecture** for scalable updates

### 3. Custom Hooks Architecture

The implementation uses several custom hooks:
- `useProducts` / `useInvoices` - Data fetching with React Query
- `useSignalR` - SignalR connection management
- `useRealTimeUpdates` - Integration between SignalR and React Query
- `useOptimisticUpdates` - Optimistic UI updates

## Implementation Details

### Files Created/Modified

#### New Services
- `src/services/invoiceService.ts` - Invoice API service
- `src/hooks/useInvoices.ts` - Invoice React Query hooks
- `src/hooks/useRealTimeUpdates.ts` - Real-time updates integration

#### Modified Files
- `src/services/signalrService.ts` - Added product/invoice event handlers
- `src/pages/Products/Products.tsx` - Integrated real-time updates
- `src/pages/Invoices/Invoices.tsx` - Complete rewrite with real API integration

### Key Features

#### 1. Automatic Query Invalidation

When SignalR events are received, the system automatically invalidates relevant React Query caches:

```typescript
case 'ProductCreated':
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
    break;
```

#### 2. Optimistic Updates

For immediate UI feedback, the system supports optimistic updates:

```typescript
const optimisticProductUpdate = (productId: string, updatedData: Partial<ProductDto>) => {
    queryClient.setQueryData(productKeys.detail(productId), (oldData: ProductDto | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updatedData };
    });
};
```

#### 3. Event-Driven Architecture

SignalR events are mapped to specific actions:

- `ProductCreated` → Invalidate product lists and stats
- `ProductUpdated` → Update specific product + invalidate lists
- `ProductDeleted` → Remove from cache + invalidate lists
- `StockUpdated` → Update product + invalidate stock-related queries
- `InvoiceCreated` → Invalidate invoice lists and stats
- `InvoiceUpdated` → Update specific invoice + invalidate lists
- `InvoiceDeleted` → Remove from cache + invalidate lists

#### 4. Connection State Management

The SignalR connection is automatically managed:

```typescript
// Auto-connect when user is authenticated
useEffect(() => {
    if (currentUser && !hasAttemptedConnection.current) {
        // Connect and join user-specific group
        await signalRService.start();
        await signalRService.joinGroup(`User_${currentUser.id}`);
    }
}, [currentUser]);
```

## Usage

### In Components

To enable real-time updates in any component, simply add:

```typescript
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";

const MyComponent = () => {
    // Enable real-time updates
    useRealTimeUpdates();
    
    // Your existing data fetching
    const { data, isLoading, error } = useProducts(pagination, filters);
    
    // Component renders automatically update when data changes
    return (
        // Your JSX
    );
};
```

### Backend Requirements

The backend needs to emit SignalR events when data changes:

```csharp
// Example: When a product is created
await _hubContext.Clients.All.SendAsync("ProductCreated", productDto);

// Example: When a product is updated
await _hubContext.Clients.All.SendAsync("ProductUpdated", productDto);

// Example: When a product is deleted
await _hubContext.Clients.All.SendAsync("ProductDeleted", new { id = productId });
```

## Benefits

### 1. Immediate Updates
- Tables update instantly when data changes
- No need to refresh the browser
- Real-time collaboration support

### 2. Optimized Performance
- React Query caching reduces API calls
- Selective query invalidation prevents unnecessary refetches
- Background updates keep data fresh

### 3. Better User Experience
- Optimistic updates for immediate feedback
- Loading states during operations
- Error handling with retry mechanisms

### 4. Scalable Architecture
- Event-driven design scales with application growth
- Modular hooks can be reused across components
- Clean separation of concerns

## Configuration

### Environment Variables

Ensure the SignalR hub URL is configured:

```env
VITE_API_BASE_URL=http://localhost:5131/api
```

The SignalR hub will be available at: `http://localhost:5131/stockflowhub`

### React Query Setup

The app should be wrapped with QueryClient provider:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            {/* Your app */}
        </QueryClientProvider>
    );
}
```

## Error Handling

The implementation includes comprehensive error handling:

### 1. SignalR Connection Errors
- Automatic reconnection with exponential backoff
- Connection state monitoring
- Graceful degradation when offline

### 2. API Errors
- React Query retry mechanisms
- Error boundaries for component isolation
- User-friendly error messages

### 3. Optimistic Update Rollbacks
- Automatic rollback on mutation failure
- Conflict resolution strategies
- Data consistency guarantees

## Testing

### Unit Tests
Test individual hooks and services:

```typescript
// Test real-time updates hook
test('should invalidate queries on ProductCreated event', () => {
    // Mock SignalR event
    // Assert query invalidation
});
```

### Integration Tests
Test the complete flow:

```typescript
// Test end-to-end real-time updates
test('should update table when product is created via API', async () => {
    // Create product via API
    // Verify SignalR event emission
    // Assert table updates
});
```

## Future Enhancements

### 1. Conflict Resolution
- Implement optimistic locking
- Handle concurrent edits
- Version-based conflict detection

### 2. Offline Support
- Queue mutations when offline
- Sync when connection restored
- Offline-first architecture

### 3. Performance Optimizations
- Virtual scrolling for large tables
- Incremental loading
- Smart pagination

### 4. Advanced Features
- Real-time notifications
- Live cursors for collaborative editing
- Presence indicators

## Troubleshooting

### Common Issues

#### 1. SignalR Connection Fails
- Check CORS configuration
- Verify hub URL
- Check authentication cookies

#### 2. Events Not Received
- Verify user is in correct SignalR group
- Check event naming consistency
- Validate payload structure

#### 3. Queries Not Invalidating
- Check query key matching
- Verify event handler registration
- Debug React Query DevTools

### Debug Tools

#### React Query DevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to your app
<ReactQueryDevtools initialIsOpen={false} />
```

#### SignalR Logging
```typescript
// Enable detailed logging
.configureLogging(signalR.LogLevel.Debug)
```

## Conclusion

This implementation provides a robust, scalable solution for real-time table updates in the StockFlow Pro application. The combination of React Query and SignalR ensures optimal performance, excellent user experience, and maintainable code architecture.

The system automatically handles:
- ✅ Immediate table updates when data changes
- ✅ Optimistic updates for better UX
- ✅ Automatic reconnection and error recovery
- ✅ Efficient caching and query management
- ✅ Scalable event-driven architecture

Users will see new products and invoices appear in tables instantly without any manual refresh, providing a modern, real-time application experience.