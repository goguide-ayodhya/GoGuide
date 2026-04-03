// ============================================
// GET /api/reviews/[id] - Get review by ID
// PUT /api/reviews/[id] - Update review
// DELETE /api/reviews/[id] - Delete review
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, noContentResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/reviews/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const review = await reviewService.getReviewById(id);
    return successResponse(review);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/reviews/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const review = await reviewService.updateReview(id, body);

    return successResponse(review, 'Review updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// DELETE /api/reviews/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    await reviewService.deleteReview(id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
