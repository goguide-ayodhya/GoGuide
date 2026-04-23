// ============================================
// Base Types & Interfaces for GoGuide Admin
// ============================================

// Enums
export enum UserRole {
  ADMIN = 'admin',
  GUIDE = 'guide',
  TOURIST = 'tourist',
}

export enum GuideStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  UPI = 'UPI',
  RAZORPAY = 'Razorpay',
  CARD = 'Card',
  CASH = 'Cash',
}

export enum MessageStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
}

export enum PassType {
  TOKEN = 'Token',
  PREMIUM = 'Premium',
}

// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Model
export interface User extends BaseEntity {
  email: string;
  password: string; // Hashed
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

// Admin User
export interface Admin extends User {
  role: UserRole.ADMIN;
  permissions: string[];
}

// Guide Model
export interface Guide extends BaseEntity {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: GuideStatus;
  languages: string[];
  specializations: string[];
  experience: number; // Years
  price: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  totalEarnings: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  documents: {
    idProof?: string;
    certificate?: string;
    photo?: string;
  };
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  bio?: string;
  verifiedAt?: Date;
  blockedAt?: Date;
  blockReason?: string;
}

// Tourist Model
export interface Tourist extends BaseEntity {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  nationality?: string;
  totalBookings: number;
  totalSpent: number;
}

// Booking Model
export interface Booking extends BaseEntity {
  bookingId: string; // Human readable ID like BK-001
  guideId: string;
  guideName: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  touristPhone?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // Hours
  location: string;
  tourType: string;
  groupSize: number;
  amount: number;
  platformFee: number;
  guideEarnings: number;
  status: BookingStatus;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: 'admin' | 'guide' | 'tourist';
  cancelledAt?: Date;
  completedAt?: Date;
  payment?: {
    id: string;
    status: PaymentStatus;
    method: PaymentMethod;
    transactionId?: string;
  };
}

// Cab Model
export interface Cab extends BaseEntity {
  name: string;
  type: string; // Sedan, SUV, etc.
  capacity: number;
  baseFare: number;
  pricePerKm: number;
  image?: string;
  isActive: boolean;
  features: string[];
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
}

// Pass Model
export interface Pass extends BaseEntity {
  name: string;
  type: PassType;
  description: string;
  price: number;
  validityDays: number;
  features: string[];
  maxUsage: number; // -1 for unlimited
  isActive: boolean;
  discount: number; // Percentage
  applicableSites: string[];
}

// Payment Model
export interface Payment extends BaseEntity {
  paymentId: string; // Human readable ID like PAY-001
  bookingId: string;
  guideId: string;
  guideName: string;
  touristId: string;
  touristName: string;
  amount: number;
  platformFee: number;
  guideEarnings: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
}

// Message Model
export interface Message extends BaseEntity {
  messageId: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  subject: string;
  message: string;
  status: MessageStatus;
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'booking' | 'payment' | 'complaint' | 'feedback';
  relatedBookingId?: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  resolvedAt?: Date;
}

// Review Model
export interface Review extends BaseEntity {
  reviewId: string;
  bookingId: string;
  guideId: string;
  guideName: string;
  touristId: string;
  touristName: string;
  rating: number; // 1-5
  comments: string;
  images?: string[];
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  isVisible: boolean;
  adminResponse?: string;
  helpfulCount: number;
  reportCount: number;
}

// Platform Settings
export interface PlatformSettings extends BaseEntity {
  platformName: string;
  platformFeePercentage: number; // Admin commission
  cancellationPolicy: {
    freeCancellationHours: number;
    cancellationFeePercentage: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    bookingAlerts: boolean;
    paymentAlerts: boolean;
    reviewAlerts: boolean;
  };
  paymentGateways: {
    razorpay: {
      enabled: boolean;
      keyId?: string;
    };
    upi: {
      enabled: boolean;
      vpa?: string;
    };
  };
  supportEmail: string;
  supportPhone: string;
  termsUrl?: string;
  privacyUrl?: string;
}

// Revenue Stats
export interface RevenueStats {
  totalRevenue: number;
  adminRevenue: number;
  guidePayouts: number;
  pendingPayouts: number;
  refunds: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    date: string;
    total: number;
    admin: number;
    guide: number;
  }[];
}

// Dashboard Stats
export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalGuides: number;
  totalTourists: number;
  pendingBookings: number;
  activeGuides: number;
  pendingGuides: number;
  recentBookings: Booking[];
  revenueChart: {
    date: string;
    revenue: number;
  }[];
  bookingsChart: {
    date: string;
    bookings: number;
  }[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query Params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GuideFilters extends PaginationParams {
  status?: GuideStatus;
  search?: string;
  city?: string;
  minRating?: number;
}

export interface BookingFilters extends PaginationParams {
  status?: BookingStatus;
  search?: string;
  guideId?: string;
  touristId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentFilters extends PaginationParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MessageFilters extends PaginationParams {
  status?: MessageStatus;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  search?: string;
}

export interface ReviewFilters extends PaginationParams {
  guideId?: string;
  minRating?: number;
  maxRating?: number;
  search?: string;
}

// Session & Auth
export interface Session {
  id: string
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  expiresAt: Date;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresAt: Date;
}
