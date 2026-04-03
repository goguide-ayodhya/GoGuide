// ============================================
// In-Memory Database with JSON Persistence
// ============================================

import {
  User,
  Guide,
  Tourist,
  Booking,
  Cab,
  Pass,
  Payment,
  Message,
  Review,
  PlatformSettings,
  UserRole,
  GuideStatus,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  MessageStatus,
  PassType,
  Session,
} from '../types';

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const generateReadableId = (prefix: string, index: number): string => {
  return `${prefix}-${String(index).padStart(3, '0')}`;
};

// Database Collections
interface Database {
  users: Map<string, User>;
  guides: Map<string, Guide>;
  tourists: Map<string, Tourist>;
  bookings: Map<string, Booking>;
  cabs: Map<string, Cab>;
  passes: Map<string, Pass>;
  payments: Map<string, Payment>;
  messages: Map<string, Message>;
  reviews: Map<string, Review>;
  sessions: Map<string, Session>;
  settings: PlatformSettings | null;
  counters: {
    bookings: number;
    payments: number;
    messages: number;
    reviews: number;
  };
}

// Initialize Database with seed data
const initializeDatabase = (): Database => {
  const db: Database = {
    users: new Map(),
    guides: new Map(),
    tourists: new Map(),
    bookings: new Map(),
    cabs: new Map(),
    passes: new Map(),
    payments: new Map(),
    messages: new Map(),
    reviews: new Map(),
    sessions: new Map(),
    settings: null,
    counters: {
      bookings: 0,
      payments: 0,
      messages: 0,
      reviews: 0,
    },
  };

  // Seed Admin User
  const adminId = generateId();
  db.users.set(adminId, {
    id: adminId,
    email: 'admin@tourguide.com',
    // Password: admin123 (in production, this would be hashed)
    password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
    name: 'Admin User',
    role: UserRole.ADMIN,
    phone: '+91 9876543210',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed Guides
  const guideData = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543211', status: GuideStatus.APPROVED, city: 'Delhi', rating: 4.8, bookings: 45 },
    { name: 'Priya Patel', email: 'priya@example.com', phone: '+91 9876543212', status: GuideStatus.APPROVED, city: 'Mumbai', rating: 4.9, bookings: 62 },
    { name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 9876543213', status: GuideStatus.PENDING, city: 'Jaipur', rating: 0, bookings: 0 },
    { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 9876543214', status: GuideStatus.PENDING, city: 'Hyderabad', rating: 0, bookings: 0 },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 9876543215', status: GuideStatus.BLOCKED, city: 'Agra', rating: 3.2, bookings: 12 },
    { name: 'Anjali Menon', email: 'anjali@example.com', phone: '+91 9876543216', status: GuideStatus.APPROVED, city: 'Kerala', rating: 4.7, bookings: 38 },
    { name: 'Rajesh Gupta', email: 'rajesh@example.com', phone: '+91 9876543217', status: GuideStatus.REJECTED, city: 'Varanasi', rating: 0, bookings: 0 },
    { name: 'Meera Nair', email: 'meera@example.com', phone: '+91 9876543218', status: GuideStatus.APPROVED, city: 'Goa', rating: 4.6, bookings: 28 },
  ];

  guideData.forEach((guide) => {
    const id = generateId();
    const userId = generateId();
    db.users.set(userId, {
      id: userId,
      email: guide.email,
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
      name: guide.name,
      role: UserRole.GUIDE,
      phone: guide.phone,
      isActive: guide.status === GuideStatus.APPROVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    db.guides.set(id, {
      id,
      userId,
      name: guide.name,
      email: guide.email,
      phone: guide.phone,
      status: guide.status,
      languages: ['English', 'Hindi'],
      specializations: ['Historical Tours', 'Cultural Tours'],
      experience: Math.floor(Math.random() * 10) + 1,
      hourlyRate: Math.floor(Math.random() * 500) + 500,
      rating: guide.rating,
      totalReviews: Math.floor(guide.bookings * 0.7),
      totalBookings: guide.bookings,
      totalEarnings: guide.bookings * 1500,
      location: { city: guide.city, state: guide.city, country: 'India' },
      documents: {},
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      bio: `Experienced tour guide based in ${guide.city}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  });

  // Seed Tourists
  const touristData = [
    { name: 'John Smith', email: 'john@example.com', nationality: 'USA' },
    { name: 'Emma Wilson', email: 'emma@example.com', nationality: 'UK' },
    { name: 'Hans Mueller', email: 'hans@example.com', nationality: 'Germany' },
    { name: 'Sophie Martin', email: 'sophie@example.com', nationality: 'France' },
    { name: 'Yuki Tanaka', email: 'yuki@example.com', nationality: 'Japan' },
  ];

  touristData.forEach((tourist) => {
    const id = generateId();
    const userId = generateId();
    db.users.set(userId, {
      id: userId,
      email: tourist.email,
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
      name: tourist.name,
      role: UserRole.TOURIST,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    db.tourists.set(id, {
      id,
      userId,
      name: tourist.name,
      email: tourist.email,
      nationality: tourist.nationality,
      totalBookings: Math.floor(Math.random() * 5) + 1,
      totalSpent: Math.floor(Math.random() * 10000) + 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Seed Bookings
  const guides = Array.from(db.guides.values()).filter(g => g.status === GuideStatus.APPROVED);
  const tourists = Array.from(db.tourists.values());
  const statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
  const locations = ['Taj Mahal, Agra', 'Red Fort, Delhi', 'Gateway of India, Mumbai', 'Hawa Mahal, Jaipur', 'Backwaters, Kerala'];
  const tourTypes = ['Historical Tour', 'Cultural Tour', 'Food Tour', 'Walking Tour', 'Photography Tour'];

  for (let i = 0; i < 25; i++) {
    const guide = guides[Math.floor(Math.random() * guides.length)];
    const tourist = tourists[Math.floor(Math.random() * tourists.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const id = generateId();
    db.counters.bookings++;
    const amount = Math.floor(Math.random() * 3000) + 1500;
    const platformFee = Math.round(amount * 0.2);

    db.bookings.set(id, {
      id,
      bookingId: generateReadableId('BK', db.counters.bookings),
      guideId: guide.id,
      guideName: guide.name,
      touristId: tourist.id,
      touristName: tourist.name,
      touristEmail: tourist.email,
      date: new Date(Date.now() + (Math.random() * 30 - 15) * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '17:00',
      duration: 8,
      location: locations[Math.floor(Math.random() * locations.length)],
      tourType: tourTypes[Math.floor(Math.random() * tourTypes.length)],
      groupSize: Math.floor(Math.random() * 5) + 1,
      amount,
      platformFee,
      guideEarnings: amount - platformFee,
      status,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  // Seed Cabs
  const cabTypes = [
    { name: 'Economy Sedan', type: 'Sedan', capacity: 4, baseFare: 100, pricePerKm: 12, features: ['AC', 'Music System'] },
    { name: 'Premium Sedan', type: 'Sedan', capacity: 4, baseFare: 150, pricePerKm: 18, features: ['AC', 'Music System', 'Leather Seats', 'WiFi'] },
    { name: 'Standard SUV', type: 'SUV', capacity: 6, baseFare: 200, pricePerKm: 22, features: ['AC', 'Music System', 'Extra Luggage Space'] },
    { name: 'Luxury SUV', type: 'SUV', capacity: 6, baseFare: 300, pricePerKm: 30, features: ['AC', 'Music System', 'Leather Seats', 'WiFi', 'Mini Bar'] },
    { name: 'Mini Van', type: 'Van', capacity: 8, baseFare: 250, pricePerKm: 25, features: ['AC', 'Music System', 'Extra Luggage Space'] },
    { name: 'Tempo Traveller', type: 'Van', capacity: 12, baseFare: 400, pricePerKm: 35, features: ['AC', 'Music System', 'Pushback Seats'] },
  ];

  cabTypes.forEach((cab) => {
    const id = generateId();
    db.cabs.set(id, {
      id,
      ...cab,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Seed Passes
  const passTypes = [
    { name: 'Day Pass', type: PassType.TOKEN, description: 'Access to all monuments for one day', price: 500, validityDays: 1, maxUsage: 5, discount: 20 },
    { name: 'Weekend Pass', type: PassType.TOKEN, description: 'Access to all monuments for weekend', price: 800, validityDays: 2, maxUsage: 10, discount: 25 },
    { name: 'VIP Heritage Pass', type: PassType.VIP, description: 'Skip-the-line access to premium monuments', price: 2000, validityDays: 7, maxUsage: -1, discount: 30 },
    { name: 'Premium Annual Pass', type: PassType.PREMIUM, description: 'Unlimited access to all monuments for a year', price: 10000, validityDays: 365, maxUsage: -1, discount: 40 },
  ];

  passTypes.forEach((pass) => {
    const id = generateId();
    db.passes.set(id, {
      id,
      ...pass,
      features: ['Priority Entry', 'Audio Guide', 'Map Included'],
      isActive: true,
      applicableSites: ['Taj Mahal', 'Red Fort', 'Qutub Minar', 'Hawa Mahal'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Seed Payments
  const completedBookings = Array.from(db.bookings.values()).filter(
    b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED
  );

  completedBookings.forEach((booking) => {
    const id = generateId();
    db.counters.payments++;
    const status = booking.status === BookingStatus.COMPLETED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
    db.payments.set(id, {
      id,
      paymentId: generateReadableId('PAY', db.counters.payments),
      bookingId: booking.id,
      guideId: booking.guideId,
      guideName: booking.guideName,
      touristId: booking.touristId,
      touristName: booking.touristName,
      amount: booking.amount,
      platformFee: booking.platformFee,
      guideEarnings: booking.guideEarnings,
      method: Math.random() > 0.5 ? PaymentMethod.UPI : PaymentMethod.RAZORPAY,
      status,
      transactionId: status === PaymentStatus.COMPLETED ? `TXN${Date.now()}${Math.random().toString(36).substring(7)}` : undefined,
      paidAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
      createdAt: booking.createdAt,
      updatedAt: new Date(),
    });
  });

  // Seed Messages
  const messageData = [
    { subject: 'Booking Inquiry', message: 'I would like to know more about the historical tour packages available.', category: 'general' as const, priority: 'medium' as const },
    { subject: 'Payment Issue', message: 'My payment was deducted but booking is not confirmed. Please help.', category: 'payment' as const, priority: 'high' as const },
    { subject: 'Guide Feedback', message: 'Excellent service by Rahul. Would recommend to everyone!', category: 'feedback' as const, priority: 'low' as const },
    { subject: 'Cancellation Request', message: 'I need to cancel my booking due to emergency. Please process refund.', category: 'booking' as const, priority: 'high' as const },
    { subject: 'Complaint', message: 'The guide arrived 30 minutes late to the meeting point.', category: 'complaint' as const, priority: 'high' as const },
  ];

  messageData.forEach((msg, index) => {
    const tourist = tourists[index % tourists.length];
    const id = generateId();
    db.counters.messages++;
    db.messages.set(id, {
      id,
      messageId: generateReadableId('MSG', db.counters.messages),
      touristId: tourist.id,
      touristName: tourist.name,
      touristEmail: tourist.email,
      subject: msg.subject,
      message: msg.message,
      status: index % 2 === 0 ? MessageStatus.PENDING : MessageStatus.RESOLVED,
      priority: msg.priority,
      category: msg.category,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  });

  // Seed Reviews
  const reviewComments = [
    'Amazing experience! The guide was very knowledgeable and friendly.',
    'Good tour but a bit rushed. Could have been better.',
    'Excellent service. Highly recommended for first-time visitors.',
    'The guide knew everything about the history. Very informative.',
    'Average experience. Expected more from a premium tour.',
  ];

  completedBookings.slice(0, 10).forEach((booking, index) => {
    const id = generateId();
    db.counters.reviews++;
    db.reviews.set(id, {
      id,
      reviewId: generateReadableId('REV', db.counters.reviews),
      bookingId: booking.id,
      guideId: booking.guideId,
      guideName: booking.guideName,
      touristId: booking.touristId,
      touristName: booking.touristName,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      comment: reviewComments[index % reviewComments.length],
      isVerified: true,
      isVisible: true,
      helpfulCount: Math.floor(Math.random() * 20),
      reportCount: 0,
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  });

  // Seed Platform Settings
  db.settings = {
    id: generateId(),
    platformName: 'TourGuide',
    platformFeePercentage: 20,
    cancellationPolicy: {
      freeCancellationHours: 24,
      cancellationFeePercentage: 10,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      bookingAlerts: true,
      paymentAlerts: true,
      reviewAlerts: true,
    },
    paymentGateways: {
      razorpay: { enabled: true },
      upi: { enabled: true },
    },
    supportEmail: 'support@tourguide.com',
    supportPhone: '+91 1800 123 4567',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return db;
};

// Create singleton database instance
let db: Database | null = null;

export const getDatabase = (): Database => {
  if (!db) {
    db = initializeDatabase();
  }
  return db;
};

// Reset database (for testing)
export const resetDatabase = (): Database => {
  db = initializeDatabase();
  return db;
};

// Export database instance
export default getDatabase;
