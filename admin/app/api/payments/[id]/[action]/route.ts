// ============================================
// POST /api/payments/[id]/[action] - Payment actions
// Actions: complete, fail, refund
// ============================================

import { NextRequest } from 'next/server';
import { paymentService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';
import { BadRequestError } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string; action: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, action } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    let payment;
    let message;

    switch (action) {
      case 'complete':
        const completeBody = await request.json().catch(() => ({}));
        payment = await paymentService.completePayment(id, completeBody.transactionId);
        message = 'Payment marked as completed';
        break;

      case 'fail':
        payment = await paymentService.failPayment(id);
        message = 'Payment marked as failed';
        break;

      case 'refund':
        const refundBody = await request.json().catch(() => ({}));
        if (!refundBody.reason) {
          throw new BadRequestError('Refund reason is required');
        }
        payment = await paymentService.refundPayment(id, refundBody.reason, refundBody.amount);
        message = 'Payment refunded';
        break;

      default:
        throw new BadRequestError(`Invalid action: ${action}`);
    }

    return successResponse(payment, message);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
