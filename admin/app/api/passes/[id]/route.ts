// ============================================
// GET /api/passes/[id] - Get pass by ID
// PUT /api/passes/[id] - Update pass
// DELETE /api/passes/[id] - Delete pass
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { passService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, noContentResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/passes/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const pass = await passService.getPassById(id);
    return successResponse(pass);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/passes/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const pass = await passService.updatePass(id, body);

    return successResponse(pass, 'Pass updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// DELETE /api/passes/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    await passService.deletePass(id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
