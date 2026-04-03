// ============================================
// GET /api/messages/[id] - Get message by ID
// PUT /api/messages/[id] - Update message
// DELETE /api/messages/[id] - Delete message
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, noContentResponse } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/messages/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    const message = await messageService.getMessageById(id);
    return successResponse(message);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// PUT /api/messages/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const message = await messageService.updateMessage(id, body);

    return successResponse(message, 'Message updated successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// DELETE /api/messages/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    await messageService.deleteMessage(id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
