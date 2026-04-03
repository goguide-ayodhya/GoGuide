// ============================================
// GET /api/passes - Get all passes
// POST /api/passes - Create pass
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { passService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { validate, passSchema } from '@/backend/middleware/validation';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';
import { PassType, UserRole } from '@/backend/types';

// GET /api/passes
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse query params
    const pagination = parsePaginationParams(request);
    const filters = parseSearchParams(request, ['search', 'type', 'isActive']);

    // Get passes
    const result = await passService.getPasses({
      ...pagination,
      search: filters.search,
      type: filters.type as PassType | undefined,
      isActive: filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/passes
export async function POST(request: NextRequest) {
  try {
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, passSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Create pass
    const pass = await passService.createPass(body);

    return createdResponse(pass, 'Pass created successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
