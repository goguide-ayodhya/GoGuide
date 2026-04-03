import { NextRequest } from 'next/server'
import { CabBookingSchema, GuideBookingSchema, PackageBookingSchema, TokenPurchaseSchema } from '@/lib/backend/utils/validation'
import { ApiResponse, handleError, AppError } from '@/lib/backend/middleware/errorHandler'
import { db } from '@/lib/backend/services/database'
import { verifyToken } from '@/lib/backend/middleware/auth'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return ApiResponse.error('Unauthorized', 401)
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return ApiResponse.error('Invalid token', 401)
    }

    const body = await req.json()
    const { bookingType, itemId, itemName, itemPrice, details } = body

    // Validate based on booking type
    if (bookingType === 'cab') {
      CabBookingSchema.parse(details)
    } else if (bookingType === 'guide') {
      GuideBookingSchema.parse(details)
    } else if (bookingType === 'package') {
      PackageBookingSchema.parse(details)
    } else if (bookingType === 'token') {
      TokenPurchaseSchema.parse(details)
    }

    const booking = await db.createBooking({
      userId: user.userId,
      bookingType,
      itemId,
      itemName,
      itemPrice,
      date: new Date(details.date || details.startDate),
      time: details.time,
      meetingPoint: details.meetingPoint,
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: itemPrice * (details.quantity || details.participants || 1),
    })

    return ApiResponse.created(booking, 'Booking created successfully')
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return ApiResponse.error('Unauthorized', 401)
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return ApiResponse.error('Invalid token', 401)
    }

    const bookings = await db.getBookingsByUserId(user.userId)

    return ApiResponse.success(bookings, 'Bookings retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
