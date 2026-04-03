// ============================================
// POST /api/messages/[id]/[action] - Message actions
// Actions: resolve, reopen
// ============================================

import { NextRequest } from 'next/server';
import { messageService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';
import { BadRequestError } from '@/backend/middleware/error-handler';
import { UserRole } from '@/backend/types';

type RouteParams = { params: Promise<{ id: string; action: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, action } = await params;
    
    // Authenticate as admin
    const authResult = await authenticate(request);
    if (!authResult.success || authResult.user?.role !== UserRole.ADMIN) {
      return unauthorizedResponse('Admin access required');
    }

    let message;
    let responseMessage;

    switch (action) {
      case 'resolve':
        const resolveBody = await request.json().catch(() => ({}));
        message = await messageService.resolveMessage(
          id, 
          resolveBody.response, 
          authResult.user?.name
        );
        responseMessage = 'Message resolved';
        break;

      case 'reopen':
        message = await messageService.reopenMessage(id);
        responseMessage = 'Message reopened';
        break;

      default:
        throw new BadRequestError(`Invalid action: ${action}`);
    }

    return successResponse(message, responseMessage);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
