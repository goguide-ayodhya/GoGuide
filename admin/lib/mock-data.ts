// Mock data for the Tour Guide Admin Dashboard

export interface Guide {
  id: string
  name: string
  email: string
  languages: string[]
  rating: number
  availability: 'available' | 'not-available'
  presence: 'online' | 'offline'
  totalBookings: number
  status: 'approved' | 'pending' | 'blocked'
  joinedDate: string
  phone: string
}

export interface Booking {
  id: string
  touristName: string
  touristEmail: string
  guideName: string
  guideId: string
  tourType: string
  date: string
  meetingPoint: string
  bookingType: 'Normal'
  price: number
  status: 'Pending' | 'Confirmed' | 'On the Way' | 'Completed' | 'Cancelled'
  createdAt: string
}

export interface Cab {
  id: string
  driverName: string
  vehicleType: string
  vehicleNumber: string
  status: 'available' | 'busy' | 'offline'
  phone: string
}

export interface CabPricing {
  baseFare: number
  pricePerKm: number
}

export interface Pass {
  id: string
  name: string
  description: string
  validity: string
  price: number
  category: 'token'
}

export interface Payment {
  id: string
  bookingId: string
  touristName: string
  amount: number
  method: 'UPI' | 'Razorpay'
  status: 'Success' | 'Failed' | 'Pending'
  date: string
}

export interface Message {
  id: string
  touristName: string
  email: string
  message: string
  date: string
  resolved: boolean
}

export interface Review {
  id: string
  guideName: string
  guideId: string
  touristName: string
  rating: number
  comment: string
  date: string
}

export interface Notification {
  id: string
  type: 'booking' | 'payment' | 'guide' | 'cancellation'
  title: string
  message: string
  date: string
  read: boolean
}

// Mock Guides
export const mockGuides: Guide[] = [
  {
    id: 'GD001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    languages: ['English', 'Hindi', 'Tamil'],
    rating: 4.8,
    availability: 'available',
    presence: 'online',
    totalBookings: 156,
    status: 'approved',
    joinedDate: '2024-01-15',
    phone: '+91 98765 43210'
  },
  {
    id: 'GD002',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    languages: ['English', 'Hindi', 'French'],
    rating: 4.9,
    availability: 'available',
    presence: 'online',
    totalBookings: 203,
    status: 'approved',
    joinedDate: '2023-11-20',
    phone: '+91 98765 43211'
  },
  {
    id: 'GD003',
    name: 'Mohammed Ali',
    email: 'mohammed@example.com',
    languages: ['English', 'Arabic', 'Urdu'],
    rating: 4.7,
    availability: 'not-available',
    presence: 'online',
    totalBookings: 89,
    status: 'approved',
    joinedDate: '2024-02-10',
    phone: '+91 98765 43212'
  },
  {
    id: '',
    name: 'Anita Desai',
    email: 'anita@example.com',
    languages: ['English', 'Hindi', 'German'],
    rating: 0,
    availability: 'not-available',
    presence: 'offline',
    totalBookings: 0,
    status: 'pending',
    joinedDate: '2024-03-01',
    phone: '+91 98765 43213'
  },
  {
    id: 'GD004',
    name: 'Suresh Menon',
    email: 'suresh@example.com',
    languages: ['English', 'Malayalam', 'Hindi'],
    rating: 4.5,
    availability: 'not-available',
    presence: 'offline',
    totalBookings: 67,
    status: 'blocked',
    joinedDate: '2023-09-05',
    phone: '+91 98765 43214'
  },
  {
    id: '',
    name: 'Kavitha Rajan',
    email: 'kavitha@example.com',
    languages: ['English', 'Tamil', 'Telugu'],
    rating: 0,
    availability: 'not-available',
    presence: 'offline',
    totalBookings: 0,
    status: 'pending',
    joinedDate: '2024-03-05',
    phone: '+91 98765 43215'
  }
]

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    touristName: 'John Smith',
    touristEmail: 'john@example.com',
    guideName: 'Rajesh Kumar',
    guideId: 'GD001',
    tourType: 'Temple Tour',
    date: '2024-03-15',
    meetingPoint: 'Hotel Entrance',
    bookingType: 'Normal',
    price: 5000,
    status: 'Confirmed',
    createdAt: '2024-03-10'
  },
  {
    id: 'BK002',
    touristName: 'Emily Johnson',
    touristEmail: 'emily@example.com',
    guideName: 'Priya Sharma',
    guideId: 'GD002',
    tourType: 'City Heritage Walk',
    date: '2024-03-16',
    meetingPoint: 'Central Station',
    bookingType: 'Normal',
    price: 2500,
    status: 'Pending',
    createdAt: '2024-03-11'
  },
  {
    id: 'BK003',
    touristName: 'Michael Brown',
    touristEmail: 'michael@example.com',
    guideName: 'Mohammed Ali',
    guideId: 'GD003',
    tourType: 'Food Tour',
    date: '2024-03-14',
    meetingPoint: 'Market Square',
    bookingType: 'Normal',
    price: 1800,
    status: 'On the Way',
    createdAt: '2024-03-12'
  },
  {
    id: 'BK004',
    touristName: 'Sarah Wilson',
    touristEmail: 'sarah@example.com',
    guideName: 'Rajesh Kumar',
    guideId: 'GD001',
    tourType: 'Historical Monuments',
    date: '2024-03-13',
    meetingPoint: 'Airport',
    bookingType: 'Normal',
    price: 7500,
    status: 'Completed',
    createdAt: '2024-03-08'
  },
  {
    id: 'BK005',
    touristName: 'David Lee',
    touristEmail: 'david@example.com',
    guideName: 'Priya Sharma',
    guideId: 'GD002',
    tourType: 'Night City Tour',
    date: '2024-03-17',
    meetingPoint: 'Hotel Lobby',
    bookingType: 'Normal',
    price: 3000,
    status: 'Cancelled',
    createdAt: '2024-03-09'
  },
  {
    id: 'BK006',
    touristName: 'Anna Martinez',
    touristEmail: 'anna@example.com',
    guideName: 'Rajesh Kumar',
    guideId: 'GD001',
    tourType: 'Temple Tour',
    date: '2024-03-18',
    meetingPoint: 'Bus Stand',
    bookingType: 'VIP',
    price: 6000,
    status: 'Pending',
    createdAt: '2024-03-12'
  }
]

// Mock Cabs
export const mockCabs: Cab[] = [
  {
    id: 'CB001',
    driverName: 'Ravi Shankar',
    vehicleType: 'Sedan',
    vehicleNumber: 'TN 01 AB 1234',
    status: 'available',
    phone: '+91 87654 32100'
  },
  {
    id: 'CB002',
    driverName: 'Kumar Swamy',
    vehicleType: 'SUV',
    vehicleNumber: 'TN 01 CD 5678',
    status: 'busy',
    phone: '+91 87654 32101'
  },
  {
    id: 'CB003',
    driverName: 'Vijay Kumar',
    vehicleType: 'Mini',
    vehicleNumber: 'TN 01 EF 9012',
    status: 'available',
    phone: '+91 87654 32102'
  },
  {
    id: 'CB004',
    driverName: 'Ganesh Babu',
    vehicleType: 'Luxury',
    vehicleNumber: 'TN 01 GH 3456',
    status: 'offline',
    phone: '+91 87654 32103'
  }
]

// Mock Cab Pricing
export const mockCabPricing: CabPricing = {
  baseFare: 50,
  pricePerKm: 12
}

// Mock Passes
export const mockPasses: Pass[] = [
  {
    id: 'PS001',
    name: 'Temple Token Pass',
    description: 'Skip the queue at major temples with priority entry',
    validity: '1 Day',
    price: 500,
    category: 'token'
  },
  {
    id: 'PS003',
    name: 'Priority Entry Pass',
    description: 'Priority entry to all heritage sites and monuments',
    validity: '3 Days',
    price: 1500,
    category: 'token'
  }
]

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'PY001',
    bookingId: 'BK001',
    touristName: 'John Smith',
    amount: 5000,
    method: 'Razorpay',
    status: 'Success',
    date: '2024-03-10'
  },
  {
    id: 'PY002',
    bookingId: 'BK002',
    touristName: 'Emily Johnson',
    amount: 2500,
    method: 'UPI',
    status: 'Pending',
    date: '2024-03-11'
  },
  {
    id: 'PY003',
    bookingId: 'BK003',
    touristName: 'Michael Brown',
    amount: 1800,
    method: 'UPI',
    status: 'Success',
    date: '2024-03-12'
  },
  {
    id: 'PY004',
    bookingId: 'BK004',
    touristName: 'Sarah Wilson',
    amount: 7500,
    method: 'Razorpay',
    status: 'Success',
    date: '2024-03-08'
  },
  {
    id: 'PY005',
    bookingId: 'BK005',
    touristName: 'David Lee',
    amount: 3000,
    method: 'UPI',
    status: 'Failed',
    date: '2024-03-09'
  }
]

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'MSG001',
    touristName: 'John Smith',
    email: 'john@example.com',
    message: 'I need to change my booking date. Is that possible?',
    date: '2024-03-10',
    resolved: false
  },
  {
    id: 'MSG002',
    touristName: 'Emily Johnson',
    email: 'emily@example.com',
    message: 'Great service! The guide was very knowledgeable.',
    date: '2024-03-09',
    resolved: true
  },
  {
    id: 'MSG003',
    touristName: 'Michael Brown',
    email: 'michael@example.com',
    message: 'Can I get a refund for my cancelled tour?',
    date: '2024-03-08',
    resolved: false
  },
  {
    id: 'MSG004',
    touristName: 'Sarah Wilson',
    email: 'sarah@example.com',
    message: 'Is there a group discount available for 10+ people?',
    date: '2024-03-07',
    resolved: false
  }
]

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'RV001',
    guideName: 'Rajesh Kumar',
    guideId: 'GD001',
    touristName: 'John Smith',
    rating: 5,
    comment: 'Excellent guide! Very knowledgeable about local history and culture.',
    date: '2024-03-12'
  },
  {
    id: 'RV002',
    guideName: 'Priya Sharma',
    guideId: 'GD002',
    touristName: 'Emily Johnson',
    rating: 5,
    comment: 'Priya made our city tour unforgettable. Highly recommended!',
    date: '2024-03-11'
  },
  {
    id: 'RV003',
    guideName: 'Mohammed Ali',
    guideId: 'GD003',
    touristName: 'Michael Brown',
    rating: 4,
    comment: 'Great food tour experience. Could improve on timing.',
    date: '2024-03-10'
  },
  {
    id: 'RV004',
    guideName: 'Rajesh Kumar',
    guideId: 'GD001',
    touristName: 'Sarah Wilson',
    rating: 5,
    comment: 'Second time booking with Rajesh. Always a pleasure!',
    date: '2024-03-09'
  }
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'NT001',
    type: 'booking',
    title: 'New Booking',
    message: 'Anna Martinez booked a Temple Tour',
    date: '2024-03-12T14:30:00',
    read: false
  },
  {
    id: 'NT002',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of ₹5,000 received from John Smith',
    date: '2024-03-12T12:15:00',
    read: false
  },
  {
    id: 'NT003',
    type: 'guide',
    title: 'Guide Application',
    message: 'Kavitha Rajan has applied as a new guide',
    date: '2024-03-12T10:00:00',
    read: false
  },
  {
    id: 'NT004',
    type: 'cancellation',
    title: 'Booking Cancelled',
    message: 'David Lee cancelled their Night City Tour',
    date: '2024-03-11T18:45:00',
    read: true
  },
  {
    id: 'NT005',
    type: 'guide',
    title: 'Guide Application',
    message: 'Anita Desai has applied as a new guide',
    date: '2024-03-11T09:30:00',
    read: true
  }
]

// Dashboard Stats
export const dashboardStats = {
  totalBookings: 156,
  pendingBookings: 12,
  completedBookings: 134,
  totalGuides: 15,
  activeGuides: 8,
  totalRevenue: 450000,
  adminEarnings: 90000,
  guideEarnings: 360000
}

// Weekly Bookings Data
export const weeklyBookingsData = [
  { day: 'Mon', bookings: 12 },
  { day: 'Tue', bookings: 18 },
  { day: 'Wed', bookings: 15 },
  { day: 'Thu', bookings: 22 },
  { day: 'Fri', bookings: 28 },
  { day: 'Sat', bookings: 35 },
  { day: 'Sun', bookings: 32 }
]

// Monthly Revenue Data
export const monthlyRevenueData = [
  { month: 'Jan', revenue: 85000, admin: 17000, guide: 68000 },
  { month: 'Feb', revenue: 92000, admin: 18400, guide: 73600 },
  { month: 'Mar', revenue: 78000, admin: 15600, guide: 62400 },
  { month: 'Apr', revenue: 105000, admin: 21000, guide: 84000 },
  { month: 'May', revenue: 118000, admin: 23600, guide: 94400 },
  { month: 'Jun', revenue: 95000, admin: 19000, guide: 76000 }
]

// Settings
export const defaultSettings = {
  platformCommission: 20,
  cancellationPolicy: '24 hours before tour',
  notificationEmail: true,
  notificationSms: false,
  notificationPush: true
}
