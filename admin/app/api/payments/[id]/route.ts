// ============================================
// GET /api/payments/[id] - Get payment by ID
// PUT /api/payments/[id] - Update payment
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/payments/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const payment = await paymentService.getPaymentById(id);
    return successResponse(payment);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/payments/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const payment = await paymentService.updatePayment(id, body);

    return successResponse(payment, 'Payment updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
