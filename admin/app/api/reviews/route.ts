// ============================================
// GET /api/reviews - Get all reviews
// POST /api/reviews - Create review
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { validate, reviewSchema } from '@/backend/middleware/validation';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse query params
    const pagination = parsePaginationParams(request);
    const filters = parseSearchParams(request, ['guideId', 'minRating', 'maxRating', 'search']);

    // Get reviews
    const result = await reviewService.getReviews({
      ...pagination,
      guideId: filters.guideId,
      minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
      maxRating: filters.maxRating ? parseFloat(filters.maxRating) : undefined,
      search: filters.search,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, reviewSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Create review
    const review = await reviewService.createReview(body);

    return createdResponse(review, 'Review submitted successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
