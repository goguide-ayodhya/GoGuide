// ============================================
// GET /api/cabs/[id] - Get cab by ID
// PUT /api/cabs/[id] - Update cab
// DELETE /api/cabs/[id] - Delete cab
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { cabService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, noContentResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/cabs/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const cab = await cabService.getCabById(id);
    return successResponse(cab);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/cabs/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const cab = await cabService.updateCab(id, body);

    return successResponse(cab, 'Cab updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// DELETE /api/cabs/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    await cabService.deleteCab(id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
