// ============================================
// GET /api/guides - Get all guides
// POST /api/guides - Create guide
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { guideService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { validate, guideSchema } from '@/backend/middleware/validation';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';
import { GuideStatus, UserRole } from '@/backend/types';

// GET /api/guides
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse query params
    const pagination = parsePaginationParams(request);
    const filters = parseSearchParams(request, ['status', 'search', 'city', 'minRating']);

    // Get guides
    const result = await guideService.getGuides({
      ...pagination,
      status: filters.status as GuideStatus | undefined,
      search: filters.search,
      city: filters.city,
      minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/guides
export async function POST(request: NextRequest) {
  try {
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, guideSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Create guide
    const guide = await guideService.createGuide(body);

    return createdResponse(guide, 'Guide created successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
