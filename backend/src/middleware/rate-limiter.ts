// ============================================
// Rate Limiter Middleware (Express Version)
// ============================================

import { Request, Response, NextFunction } from "express";

// Rate limit store (in production → use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// Config
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export const rateLimitConfigs = {
  default: { windowMs: 60000, maxRequests: 100 },
  auth: { windowMs: 300000, maxRequests: 10 },
  strict: { windowMs: 60000, maxRequests: 20 },
  lenient: { windowMs: 60000, maxRequests: 500 },
};

// Get client ID (Express style)
const getClientId = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  const ip =
    (Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0]) ||
    realIp ||
    req.ip ||
    "unknown";

  const userAgent = req.headers["user-agent"] || "unknown";

  return `${ip}-${userAgent}`;
};

// Middleware
export const rateLimit = (
  config: RateLimitConfig = rateLimitConfigs.default,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientId(req);
    const key = `${req.path}-${clientId}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return res.status(429).json({
        success: false,
        message: config.message || "Too many requests. Please try again later.",
        retryAfter,
      });
    }

    // headers (optional but good)
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(entry.resetTime));

    next();
  };
};
