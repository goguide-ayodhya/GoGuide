// ============================================
// GET /api/auth/me - Get current user
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/services';
import { authenticate } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticate(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get full user details
    const user = await authService.getUserById(authResult.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return successResponse(user);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
