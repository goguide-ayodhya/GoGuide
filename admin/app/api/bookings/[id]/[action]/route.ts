// ============================================
// POST /api/bookings/[id]/[action] - Booking actions
// Actions: confirm, complete, cancel
// ============================================

import { NextRequest } from 'next/server';
import { bookingService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';
import { BadRequestError } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string; action: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, action } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    let booking;
    let message;

    switch (action) {
      case 'confirm':
        // Admin only
        if (authResult.user?.role !== UserRole.ADMIN) {
          return unauthorizedResponse('Admin access required');
        }
        booking = await bookingService.confirmBooking(id);
        message = 'Booking confirmed';
        break;

      case 'complete':
        // Admin only
        if (authResult.user?.role !== UserRole.ADMIN) {
          return unauthorizedResponse('Admin access required');
        }
        booking = await bookingService.completeBooking(id);
        message = 'Booking completed';
        break;

      case 'cancel':
        const body = await request.json().catch(() => ({}));
        const cancelledBy = authResult.user?.role === UserRole.ADMIN ? 'admin' : 
                           authResult.user?.role === UserRole.GUIDE ? 'guide' : 'tourist';
        booking = await bookingService.cancelBooking(id, cancelledBy, body.reason);
        message = 'Booking cancelled';
        break;

      default:
        throw new BadRequestError(`Invalid action: ${action}`);
    }

    return successResponse(booking, message);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
