// ============================================
// GET /api/payments/stats - Get payment statistics
// ============================================

import { NextRequest } from 'next/server';
import { paymentService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const stats = await paymentService.getPaymentStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
