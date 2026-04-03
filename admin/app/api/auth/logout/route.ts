// ============================================
// POST /api/auth/logout - Logout endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/services';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookieToken;

    if (token) {
      await authService.logout(token);
    }

    // Clear auth cookie
    const response = successResponse(null, 'Logged out successfully');
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(error as Error);
  }
}
