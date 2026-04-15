# Firebase Push Notification System

Complete Firebase Cloud Messaging (FCM) implementation for the Ayodhya Tourism app with proper architecture and best practices.

## Architecture Overview

### Frontend Components

1. **Firebase Setup** (`lib/firebase.ts`)
   - Lazy initialization of Firebase app
   - Safe FCM messaging initialization
   - Functions for token management and foreground notifications
   - No auto-execution of code

2. **FCMNotificationContext** (`contexts/FCMNotificationContext.tsx`)
   - Manages permission requests (localStorage caching)
   - Gets and caches FCM tokens
   - Sends tokens to backend
   - Sets up foreground notification listener
   - Auto-refreshes tokens when user changes

3. **NotificationProvider** (`contexts/NotificationContext.tsx`)
   - Toast-style notifications (success, error, info)
   - Integration with existing toast system
   - Reusable notification hooks

4. **Service Worker** (`public/firebase-messaging-sw.js`)
   - Handles background notifications
   - Shows notifications when app is closed
   - Handles notification clicks with routing

### Backend Components

1. **Notification Controller** (`src/controllers/notification.controller.ts`)
   - Endpoint to save FCM tokens
   - Protected routes requiring authentication

2. **Notification Routes** (`src/routes/notification.routes.ts`)
   - `/notifications/save-fcm-token` - POST (Protected)

3. **Notification Service** (`src/services/notification.service.ts`)
   - Methods for sending notifications
   - Booking confirmation notifications
   - Payment notifications
   - Status update notifications
   - Generic notification sender

4. **User Model Updates** (`src/models/User.ts`)
   - Added `fcmToken` field (string)
   - Added `fcmTokenUpdatedAt` field (timestamp)

## Setup Instructions

### 1. Firebase Configuration

The Firebase config is already set in `frontend/lib/firebase.ts`. Make sure:
- VAPID key is correct
- Firebase project is configured to accept messages

### 2. Service Worker Registration

The app automatically registers the service worker from `public/firebase-messaging-sw.js`.

### 3. Firebase Admin SDK (Backend - Optional)

To send actual push notifications, set up Firebase Admin SDK:

```bash
npm install firebase-admin
```

Then update `NotificationController.sendNotificationToUser()` with actual Firebase Admin implementation.

## Usage

### Frontend - Showing Toast Notifications

```typescript
import { useNotification } from "@/contexts/NotificationContext";

export function MyComponent() {
  const { showSuccess, showError, showInfo } = useNotification();

  return (
    <button onClick={() => showSuccess("Booking confirmed!")}>
      Confirm Booking
    </button>
  );
}
```

### Frontend - Using Notification Triggers

```typescript
import { useNotificationTriggers } from "@/lib/notificationTriggers";

export function BookingFlow() {
  const { onBookingCreated, onPaymentSuccess } = useNotificationTriggers();

  const handleBooking = async () => {
    // ... booking logic
    onBookingCreated(bookingId, "GUIDE");
  };

  return <button onClick={handleBooking}>Book Now</button>;
}
```

### Backend - Sending Notifications

```typescript
import { NotificationService } from "../services/notification.service";

// After booking created
await NotificationService.sendBookingConfirmation(
  userId,
  bookingId,
  "GUIDE",
);

// After payment successful
await NotificationService.sendPaymentSuccess(userId, amount, bookingId);

// On booking status change
await NotificationService.sendBookingStatusUpdate(
  userId,
  bookingId,
  "ACCEPTED",
);
```

## How It Works

### Permission Flow

1. User visits app
2. `FCMNotificationProvider` checks if permission was requested before (localStorage)
3. If not requested:
   - Shows permission popup (browser native)
   - Gets FCM token if granted
   - Saves token to backend via `/api/notifications/save-fcm-token`
   - Stores token in localStorage for caching
4. If already denied: Silently skips (no UI errors)

### Foreground Notifications

When app is open and server sends notification:
1. Firebase received message in `onMessage` listener
2. Shows toast notification in app
3. Displays in top-right corner with auto-dismiss after 5s

### Background Notifications

When app is closed and notification is sent:
1. Service worker receives the message
2. Shows system notification
3. Clicking notification can route user to relevant page

## Key Features

✅ **No Duplicate Permission Requests** - Uses localStorage to track status
✅ **Silent Permission Denial** - No errors if denied, user can enable later
✅ **Token Caching** - Reduces API calls with localStorage caching
✅ **Auto Token Refresh** - Refreshes when user changes
✅ **Error Handling** - Graceful fallbacks if notifications unavailable
✅ **No Console Spam** - Warnings only, no errors
✅ **Production Ready** - Clean structure, reusable logic
✅ **Foreground + Background** - Toast + System notifications

## Testing

### Test Toast Notifications

Use the demo component on home page to test different notification types.

### Test FCM Token

Check browser console or storage (localStorage key: `fcm_token`)

### Test Service Worker

Test section:
1. Go to DevTools → Application → Service Workers
2. Should see `firebase-messaging-sw.js` registered
3. Send notification while app is closed to test background notifications

## Integration Points

### Booking Controller

Add to `acceptBooking()` method:
```typescript
await NotificationService.sendBookingStatusUpdate(
  booking.userId,
  booking._id,
  "ACCEPTED",
);
```

### Payment Controller

Add to successful payment processing:
```typescript
await NotificationService.sendPaymentSuccess(
  payment.userId,
  payment.amount,
  payment.bookingId,
);
```

### Booking Status Updates

Add when status changes:
```typescript
await NotificationService.sendBookingStatusUpdate(
  userId,
  bookingId,
  status, // "ACCEPTED", "REJECTED", "COMPLETED"
);
```

## Environment Requirements

- Next.js 16+ with App Router
- Express backend with MongoDB
- Modern browser with Web Push API support (Chrome, Firefox, Edge, Safari)
- Firebase project with FCM enabled

## Security Notes

- FCM tokens are stored in User collection (encrypted by default in DB)
- Permission only requested once (respects user's choice)
- Auth required for save token endpoint
- Service worker is domain-scoped automatically

## Troubleshooting

- **"Service Worker registration failed"**: Check browser console, may need HTTPS
- **"No token available"**: Permission denied or device doesn't support
- **No notifications showing**: Check browser notification settings
- **Duplicate requests**: Clear localStorage and refresh

## Files Modified/Created

### Frontend
- ✅ `lib/firebase.ts` - Updated with proper functions
- ✅ `contexts/FCMNotificationContext.tsx` - New
- ✅ `public/firebase-messaging-sw.js` - New
- ✅ `components/NotificationDemo.tsx` - Updated
- ✅ `lib/notificationTriggers.ts` - New
- ✅ `components/providers.tsx` - Updated with FCMNotificationProvider

### Backend
- ✅ `models/User.ts` - Added fcmToken fields
- ✅ `controllers/notification.controller.ts` - New
- ✅ `routes/notification.routes.ts` - New
- ✅ `services/notification.service.ts` - New
- ✅ `server.ts` - Registered notification routes
