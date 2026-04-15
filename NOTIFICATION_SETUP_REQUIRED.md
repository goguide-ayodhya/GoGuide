# Firebase Cloud Messaging Setup Instructions

## ✅ Implementation Status

The FCM notification system has been implemented end-to-end across the frontend and backend. However, there are several **manual setup steps** required to activate the system.

---

## 🔧 Required Manual Configuration

### 1. **Firebase Project Setup**

#### 1.1 Get Firebase Credentials
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project: **goguideayodhya**
- Navigate to **Project Settings** (click gear icon)
- Go to the **Service Accounts** tab
- Click **Generate a new private key**
- Download the JSON file (this contains your Firebase Admin SDK credentials)

#### 1.2 Web App Configuration
- In Firebase Console, go to **Project Settings** → **General**
- Scroll to **Your apps** section
- Your web app is already configured (GoGuideAyodhya)
- The configuration is embedded in your code and environment variables

---

### 2. **Backend Setup - Firebase Admin SDK (Node.js)**

#### 2.1 Install Firebase Admin SDK
```bash
cd backend
npm install firebase-admin
# ✅ DONE: firebase-admin@13.8.0 installed
```

#### 2.2 Set Environment Variables

Create a `.env` file in the backend root directory:

```env
# Firebase Admin SDK (required)
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json
# OR use JSON directly in environment:
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"goguideayodhya",...}'

# Other existing variables...
MONGODB_URI=...
JWT_SECRET=...
```

#### 2.3 Initialize Firebase Admin in Your Server

Add this to your `backend/src/server.ts` or a new `backend/src/config/firebase-admin.ts`:

```typescript
import admin from "firebase-admin";
import * as serviceAccount from "../firebase-service-account.json";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || "goguideayodhya",
  });

  console.log("✅ Firebase Admin SDK initialized");
}

export default admin;
```

Place your `firebase-service-account.json` file in the backend root directory (add to `.gitignore`):

```bash
echo "firebase-service-account.json" >> backend/.gitignore
```

---

### 3. **Frontend Setup - Environment Variables**

#### 3.1 Create `.env.local` in Frontend

Create `frontend/.env.local`:

```env
# Firebase Configuration (already in code, but use environment for security)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDYDigwWDyC_v3NsBgA72nn2gnZ_N3iSos
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=goguideayodhya.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=goguideayodhya
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=goguideayodhya.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=563614061104
NEXT_PUBLIC_FIREBASE_APP_ID=1:563614061104:web:b455808458dc0b9e2e93f5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-983F9C8HX3

# VAPID Key for Push Notifications (REQUIRED - do not use default in production)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKagOny0KF_2pCJQ3m_xmWeO0OV6yLj3WmozYzMzcKCKQsgKVFDKjJDhRoV2e2W6moL0ewzQ8rZu
```

#### 3.2 Generate New VAPID Keys (Production)

⚠️ **For production, generate new VAPID keys:**

1. In Firebase Console: **Project Settings** → **Cloud Messaging**
2. Under "Web API Key", click **Generate Key Pair**
3. Copy the public key and update `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

---

### 4. **Enable Cloud Messaging in Firebase**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **goguideayodhya**
3. Navigate to **Cloud Messaging** (in left sidebar under "Build")
4. Ensure it's **Enabled**
5. Generate the **Server API Key** (Web API Key) if not already present
6. Copy the **Web API Key** (will be used by backend)

---

### 5. **Backend API Endpoint**

The following endpoint is already implemented:

**Save FCM Token**
```
POST /api/notifications/save-fcm-token
Authorization: Bearer {authToken}
Content-Type: application/json

{
  "fcmToken": "string"
}
```

The endpoint automatically saves the token to the user document with:
- `fcmToken`: The token
- `fcmTokenUpdatedAt`: Timestamp

---

### 6. **Frontend Integration Checklist**

✅ **Already Implemented:**
- Service Worker registration: `public/firebase-messaging-sw.js`
- Firebase initialization: `frontend/lib/firebase.ts`
- FCM Provider: `frontend/contexts/FCMNotificationContext.tsx`
- Toast notifications on foreground messages
- Background notification handling
- Token caching and persistence
- Permission request handling (one-time only)

**Manual Actions:**
- [ ] Test in development: Run frontend in `localhost`
- [ ] Accept notification permission when prompted
- [ ] Verify token is saved to localStorage
- [ ] Check browser DevTools Console for any errors

---

### 7. **Backend Notifications System**

✅ **Already Implemented:**

**Notification Service** (`backend/src/services/notification.service.ts`):
- `sendNotificationToUser()` - Send to single user
- `sendNotificationToUsers()` - Send to multiple users
- `sendBookingStatusUpdate()` - Booking status notifications
- `sendPaymentSuccess()` - Payment confirmation
- `sendGenericNotification()` - Custom notifications
- Batch sending with Firebase Admin SDK

**Integration Points:**
- **Booking Service**: Notifications on ACCEPTED, REJECTED, COMPLETED
- **Payment Service**: Notifications on COMPLETED payments
- All notification sends are wrapped in try-catch to prevent blocking main responses

---

### 8. **Testing the System**

#### 8.1 Frontend Testing

1. **Open browser DevTools** (F12)
2. **Go to Application** → **Service Workers**
3. Verify service worker is registered
4. **Go to Storage** → **Local Storage**
5. Verify `fcm_token` key exists with a token value

#### 8.1 Frontend Testing

1. **Open browser DevTools** (F12)
2. **Go to Application** → **Service Workers**
3. Verify service worker is registered
4. **Go to Storage** → **Local Storage**
5. Verify `fcm_token` key exists with a token value

#### 8.2 Test Notification Send

```bash
# Backend - Send test notification to authenticated user
curl -X POST http://localhost:3001/api/notifications/send-test \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

#### 8.3 Manual Test Using Firebase Console

1. Go to Firebase Console
2. Select your project
3. Navigate to **Cloud Messaging**
4. Send a test notification to specific FCM tokens
5. Verify it appears in the browser

#### 8.3 Manual Test Using Firebase Console

1. Go to Firebase Console
2. Select your project
3. Navigate to **Cloud Messaging**
4. Send a test notification to specific FCM tokens
5. Verify it appears in the browser

---

### 9. **Environment Variables Summary**

#### Backend (`.env`)
```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json
FIREBASE_PROJECT_ID=goguideayodhya
```

#### Frontend (`.env.local`)
```env
# Firebase Configuration (public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDYDigwWDyC_v3NsBgA72nn2gnZ_N3iSos
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=goguideayodhya.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=goguideayodhya
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=goguideayodhya.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=563614061104
NEXT_PUBLIC_FIREBASE_APP_ID=1:563614061104:web:b455808458dc0b9e2e93f5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-983F9C8HX3
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKagOny0KF_2pCJQ3m_xmWeO0OV6yLj3WmozYzMzcKCKQsgKVFDKjJDhRoV2e2W6moL0ewzQ8rZu
```

---

### 10. **Troubleshooting**

#### Issue: "Service Worker not registered"
- ✅ Verify `public/firebase-messaging-sw.js` exists
- ✅ Check browser console for errors
- ✅ Service workers only work on `localhost` or HTTPS

#### Issue: "FCM token is null"
- ✅ Verify browser notification permission is granted
- ✅ Check if Firebase is initialized
- ✅ Verify VAPID key is correct
- ✅ Check browser console for errors

#### Issue: "No FCM token found for user"
- ✅ User must receive notification permission first
- ✅ Verify token is saved to backend via `/api/notifications/save-fcm-token`
- ✅ Check User document in MongoDB for `fcmToken` field

#### Issue: "Firebase Admin not initialized"
- ✅ Verify `firebase-service-account.json` exists and is valid
- ✅ Check `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` environment variable
- ✅ Restart backend server after setting environment variables

#### Issue: Notifications appear in console but not on screen
- ✅ Check browser notification settings (Settings → Notifications)
- ✅ Verify browser window is not focused (background notifications)
- ✅ Check if app has notification permission

---

### 11. **Production Checklist**

Before deploying to production:

- [ ] Generate new VAPID keys in Firebase Console
- [ ] Update `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in production environment
- [ ] Store `firebase-service-account.json` securely (never commit to git)
- [ ] Ensure Firebase Admin SDK is initialized before server starts
- [ ] Enable HTTPS for the web app (required for Service Workers)
- [ ] Test on production domain
- [ ] Monitor notification delivery in Firebase Console → Cloud Messaging
- [ ] Set up error logging/monitoring for notification failures

---

### 12. **API Response Examples**

#### Save FCM Token Response
```json
{
  "success": true,
  "message": "FCM token saved successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "tokenUpdated": "2024-04-15T10:30:00Z"
  }
}
```

#### Notification Structure (sent to client)
```json
{
  "notification": {
    "title": "Booking Accepted!",
    "body": "Your booking has been accepted. Get ready for an amazing experience!"
  },
  "data": {
    "bookingId": "507f1f77bcf86cd799439012",
    "status": "ACCEPTED",
    "type": "booking_accepted"
  }
}
```

---

### 13. **File Structure Overview**

```
Tourist/
├── backend/
│   └── src/
│       ├── config/
│       │   └── firebase-admin.ts         # Firebase Admin initialization
│       ├── controllers/
│       │   └── notification.controller.ts # ✅ Implemented
│       ├── models/
│       │   └── User.ts                    # ✅ Has fcmToken fields
│       ├── routes/
│       │   └── notification.routes.ts     # ✅ Implemented
│       └── services/
│           ├── notification.service.ts    # ✅ Comprehensive implementation
│           ├── booking.service.ts         # ✅ Notifications integrated
│           └── payment.service.ts         # ✅ Notifications integrated
│
├── frontend/
│   ├── lib/
│   │   └── firebase.ts                    # ✅ Enhanced with lazy loading
│   ├── contexts/
│   │   └── FCMNotificationContext.tsx     # ✅ Fixed and enhanced
│   ├── components/
│   │   └── providers.tsx                  # ✅ Already includes provider
│   └── public/
│       └── firebase-messaging-sw.js       # ✅ Enhanced service worker
│
└── NOTIFICATION_SETUP_REQUIRED.md         # This file
```

---

### 14. **Quick Start Summary**

1. **Backend Setup (5 minutes)**
   ```bash
   npm install firebase-admin
   # Add firebase-service-account.json
   # Update .env with Firebase config
   # Restart backend server
   ```

2. **Frontend Setup (2 minutes)**
   ```bash
   # Create .env.local with Firebase variables
   npm run dev
   ```

3. **Test (3 minutes)**
   - Accept notifications in browser
   - Verify token in localStorage
   - Trigger a booking status change
   - Verify notification appears

**Total Setup Time: ~10 minutes**

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console for errors
3. Check backend logs for notification send failures
4. Verify Firebase Console shows message delivery status

---

## 📋 Notifications Implemented

✅ **Booking Notifications:**
- Booking Accepted
- Booking Rejected
- Booking Completed

✅ **Payment Notifications:**
- Payment Successful

✅ **Generic Notifications:**
- Custom notifications via backend API

All notifications include:
- Title and body
- Contextual data (booking ID, etc.)
- Click actions (navigation)
- Icon and badge
- Background handling via Service Worker
