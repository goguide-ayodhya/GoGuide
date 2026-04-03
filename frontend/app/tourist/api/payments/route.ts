import { NextRequest } from 'next/server'
import { PaymentSchema } from '@/lib/backend/utils/validation'
import { ApiResponse, handleError } from '@/lib/backend/middleware/errorHandler'
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
    const { bookingId, method, amount } = body

    // Validate payment data
    PaymentSchema.parse({ method, amount })

    const booking = await db.getBookingById(bookingId)
    if (!booking) {
      return ApiResponse.error('Booking not found', 404)
    }

    if (booking.userId !== user.userId) {
      return ApiResponse.error('Forbidden', 403)
    }

    // Simulate payment processing (90% success rate)
    const isSuccess = Math.random() < 0.9
    const paymentStatus = isSuccess ? 'success' : 'failed'

    const payment = await db.createPayment({
      bookingId,
      userId: user.userId,
      amount,
      method,
      status: paymentStatus,
      transactionId: `TXN_${Date.now()}`,
    })

    // Update booking payment status
    if (isSuccess) {
      await db.updateBookingStatus(bookingId, 'confirmed')
    }

    return ApiResponse.created(
      {
        payment,
        bookingStatus: isSuccess ? 'confirmed' : 'pending',
      },
      isSuccess ? 'Payment successful' : 'Payment failed'
    )
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
    const paymentIds = bookings.map((b) => b.id)

    // This would be more efficient with a proper database query
    // For now, return a placeholder
    return ApiResponse.success([], 'Payments retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}
