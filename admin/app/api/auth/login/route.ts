// ============================================
// POST /api/auth/login - Login endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/services';
import { validate, loginSchema } from '@/backend/middleware/validation';
import { errorResponse, successResponse } from '@/backend/middleware/error-handler';
import { rateLimit, rateLimitConfigs, rateLimitResponse } from '@/backend/middleware/rate-limiter';

const limiter = rateLimit(rateLimitConfigs.auth);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, resetTime } = limiter(request);
    if (!allowed) {
      return rateLimitResponse(resetTime, 'Too many login attempts. Please try again later.');
    }

    // Parse and validate body
    const body = await request.json();
    const { valid, errors } = validate(body, loginSchema);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await authService.login({
      email: body.email,
      password: body.password,
    });

    // Set auth cookie
    const response = successResponse(result, 'Login successful');
    
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(error as Error);
  }
}
