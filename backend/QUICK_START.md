# Quick Start Guide - MongoDB + Mongoose Backend

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- Node.js 16+ installed
- MongoDB installed locally OR MongoDB Atlas account (cloud)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

### 4. Update DATABASE_URL in .env

#### Option A: Local MongoDB
```bash
DATABASE_URL=mongodb://localhost:27017/tour-guide-db
```

**Start MongoDB locally:**
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Windows
# MongoDB should auto-start if installed with installer

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account & cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database-name`
4. Add to .env:

```bash
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/tour-guide-db
```

### 5. Start Development Server
```bash
npm run dev
```

Server will output:
```
MongoDB connected successfully
Server running on port 3001 in development environment
```

### 6. Test Connection
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## 📚 Common Mongoose Operations

### Getting Started
```typescript
import { User } from '../models/User';
import { Guide } from '../models/Guide';
```

### Create
```typescript
// Create user
const user = await User.create({
  email: 'john@example.com',
  password: hashedPassword,
  name: 'John Doe',
  role: 'GUIDE'
});

// Create multiple
const users = await User.insertMany([
  { email: 'user1@example.com', ... },
  { email: 'user2@example.com', ... }
]);
```

### Read
```typescript
// Find by ID
const user = await User.findById(userId);

// Find by field
const user = await User.findOne({ email: 'john@example.com' });

// Find all
const users = await User.find({});

// Find with conditions
const activeGuides = await Guide.find({
  isAvailable: true,
  verificationStatus: 'VERIFIED'
});

// Count
const totalGuides = await Guide.countDocuments();

// Distinct values
const specialties = await Guide.distinct('specialty');
```

### Read with Sorting & Pagination
```typescript
// Sort by rating (descending)
const topGuides = await Guide.find({})
  .sort({ averageRating: -1 });

// Pagination: Skip 10, limit to 5
const page2 = await Guide.find({})
  .sort({ createdAt: -1 })
  .skip(10)
  .limit(5);

// Select specific fields
const guideNames = await Guide.find({})
  .select('specialty averageRating -_id'); // '-_id' excludes id
```

### Read with Population (Joins)
```typescript
// Simple populate
const booking = await Booking.findById(bookingId)
  .populate('guideId');

// Multiple populations
const booking = await Booking.findById(bookingId)
  .populate('guideId')
  .populate('userId');

// Nested population
const booking = await Booking.findById(bookingId)
  .populate({
    path: 'guideId',
    populate: { path: 'userId' }
  });

// Selective fields in populated data
const booking = await Booking.findById(bookingId)
  .populate({
    path: 'guideId',
    select: 'specialty hourlyRate' // Only these fields
  });

// Multiple nested
const booking = await Booking.findById(bookingId)
  .populate({
    path: 'guideId',
    populate: [
      { path: 'userId', select: 'name email' },
      { path: 'availability' }
    ]
  })
  .populate('userId');
```

### Update
```typescript
// Find and update (returns new doc)
const guide = await Guide.findByIdAndUpdate(
  guideId,
  { isAvailable: false },
  { new: true } // Important! Returns updated doc
);

// Update without returning
await Guide.findByIdAndUpdate(guideId, { isAvailable: false });

// Update many
const result = await Booking.updateMany(
  { status: 'PENDING', bookingDate: { $lt: new Date() } },
  { status: 'COMPLETED' }
);
console.log(`Updated ${result.modifiedCount} bookings`);

// Alternative update method
const guide = await Guide.updateOne(
  { _id: guideId },
  { $set: { isAvailable: false } }
);
```

### Delete
```typescript
// Find by ID and delete
await User.findByIdAndDelete(userId);

// Delete one matching
await Review.deleteOne({ bookingId });

// Delete many
const result = await Notification.deleteMany({ userId });
console.log(`Deleted ${result.deletedCount} notifications`);
```

---

## 🔍 Advanced Queries

### Comparison Operators
```typescript
// Greater than / Less than
const expensiveGuides = await Guide.find({
  hourlyRate: { $gt: 100 } // Greater than 100
});

const newGuides = await Guide.find({
  createdAt: { $gte: oneMonthAgo, $lte: today }
});

// In array
const statuses = ['CONFIRMED', 'COMPLETED'];
const bookings = await Booking.find({
  status: { $in: statuses }
});

// Not in array
const pending = await Booking.find({
  status: { $nin: ['CANCELLED', 'COMPLETED'] }
});
```

### Text Search
```typescript
// Search profile bios
const guides = await Guide.find({
  bio: { $regex: 'mountain|hiking', $options: 'i' } // Case insensitive
});
```

### Aggregation
```typescript
// Calculate average rating
const stats = await Review.aggregate([
  { $group: { _id: '$guideId', avgRating: { $avg: '$rating' } } }
]);

// Total earnings by guide
const earnings = await Payment.aggregate([
  { $match: { status: 'COMPLETED' } },
  {
    $group: {
      _id: '$guideId',
      totalEarnings: { $sum: '$amount' },
      transactionCount: { $sum: 1 }
    }
  }
]);
```

### Bulk Operations
```typescript
// Bulk write
const bulk = await Booking.collection.initializeUnorderedBulkOp();
bulk.find({ status: 'PENDING' }).update({ $set: { status: 'CANCELLED' } });
bulk.find({ status: 'CONFIRMED' }).update({ $set: { status: 'ON_THE_WAY' } });
await bulk.execute();
```

### Transactions
```typescript
// Multi-document transaction (requires replica set)
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Booking.updateOne({ _id: bookingId }, { status: 'COMPLETED' }, { session });
  await Payment.updateOne({ _id: paymentId }, { status: 'COMPLETED' }, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 📊 Working with Timestamps

Mongoose automatically handles! All models have `createdAt` and `updatedAt`:

```typescript
const user = await User.create({
  email: 'test@example.com',
  // createdAt and updatedAt are auto-generated
});

// Access timestamps
console.log(user.createdAt); // 2024-01-15T10:30:00Z
console.log(user.updatedAt); // 2024-01-15T10:30:00Z

// Update automatically increments updatedAt
await user.save(); // updatedAt updates automatically

// Query by date
const recentUsers = await User.find({
  createdAt: { $gte: oneWeekAgo }
});
```

---

## 🛠️ Debugging Mongoose

### Enable Query Logging
```typescript
// In src/db/connection.ts or server.ts
import mongoose from 'mongoose';

// Log all MongoDB operations
mongoose.set('debug', true);

// Or in env during development
if (isDevelopment) {
  mongoose.set('debug', true);
}
```

### Check Connection Status
```typescript
console.log(mongoose.connection.readyState);
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

### Common Errors & Solutions

**Error**: `ValidationError: email: Email is required`
```typescript
// Add required fields when creating
const user = await User.create({
  email: 'user@example.com',  // Required!
  password: 'hashed',          // Required!
  name: 'John'                 // Required!
});
```

**Error**: `Cannot read property '_id' of null`
```typescript
// Always check if document exists
const user = await User.findById(userId);
if (!user) {
  throw new NotFound('User not found');
}
```

**Error**: `E11000 duplicate key error`
```typescript
// Unique constraint violation - email already exists
try {
  await User.create({ email: 'taken@example.com', ... });
} catch (error) {
  if (error.code === 11000) {
    throw new Conflict('Email already registered');
  }
}
```

---

## 🔐 Authentication Test Flow

```bash
# 1. Create account
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guide@example.com",
    "password": "password123",
    "name": "John Guide",
    "phone": "555-0100",
    "role": "GUIDE"
  }'

# Response includes token
# {
#   "success": true,
#   "data": {
#     "user": { "id": "...", "email": "...", "name": "...", "role": "GUIDE" },
#     "token": "eyJhbGciOiJIUzI1NiIs..."
#   }
# }

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guide@example.com",
    "password": "password123"
  }'

# 3. Use token in protected routes
curl -X GET http://localhost:3001/api/guides/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# 4. Validate token
curl -X POST http://localhost:3001/api/auth/validate-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 📝 Example: Creating a Booking with Proper Error Handling

```typescript
// In a controller or service
export async function createBookingExample(userId: string, bookingData: any) {
  try {
    // 1. Validate guide exists and is available
    const guide = await Guide.findById(bookingData.guideId);
    if (!guide) {
      throw new NotFound('Guide not found');
    }
    
    if (!guide.isAvailable) {
      throw new BadRequest('Guide is not accepting bookings');
    }

    // 2. Create booking
    const booking = await Booking.create({
      guideId: bookingData.guideId,
      userId,
      touristName: bookingData.touristName,
      email: bookingData.email,
      phone: bookingData.phone,
      groupSize: bookingData.groupSize,
      bookingDate: bookingData.bookingDate,
      startTime: bookingData.startTime,
      tourType: bookingData.tourType,
      meetingPoint: bookingData.meetingPoint,
      dropoffLocation: bookingData.dropoffLocation,
      totalPrice: bookingData.totalPrice,
    });

    // 3. Populate related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'guideId',
        populate: { path: 'userId' }
      })
      .populate('userId');

    // 4. Notify guide
    await Notification.create({
      userId: guide.userId,
      title: 'New Booking Request',
      description: `New booking from ${bookingData.touristName}`,
      type: 'BOOKING_REQUEST',
      relatedId: booking._id.toString(),
    });

    return populatedBooking;
    
  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      throw new BadRequest('Invalid booking data: ' + Object.keys(error.errors).join(', '));
    }
    throw error;
  }
}
```

---

## 🎯 Performance Tips

1. **Use `.lean()` for read-only queries**
   ```typescript
   // Faster - returns plain objects
   const guides = await Guide.find({}).lean();
   ```

2. **Select only needed fields**
   ```typescript
   const guides = await Guide.find({})
     .select('specialty hourlyRate -_id')
     .limit(10);
   ```

3. **Batch operations**
   ```typescript
   // Faster than looping
   await Booking.updateMany(
     { status: 'PENDING', bookingDate: { $lt: new Date() } },
     { status: 'COMPLETED' }
   );
   ```

4. **Index on frequently searched fields** ✓ Already done!

5. **Use pagination for large datasets**
   ```typescript
   const pageSize = 20;
   const page = req.query.page || 1;
   const guides = await Guide.find({})
     .limit(pageSize)
     .skip((page - 1) * pageSize);
   ```

---

## 🚀 Building for Production

```bash
# Build TypeScript
npm run build

# Start with production env
NODE_ENV=production npm start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start dist/server.js --name "tour-guide-api"
```

---

## 📞 Support & Resources

- **Mongoose Docs**: https://mongoosejs.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/
- **Project Routes**: All API endpoints in `src/routes/`
- **Models**: All schemas in `src/models/`

---

Happy coding! 🎉
