import { NextRequest } from 'next/server'
import { ApiResponse, handleError } from '@/lib/backend/middleware/errorHandler'
import { db } from '@/lib/backend/services/database'
import { verifyToken } from '@/lib/backend/middleware/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const booking = await db.getBookingById(params.id)
    if (!booking) {
      return ApiResponse.error('Booking not found', 404)
    }

    if (booking.userId !== user.userId) {
      return ApiResponse.error('Forbidden', 403)
    }

    return ApiResponse.success(booking, 'Booking retrieved successfully')
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
    const { status, paymentStatus } = body

    const booking = await db.getBookingById(params.id)
    if (!booking) {
      return ApiResponse.error('Booking not found', 404)
    }

    if (booking.userId !== user.userId) {
      return ApiResponse.error('Forbidden', 403)
    }

    if (status) {
      const updatedBooking = await db.updateBookingStatus(params.id, status)
      return ApiResponse.success(updatedBooking, 'Booking updated successfully')
    }

    return ApiResponse.error('No valid updates provided', 400)
  } catch (error) {
    return handleError(error)
  }
}
