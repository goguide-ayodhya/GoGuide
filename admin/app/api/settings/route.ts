// ============================================
// GET /api/settings - Get platform settings
// PUT /api/settings - Update platform settings
// ============================================

import { NextRequest } from 'next/server';
import { settingsService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const settings = await settingsService.getSettings();
    return successResponse(settings);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
  try {
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const settings = await settingsService.updateSettings(body);

    return successResponse(settings, 'Settings updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
