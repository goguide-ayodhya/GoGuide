// ============================================
// GET /api/dashboard - Get dashboard stats
// ============================================

import { NextRequest } from 'next/server';
import { dashboardService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const stats = await dashboardService.getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
