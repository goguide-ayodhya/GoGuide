// ============================================
// GET /api/guides/stats - Get guide statistics
// ============================================

import { NextRequest } from 'next/server';
import { guideService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const stats = await guideService.getGuideStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
