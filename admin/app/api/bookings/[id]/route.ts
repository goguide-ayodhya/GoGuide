// ============================================
// GET /api/bookings/[id] - Get booking by ID
// PUT /api/bookings/[id] - Update booking
// DELETE /api/bookings/[id] - Delete booking
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, noContentResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/bookings/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const booking = await bookingService.getBookingById(id);
    return successResponse(booking);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/bookings/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const booking = await bookingService.updateBooking(id, body);

    return successResponse(booking, 'Booking updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// DELETE /api/bookings/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    await bookingService.deleteBooking(id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
