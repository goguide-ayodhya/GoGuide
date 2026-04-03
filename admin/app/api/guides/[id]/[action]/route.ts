// ============================================
// POST /api/guides/[id]/[action] - Guide actions
// Actions: approve, reject, block, unblock
// ============================================

import { NextRequest } from 'next/server';
import { guideService } from '@/backend/services';
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

    let guide;
    let message;

    switch (action) {
      case 'approve':
        guide = await guideService.approveGuide(id);
        message = 'Guide approved successfully';
        break;

      case 'reject':
        const rejectBody = await request.json().catch(() => ({}));
        guide = await guideService.rejectGuide(id, rejectBody.reason);
        message = 'Guide rejected';
        break;

      case 'block':
        const blockBody = await request.json().catch(() => ({}));
        if (!blockBody.reason) {
          throw new BadRequestError('Block reason is required');
        }
        guide = await guideService.blockGuide(id, blockBody.reason);
        message = 'Guide blocked';
        break;

      case 'unblock':
        guide = await guideService.unblockGuide(id);
        message = 'Guide unblocked';
        break;

      default:
        throw new BadRequestError(`Invalid action: ${action}`);
    }

    return successResponse(guide, message);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
