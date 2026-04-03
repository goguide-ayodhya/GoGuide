// ============================================
// GET /api/bookings - Get all bookings
// POST /api/bookings - Create booking
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { validate, bookingSchema } from '@/backend/middleware/validation';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';
import { BookingStatus, UserRole } from '@/backend/types';

// GET /api/bookings
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse query params
    const pagination = parsePaginationParams(request);
    const filters = parseSearchParams(request, ['status', 'search', 'guideId', 'touristId', 'dateFrom', 'dateTo']);

    // Get bookings
    const result = await bookingService.getBookings({
      ...pagination,
      status: filters.status as BookingStatus | undefined,
      search: filters.search,
      guideId: filters.guideId,
      touristId: filters.touristId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, bookingSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await bookingService.createBooking(body);

    return createdResponse(booking, 'Booking created successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
