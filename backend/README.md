# Tour Guide Platform - Backend API

Professional-grade Node.js/Express backend for the Tour Guide Booking Platform.

## Features

- **Authentication**: JWT-based user authentication with role-based access control
- **Guide Management**: CRUD operations for guide profiles, availability, and online status
- **Booking System**: Complete booking lifecycle management with status tracking
- **Reviews**: Guest review system with rating calculation
- **Payments**: Payment processing and tracking
- **Notifications**: Real-time notification system for users
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── validations/      # Input validation schemas
│   ├── utils/            # Utility functions
│   └── server.ts         # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json          # Dependencies
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
npm run prisma:migrate
npm run prisma:seed
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/validate-token` - Token validation

### Guides
- `GET /api/guides` - Get all guides
- `GET /api/guides/me` - Get current user's guide profile
- `GET /api/guides/:guideId` - Get guide details
- `PUT /api/guides/:guideId` - Update guide profile
- `PATCH /api/guides/:guideId/availability` - Set availability
- `PATCH /api/guides/:guideId/online-status` - Set online status

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/guide/:guideId` - Get guide's bookings
- `GET /api/bookings/:bookingId` - Get booking details
- `PATCH /api/bookings/:bookingId/status` - Update booking status
- `PATCH /api/bookings/:bookingId/cancel` - Cancel booking

### Reviews
- `POST /api/reviews/booking/:bookingId` - Create review
- `GET /api/reviews/guide/:guideId` - Get guide reviews
- `GET /api/reviews/booking/:bookingId` - Get booking review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `DELETE /api/notifications` - Delete all notifications

### Payments
- `POST /api/payments/booking/:bookingId` - Create payment
- `POST /api/payments/:paymentId/process` - Process payment
- `GET /api/payments/my-payments` - Get user payments
- `GET /api/payments/guide/:guideId` - Get guide payments
- `GET /api/payments/guide/:guideId/stats` - Get payment statistics

## Technologies

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: bcryptjs

## License

MIT
