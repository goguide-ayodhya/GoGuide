// ============================================
// GET /api/payments - Get all payments
// POST /api/payments - Create payment
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';
import { PaymentStatus, PaymentMethod, UserRole } from '@/backend/types';

// GET /api/payments
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse query params
    const pagination = parsePaginationParams(request);
    const filters = parseSearchParams(request, ['status', 'method', 'search', 'dateFrom', 'dateTo']);

    // Get payments
    const result = await paymentService.getPayments({
      ...pagination,
      status: filters.status as PaymentStatus | undefined,
      method: filters.method as PaymentMethod | undefined,
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/payments
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const body = await request.json();

    // Create payment
    const payment = await paymentService.createPayment(body);

    return createdResponse(payment, 'Payment created successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
