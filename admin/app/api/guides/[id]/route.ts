// ============================================
// GET /api/guides/[id] - Get guide by ID
// PUT /api/guides/[id] - Update guide
// DELETE /api/guides/[id] - Delete guide
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { guideService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, noContentResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/guides/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const guide = await guideService.getGuideById(id);
    return successResponse(guide);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/guides/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const guide = await guideService.updateGuide(id, body);

    return successResponse(guide, 'Guide updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// DELETE /api/guides/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    await guideService.deleteGuide(id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
