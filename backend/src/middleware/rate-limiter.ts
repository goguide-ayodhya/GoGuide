// ============================================
// Rate Limiter Middleware
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '../types';

// Rate limit store (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

// Default configurations
export const rateLimitConfigs = {
  default: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
  auth: { windowMs: 300000, maxRequests: 10 }, // 10 login attempts per 5 minutes
  strict: { windowMs: 60000, maxRequests: 20 }, // 20 requests per minute
  lenient: { windowMs: 60000, maxRequests: 500 }, // 500 requests per minute
};

// Get client identifier
const getClientId = (request: NextRequest): string => {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  // Combine with user agent for more unique identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent.substring(0, 50)}`;
};

// Rate limiter middleware
export const rateLimit = (config: RateLimitConfig = rateLimitConfigs.default) => {
  return (request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } => {
    const clientId = getClientId(request);
    const key = `${request.nextUrl.pathname}-${clientId}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const allowed = entry.count <= config.maxRequests;

    return { allowed, remaining, resetTime: entry.resetTime };
  };
};

// Rate limit response
export const rateLimitResponse = (
  resetTime: number,
  message?: string
): NextResponse<ApiResponse> => {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: message || 'Too many requests. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(resetTime),
      },
    }
  );
};

// Higher-order function to add rate limiting to routes
export const withRateLimit = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) => {
  const limiter = rateLimit(config);

  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed, remaining, resetTime } = limiter(request);

    if (!allowed) {
      return rateLimitResponse(resetTime);
    }

    const response = await handler(request);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(resetTime));

    return response;
  };
};
