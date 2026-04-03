// ============================================
// GET /api/messages - Get all messages
// POST /api/messages - Create message
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/backend/services';
import { authenticate, unauthorizedResponse } from '@/backend/middleware/auth';
import { errorResponse, successResponse, createdResponse } from '@/backend/middleware/error-handler';
import { validate, messageSchema } from '@/backend/middleware/validation';
import { parsePaginationParams, parseSearchParams } from '@/backend/utils/query-helpers';
import { MessageStatus } from '@/backend/types';

// GET /api/messages
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error);
    }

    // Parse query params
    const pagination = parsePaginationParams(request);
    const filters = parseSearchParams(request, ['status', 'priority', 'category', 'search']);

    // Get messages
    const result = await messageService.getMessages({
      ...pagination,
      status: filters.status as MessageStatus | undefined,
      priority: filters.priority as 'low' | 'medium' | 'high' | undefined,
      category: filters.category,
      search: filters.search,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

// POST /api/messages
export async function POST(request: NextRequest) {
  try {
    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, messageSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Create message
    const message = await messageService.createMessage(body);

    return createdResponse(message, 'Message sent successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
