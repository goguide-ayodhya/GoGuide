# Tour Guide Platform - API Documentation

Complete API reference for the Tour Guide Booking Platform backend.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints except `/auth/login` and `/auth/signup` require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "GUIDE"
    },
    "token": "jwt-token-here"
  }
}
```

### 2. Signup
**POST** `/auth/signup`

Request body:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1-555-0000",
  "role": "GUIDE"
}
```

Response: Same as login

### 3. Validate Token
**POST** `/auth/validate-token`

Response:
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "userId": "user-id",
    "email": "user@example.com"
  }
}
```

---

## Guide Endpoints

### 1. Get All Guides
**GET** `/guides?specialty=Historical&minRating=4`

Query Parameters:
- `specialty` (optional): Filter by specialty
- `minRating` (optional): Minimum average rating

Response:
```json
{
  "success": true,
  "message": "Guides retrieved successfully",
  "data": [
    {
      "id": "guide-id",
      "userId": "user-id",
      "specialty": "Historical Tours",
      "hourlyRate": 50,
      "averageRating": 4.8,
      "isAvailable": true,
      "isOnline": true,
      "user": {
        "id": "user-id",
        "name": "John Anderson",
        "email": "john@example.com",
        "profileImage": "url",
        "phone": "+1-555-0000"
      }
    }
  ]
}
```

### 2. Get My Guide Profile
**GET** `/guides/me`

Response: Single guide object (see Get All Guides)

### 3. Get Guide by ID
**GET** `/guides/{guideId}`

Response: Single guide object

### 4. Update Guide Profile
**PUT** `/guides/{guideId}`

Request body:
```json
{
  "specialty": "Adventure Tours",
  "bio": "Experienced guide...",
  "hourlyRate": 60,
  "certification": "IFTA Certified",
  "yearsOfExperience": 10,
  "languages": ["English", "Spanish", "French"]
}
```

Response: Updated guide object

### 5. Set Availability
**PATCH** `/guides/{guideId}/availability`

Request body:
```json
{
  "isAvailable": true
}
```

Response: Updated guide object

### 6. Set Online Status
**PATCH** `/guides/{guideId}/online-status`

Request body:
```json
{
  "isOnline": true
}
```

Response: Updated guide object

---

## Booking Endpoints

### 1. Create Booking
**POST** `/bookings`

Request body:
```json
{
  "guideId": "guide-id",
  "touristName": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1-555-1234",
  "groupSize": 4,
  "bookingDate": "2024-03-20T09:00:00Z",
  "startTime": "09:00",
  "tourType": "Historical Tour",
  "meetingPoint": "Central Museum",
  "dropoffLocation": "Hotel Grand",
  "totalPrice": 240,
  "notes": "Optional notes"
}
```

Response:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-id",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "...": "booking data"
  }
}
```

### 2. Get My Bookings
**GET** `/bookings/my-bookings`

Response:
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "booking-id",
      "status": "CONFIRMED",
      "...": "booking data"
    }
  ]
}
```

### 3. Get Guide Bookings
**GET** `/bookings/guide/{guideId}?status=PENDING`

Query Parameters:
- `status` (optional): Filter by status (PENDING, CONFIRMED, ON_THE_WAY, COMPLETED, CANCELLED)

Response: Array of bookings

### 4. Get Booking Details
**GET** `/bookings/{bookingId}`

Response: Single booking object with payment and review details

### 5. Update Booking Status
**PATCH** `/bookings/{bookingId}/status`

Request body:
```json
{
  "status": "CONFIRMED"
}
```

Allowed statuses: PENDING, CONFIRMED, ON_THE_WAY, COMPLETED, CANCELLED

Response: Updated booking object

### 6. Cancel Booking
**PATCH** `/bookings/{bookingId}/cancel`

Request body:
```json
{
  "reason": "Personal reasons"
}
```

Response: Updated booking object

---

## Review Endpoints

### 1. Create Review
**POST** `/reviews/booking/{bookingId}`

Request body:
```json
{
  "rating": 5,
  "comments": "Excellent tour guide!"
}
```

Response:
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "review-id",
    "rating": 5,
    "comments": "Excellent tour guide!",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### 2. Get Guide Reviews
**GET** `/reviews/guide/{guideId}`

Response: Array of review objects

### 3. Get Booking Review
**GET** `/reviews/booking/{bookingId}`

Response: Single review object or null

### 4. Update Review
**PUT** `/reviews/{reviewId}`

Request body:
```json
{
  "rating": 4,
  "comments": "Updated review"
}
```

Response: Updated review object

### 5. Delete Review
**DELETE** `/reviews/{reviewId}`

Response:
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Notification Endpoints

### 1. Get Notifications
**GET** `/notifications?unreadOnly=true`

Query Parameters:
- `unreadOnly` (optional): Get only unread notifications

Response:
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "notification-id",
      "title": "New Booking",
      "description": "New booking from Alice Johnson",
      "type": "BOOKING_REQUEST",
      "read": false,
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### 2. Get Unread Count
**GET** `/notifications/unread-count`

Response:
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### 3. Mark as Read
**PATCH** `/notifications/{notificationId}/read`

Response: Updated notification object

### 4. Mark All as Read
**PATCH** `/notifications/read-all`

Response:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 5. Delete Notification
**DELETE** `/notifications/{notificationId}`

Response:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

### 6. Delete All Notifications
**DELETE** `/notifications`

Response:
```json
{
  "success": true,
  "message": "All notifications deleted"
}
```

---

## Payment Endpoints

### 1. Create Payment
**POST** `/payments/booking/{bookingId}`

Response:
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "payment-id",
    "amount": 240,
    "status": "PENDING",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### 2. Process Payment
**POST** `/payments/{paymentId}/process`

Request body:
```json
{
  "status": "COMPLETED",
  "transactionId": "TXN-123456",
  "paymentMethod": "Credit Card",
  "failureReason": null
}
```

Response: Updated payment object

### 3. Get My Payments
**GET** `/payments/my-payments`

Response: Array of payment objects

### 4. Get Guide Payments
**GET** `/payments/guide/{guideId}`

Response: Array of payment objects

### 5. Get Payment Statistics
**GET** `/payments/guide/{guideId}/stats`

Response:
```json
{
  "success": true,
  "message": "Payment statistics retrieved",
  "data": {
    "totalEarnings": 2400,
    "completedPayments": 6,
    "averagePayment": 400
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Should be added for production.

## Pagination

Pagination is not yet implemented but can be added to list endpoints.

## Caching

Response caching is not yet implemented but can be optimized for frequently accessed data like guide lists.
