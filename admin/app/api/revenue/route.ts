
import { NextRequest, NextResponse } from 'next/server';
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

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'yearly' | null;

    const stats = await dashboardService.getRevenueStats(period || 'monthly');
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
