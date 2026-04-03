# Migration Guide: Prisma + PostgreSQL to MongoDB + Mongoose

## Overview
The backend has been successfully converted from Prisma + PostgreSQL to MongoDB + Mongoose while maintaining the same API endpoints and overall architecture.

## Key Changes

### 1. **Database Models**
- **Location**: `src/models/`
- **Files Created**:
  - `User.ts` - User schema with roles (GUIDE, TOURIST, ADMIN)
  - `Guide.ts` - Guide profile information
  - `Booking.ts` - Tour booking details
  - `Review.ts` - Guide reviews and ratings
  - `Payment.ts` - Payment tracking
  - `Notification.ts` - User notifications
  - `Availability.ts` - Guide availability schedule

All models are fully typed TypeScript interfaces with Mongoose schemas, including proper indexes for performance.

### 2. **Database Connection**
- **Location**: `src/db/connection.ts`
- Handles MongoDB connection using Mongoose
- Graceful disconnection support
- Connection logging via logger utility

### 3. **Services Updated**
All service files have been converted to use Mongoose methods instead of Prisma:
- `src/services/auth.service.ts` - User authentication and signup
- `src/services/guide.service.ts` - Guide profile management
- `src/services/booking.service.ts` - Booking operations
- `src/services/review.service.ts` - Review creation and management
- `src/services/payment.service.ts` - Payment processing
- `src/services/notification.service.ts` - Notification handling

### 4. **Server Setup**
- **File**: `src/server.ts`
- Added MongoDB connection initialization on startup
- Waits for DB connection before starting the Express server
- Maintains same API routes and health check endpoint

### 5. **Dependencies**
- **Removed**: `prisma`, `@prisma/client`
- **Added**: `mongoose` (^8.0.0)
- Prisma scripts removed from `package.json`

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

For local MongoDB:
```
DATABASE_URL=mongodb://localhost:27017/tour-guide-db
```

For MongoDB Atlas (cloud):
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### 3. Install MongoDB (if running locally)
- Download from https://www.mongodb.com/try/download/community
- Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### 4. Run Development Server
```bash
npm run dev
```

The server will:
1. Connect to MongoDB
2. Start on port 3001 (configurable via PORT env variable)
3. Log connection status

### 5. Build for Production
```bash
npm run build
npm start
```

## API Changes
**None!** All API endpoints remain the same:
- POST `/api/auth/login`
- POST `/api/auth/signup`
- POST `/api/auth/validate-token`
- GET `/api/guides`
- GET `/api/guides/:guideId`
- GET `/api/guides/profile/me`
- GET `/api/bookings`
- POST `/api/bookings`
- GET `/api/reviews`
- POST `/api/reviews`
- GET `/api/payments`
- POST `/api/payments`
- GET `/api/notifications`
- etc.

## Database Schema Differences

### Mongoose vs Prisma
| Feature | Prisma | Mongoose |
|---------|--------|----------|
| ID Format | UUID (cuid) | MongoDB ObjectId |
| Relationships | Foreign keys with relations | References with populate |
| Unique Constraints | `@unique` | `unique: true` in schema |
| Indexes | `@@index` | `index()` on schema |
| Timestamps | `@default(now())`, `@updatedAt` | `timestamps: true` |
| Enums | Native enum type | String with enum validation |

### ID Migration Note
If you need to migrate existing data from PostgreSQL to MongoDB:
1. Export data from PostgreSQL (JSON format)
2. Transform UUID strings to MongoDB ObjectIds
3. Import into MongoDB collections
4. Update foreign key references accordingly

A sample migration script can be created if needed.

## Mongoose Query Examples

### Finding Documents
```typescript
// Find by ID
const user = await User.findById(userId);

// Find one matching criteria
const guide = await Guide.findOne({ userId });

// Find many with filters
const guides = await Guide.find({ specialty: 'Mountain Tours' })
  .sort({ averageRating: -1 })
  .limit(10);
```

### Populating References
```typescript
// Single populate
const booking = await Booking.findById(bookingId)
  .populate('guideId');

// Nested populate
const booking = await Booking.findById(bookingId)
  .populate({
    path: 'guideId',
    populate: { path: 'userId' }
  });
```

### Updating Documents
```typescript
// Find and update, return new document
const guide = await Guide.findByIdAndUpdate(
  guideId,
  { isAvailable: false },
  { new: true }
);

// Update many
await Booking.updateMany(
  { guideId, status: 'PENDING' },
  { status: 'CONFIRMED' }
);
```

### Deleting Documents
```typescript
// Delete by ID
await User.findByIdAndDelete(userId);

// Delete one matching criteria
await Review.deleteOne({ bookingId });

// Delete many
await Notification.deleteMany({ userId });
```

## Performance Considerations

1. **Indexes**: All models have proper indexes on frequently queried fields
2. **Population**: Use `.populate()` selectively to avoid over-fetching
3. **Lean Queries**: For read-only operations, use `.lean()` to get plain objects
4. **Pagination**: Implement `.skip()` and `.limit()` for large result sets

Example with lean:
```typescript
const guides = await Guide.find({}).lean(); // Returns plain objects
```

## Error Handling
All services maintain the same custom error classes:
- `BadRequest` (400)
- `Unauthorized` (401)
- `NotFound` (404)
- `Conflict` (409)
- `InternalServerError` (500)

## Logging
Uses the existing logger utility in `src/utils/logger.ts`:
```typescript
logger.info('User created successfully');
logger.error('Database connection failed');
```

## Next Steps

1. **Update Tests**: If you have tests, update them to work with MongoDB
2. **Data Migration**: Migrate existing PostgreSQL data to MongoDB if needed
3. **Environment Setup**: Configure environment variables for your deployment
4. **Deployment**: Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

## Troubleshooting

### Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running locally or update DATABASE_URL to correct server

### Model Not Found
```
Error: Cannot find module 'User'
```
- Ensure all model imports use the correct paths from `src/models/`

### TypeScript Errors
```bash
npm run type-check  # Check for type errors
```

## Support Resources
- Mongoose Documentation: https://mongoosejs.com/
- MongoDB University: https://university.mongodb.com/
- Express.js Documentation: https://expressjs.com/
