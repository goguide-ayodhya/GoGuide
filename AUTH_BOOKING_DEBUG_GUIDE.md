# Authentication & Booking Issues - Debug Guide

## Overview of Fixes

This document explains the fixes implemented to resolve:
1. **Authentication Persistence**: User getting logged out after refresh/navigation
2. **Booking Driver Profile Error**: "Driver profile not found" when updating booking status

---

## Fix #1: Authentication Persistence

### Problem
- User logs in successfully but gets logged out after refresh
- `validateTokenApi` was throwing errors and causing token removal
- localStorage was being cleared on token validation failures

### Solution
**Changed from**: Destructive token validation on init
**Changed to**: LocalStorage as source of truth, non-destructive validation

#### Key Changes in `AuthContext.tsx`:

1. **Init Logic**:
   - ✅ Trust localStorage - if token/user exist, assume user is logged in
   - ❌ Don't clear localStorage if validation fails (could be network issue)
   - ✅ Only validate with backend for security, but keep user logged in locally

2. **Behavior**:
   - On init: Read from localStorage, use that as truth
   - Validate with backend (optional security check)
   - If validation fails: Log warning, but keep user logged in
   - Only logout if user explicitly clicks logout

3. **Debug Logs**:
   ```
   [AUTH] Initializing auth - token exists: true user exists: true
   [AUTH] Validating token with backend...
   [AUTH] Token validation successful
   [AUTH] Setting user from localStorage: {userId}
   ```

---

## Fix #2: Booking Driver Profile Error

### Problem
- When driver tries to accept/reject/complete booking: "Driver profile not found"
- The code looks for `Driver.findOne({ userId })`
- Could fail if:
  - Driver was saved during signup but with incorrect fields
  - User-Driver link is broken
  - Backend lookup timing issue

### Solution
**Enhanced Profile Lookup with Better Logging**:

#### Key Changes in `BookingController`:

1. **Added Debug Logging**:
   ```javascript
   console.log("[BOOKING] acceptBooking - userId:", userId, "bookingId:", bookingId);
   console.log("[BOOKING] Found booking, type:", booking.bookingType);
   ```

2. **Better Error Messages**:
   - Old: "Driver profile not found"
   - New: "Driver profile not found. Please complete your driver profile setup."
   - Includes context about what to do

3. **Additional Checks**:
   - If profile not found, log the userId for debugging
   - Log the actual booking type being processed
   - Attempt to list all drivers for debugging

---

## How to Debug Issues

### 1. Check Authentication Persistence

**In Browser Console:**
```javascript
// Check localStorage
localStorage.getItem("token")          // Should show token string
localStorage.getItem("user")           // Should show user JSON

// Check if token exists
typeof localStorage.getItem("token") === "string"  // Should be true
```

**Expected Console Logs on Page Load**:
```
[AUTH] Initializing auth - token exists: true user exists: true
[AUTH] Validating token with backend...
[AUTH] Token validation successful
[AUTH] Setting user from localStorage: {userId}
```

**If Token is Being Cleared**:
```
[AUTH] Clearing invalid token                      // token is "null" or "undefined"
[AUTH] No token or user - staying logged out       // localStorage empty
```

### 2. Check API Authorization Headers

**In Browser DevTools (Network Tab)**:
1. Open Network tab (F12 → Network)
2. Make a booking action (Accept/Reject/Complete)
3. Click on the request to booking/*/accept
4. Go to "Headers" tab
5. Look for: `Authorization: Bearer {token}`

**Expected Output**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**In Console Logs**:
```
[BOOKING-API] acceptBookingApi called with bookingId: 507f1f77bcf86cd799439011
[API] Adding Authorization header, token length: 234
```

### 3. Check Driver Profile Issue

**Backend Logs**:
```
[BOOKING] acceptBooking - userId: 507f1f77bcf86cd799439011 bookingId: 507f1f77bcf86cd799439012
[BOOKING] Found booking, type: DRIVER
[BOOKING] Found actor, actorId: 507f1f77bcf86cd799439013
```

**If Profile Not Found**:
```
[BOOKING] acceptBooking - userId: 507f1f77bcf86cd799439011 bookingId: 507f1f77bcf86cd799439012
[BOOKING] Found booking, type: DRIVER
[BOOKING] Driver profile not found for userId: 507f1f77bcf86cd799439011
```

**In This Case**:
1. Check if Driver document exists in MongoDB:
   ```
   db.drivers.find({ userId: ObjectId("507f1f77bcf86cd799439011") })
   ```
2. If empty, driver profile was never created during signup
3. Check auth.service.ts signup logic for driver role

---

## Testing Checklist

### Test 1: Login Persistence
- [ ] Log in with valid credentials
- [ ] Refresh page (F5)
- [ ] User should stay logged in
- [ ] Check console: `[AUTH] Setting user from localStorage: {userId}`

### Test 2: Network Disconnection
- [ ] Log in successfully
- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to validate token (it should fail)
- [ ] Turn network back on
- [ ] User should still be logged in
- [ ] Check console: `[AUTH] Token validation failed, but keeping user logged in`

### Test 3: Booking Actions
- [ ] Log in as Driver
- [ ] Create a booking
- [ ] Try to Accept/Reject/Complete
- [ ] Should work without "Driver profile not found"
- [ ] Check console:
   ```
   [BOOKING-API] acceptBookingApi called with bookingId: ...
   [API] Adding Authorization header, token length: ...
   [BOOKING] acceptBooking - userId: ...
   [BOOKING] Found actor, actorId: ...
   ```

### Test 4: Explicit Logout
- [ ] Log in
- [ ] Click Logout
- [ ] Confirm user is logged out
- [ ] Check localStorage is empty
- [ ] Check console: `[AUTH] Clearing auth state and localStorage`

---

## Common Issues & Solutions

### Issue: "Driver profile not found" Error

**Cause 1: Profile not created during signup**
```
Solution:
1. Check if user.role === "DRIVER" in request
2. Verify Driver.create() is being called in auth.service.ts
3. Check if required fields are present (vehicleName, driverAadhar, etc.)
```

**Cause 2: UserId mismatch**
```
Solution:
1. Verify userId in JWT token matches the one used to create Driver
2. Check: db.drivers.findOne({ userId: <userId> })
3. Ensure userId is stored correctly in Driver model
```

**Cause 3: Case sensitivity in field names**
```
Solution:
1. Check database schema: userId (not userId or UserID)
2. Verify Mongoose model definition
```

### Issue: Token Being Cleared on Refresh

**Check if validateTokenApi is failing**:
Before: Would clear localStorage
Now: Only logs warning, keeps user logged in

**Resolve**:
- Check backend auth/validate-token endpoint
- Verify token is valid (not expired, not tampered with)
- Check JWT_SECRET matches between frontend login and backend validation

### Issue: "No Authorization Header in Request"

**Check console for**:
```
[API] No token found for request
```

**Solutions**:
1. Verify localStorage.getItem("token") returns a value
2. Check getToken() function not returning null
3. Verify fetch headers include Authorization
4. Check network request headers in DevTools

---

## Debug Console Log Examples

### Successful Login Flow
```
[AUTH] Logging in user: user@example.com
[AUTH] Login successful, saving to localStorage
[AUTH] User and token saved to localStorage

// On page refresh:
[AUTH] Initializing auth - token exists: true user exists: true
[AUTH] Validating token with backend...
[AUTH] Token validation successful
[AUTH] Setting user from localStorage: 507f1f77bcf86cd799439011
```

### Successful Booking Update Flow
```
[BOOKING-API] acceptBookingApi called with bookingId: 507f1f77bcf86cd799439012
[API] Adding Authorization header, token length: 234

// Backend logs:
[BOOKING] acceptBooking - userId: 507f1f77bcf86cd799439011 bookingId: 507f1f77bcf86cd799439012
[BOOKING] Found booking, type: DRIVER
[BOOKING] Found actor, actorId: 507f1f77bcf86cd799439013
```

### Failed Profile Lookup
```
[BOOKING] acceptBooking - userId: 507f1f77bcf86cd799439011 bookingId: 507f1f77bcf86cd799439012
[BOOKING] Found booking, type: DRIVER
[BOOKING] Driver profile not found for userId: 507f1f77bcf86cd799439011
[BOOKING] Attempting to find drivers for debugging...
[BOOKING] Found drivers: 0
```

---

## Implementation Details

### Files Modified

#### Frontend
1. **`frontend/contexts/AuthContext.tsx`**
   - Init auth: Trust localStorage, validate non-destructively
   - Added debug logs at each step
   - Removed automatic logout on validation failure

2. **`frontend/lib/api/auth.ts`**
   - Added debug logs to authHeaders()
   - Better token logging

3. **`frontend/lib/api/bookings.ts`**
   - Added debug logs to authHeaders()
   - Added logs to booking action APIs

#### Backend
1. **`backend/src/controllers/booking.controller.ts`**
   - Enhanced acceptBooking(), rejectBooking(), completeBooking()
   - Added comprehensive logging
   - Better error messages with actionable guidance

---

## Next Steps

1. **Test the fixes**:
   - Log in and refresh - should stay logged in
   - Open DevTools → Console - verify logs appear
   - Check Network tab - verify Authorization header sent

2. **Monitor the logs**:
   - Check browser console for `[AUTH]` logs
   - Check server logs for `[BOOKING]` logs

3. **Verify driver profile**:
   - If still getting "Driver profile not found":
     - Check MongoDB for Driver document
     - Verify userId matches
     - Check all required fields are present

4. **Report issues with logs**:
   - Share console logs from DevTools
   - Share backend server logs
   - Include timestamps and exact steps taken

---

## FAQ

**Q: Why don't we just validate token on every page load?**
A: We do, but we keep the user logged in even if validation fails. This prevents logout due to network issues or temporary backend hiccups.

**Q: What if token is expired?**
A: Token expiration happens on the backend when `jwt.verify()` fails. The user will be logged out when they try to make an API call, not on page refresh.

**Q: Why are there so many console logs?**
A: They help debug authentication and booking issues in production. They can be disabled by setting a debug flag in the future.

**Q: Can the user change their email and still have the same driver profile?**
A: Yes, because Driver is linked to userId, not email. Updating email doesn't break the link.
