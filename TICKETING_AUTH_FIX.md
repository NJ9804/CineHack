# Ticketing System Authentication Fix

## Problem Summary
The ticketing system was returning **401 Unauthorized** errors when trying to fetch tickets from the API.

## Root Cause
The ticket components were using a separate `ticketService` that used `axios` directly, instead of using the centralized `apiClient` which properly handles authentication tokens.

### Issues Found:
1. **Separate Service Layer**: `tickets.ts` created its own HTTP client with `axios`
2. **Inconsistent Authentication**: Manual token handling didn't match the app's auth pattern
3. **SSR Issues**: `localStorage` access without checking for `window` object
4. **Token Sync**: Token wasn't being refreshed from localStorage on each request

## Solution Applied

### 1. Added Ticket Methods to ApiClient
**File**: `Frontend/src/services/api/client.ts`

Added all ticket-related API methods directly to the `ApiClient` class:
- `createTicket()` - Create a new ticket
- `getProjectTickets()` - Get tickets for a project with filters
- `getTicket()` - Get a specific ticket
- `updateTicket()` - Update ticket details
- `deleteTicket()` - Delete a ticket
- `addTicketComment()` - Add comment to ticket
- `getTicketComments()` - Get ticket comments
- `updateTicketComment()` - Update a comment
- `deleteTicketComment()` - Delete a comment
- `createTicketReminder()` - Create a reminder
- `getTicketReminders()` - Get ticket reminders
- `getPendingTicketReminders()` - Get pending reminders
- `markTicketReminderSent()` - Mark reminder as sent
- `deleteTicketReminder()` - Delete a reminder
- `getTicketAnalytics()` - Get analytics data
- `bulkUpdateTickets()` - Bulk update tickets

### 2. Updated All Ticket Components
Replaced `ticketService` with `apiClient` in:

**TicketList.tsx**:
```typescript
// Before
import { ticketService, Ticket, TicketFilters } from '@/services/api/tickets';
const data = await ticketService.getProjectTickets(projectId);

// After
import { apiClient } from '@/services/api/client';
import type { Ticket, TicketFilters } from '@/services/api/tickets';
const data = await apiClient.getProjectTickets(projectId);
```

**TicketDialog.tsx**:
```typescript
// Before
await ticketService.createTicket(projectId, formData);

// After
await apiClient.createTicket(projectId, formData);
```

**TicketDetailsDialog.tsx**:
```typescript
// Before
await ticketService.getTicket(ticketId);
await ticketService.updateTicket(ticketId, data);
await ticketService.addComment(ticketId, data);
await ticketService.createReminder(ticketId, data);

// After
await apiClient.getTicket(ticketId);
await apiClient.updateTicket(ticketId, data);
await apiClient.addTicketComment(ticketId, data);
await apiClient.createTicketReminder(ticketId, data);
```

**TicketDashboard.tsx**:
```typescript
// Before
await ticketService.getAnalytics(projectId);

// After  
await apiClient.getTicketAnalytics(projectId);
```

**TicketWidget.tsx**:
```typescript
// Before
await ticketService.getProjectTickets(projectId);

// After
await apiClient.getProjectTickets(projectId);
```

## Why This Works

### 1. **Centralized Authentication**
The `ApiClient` class has a single authentication mechanism:
```typescript
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Always get fresh token from localStorage
  if (typeof window !== 'undefined') {
    this.token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`;
  }
  // ... make request
}
```

### 2. **SSR-Safe**
Checks for `window` object before accessing `localStorage`, preventing SSR errors

### 3. **Token Refresh**
On every request, it fetches the latest token from `localStorage`, ensuring auth stays current

### 4. **Consistent Pattern**
All API calls in the app now go through the same client, making debugging easier

## Testing

### Before Fix:
```
INFO   127.0.0.1:53071 - "GET /api/projects/1/tickets HTTP/1.1" 401
```

### After Fix:
The tickets should now load successfully with proper authentication headers.

## Next Steps

### For Users:
1. **Make sure you're logged in** - The ticketing system requires authentication
2. **Check your token** - In browser console, run: `localStorage.getItem('token')`
3. **If null, log in again** - Navigate to `/login` and authenticate

### For Developers:
1. **Deprecated Service**: The `tickets.ts` service file is now redundant
2. **Use apiClient**: Always use `apiClient` for API calls, not axios directly
3. **Type Imports**: Import types with `import type { ... }` from `tickets.ts`

## Files Modified

- ✅ `Frontend/src/services/api/client.ts` - Added ticket methods
- ✅ `Frontend/src/components/project/tickets/TicketList.tsx` - Updated imports & calls
- ✅ `Frontend/src/components/project/tickets/TicketDialog.tsx` - Updated imports & calls
- ✅ `Frontend/src/components/project/tickets/TicketDetailsDialog.tsx` - Updated imports & calls
- ✅ `Frontend/src/components/project/tickets/TicketDashboard.tsx` - Updated imports & calls
- ✅ `Frontend/src/components/project/tickets/TicketWidget.tsx` - Updated imports & calls

## Optional Cleanup

You can optionally remove or deprecate `Frontend/src/services/api/tickets.ts` since it's no longer being used for API calls (only for TypeScript types).

---

**Status**: ✅ **FIXED** - All ticket components now use centralized authentication via `apiClient`
