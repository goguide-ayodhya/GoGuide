// ============================================
// GET /api/cabs - Get all cabs
// POST /api/cabs - Create cab
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { cabService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { validate, cabSchema } from '@/backend/middleware/validation';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';
import { UserRole } from '@/backend/types';

// GET /api/cabs
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

    // Get cabs
    const result = await cabService.getCabs({
      ...pagination,
      search: filters.search,
      type: filters.type,
      isActive: filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/cabs
export async function POST(request: NextRequest) {
  try {
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, cabSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Create cab
    const cab = await cabService.createCab(body);

    return createdResponse(cab, 'Cab created successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
