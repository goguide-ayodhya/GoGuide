import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/environment";
import { Unauthorized } from "../utils/httpException";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const requestUrl = req.url;
    const requestMethod = req.method;

    console.log(`[AUTH-MIDDLEWARE] ${requestMethod} ${requestUrl}`);
    console.log("[AUTH-MIDDLEWARE] Authorization header:", authHeader ? "Present" : "Missing");
    console.log("[AUTH-MIDDLEWARE] All headers:", Object.keys(req.headers));
    
    if (authHeader) {
      console.log("[AUTH-MIDDLEWARE] Authorization header length:", authHeader.length);
      console.log("[AUTH-MIDDLEWARE] Authorization header start:", authHeader.substring(0, 30) + "...");
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[AUTH-MIDDLEWARE] CRITICAL: Missing or invalid authorization token format");
      throw new Unauthorized("Missing or invalid authorization token");
    }

    const token = authHeader.substring(7);
    if (!token || token === "null" || token === "undefined") {
      console.error("[AUTH-MIDDLEWARE] CRITICAL: Token is null, undefined, or empty");
      throw new Unauthorized("Missing or invalid authorization token");
    }

    console.log("[AUTH-MIDDLEWARE] Token extracted successfully, length:", token.length);
    console.log("[AUTH-MIDDLEWARE] Token start:", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };

    console.log("[AUTH-MIDDLEWARE] JWT decoded successfully:", {
      userId: decoded.userId,
      email: decoded.email
    });

    // Get user and validate status
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Unauthorized("User not found");
    }

    // Check user status - block suspended/blocked/deleted users
    if (user.status === "BLOCKED") {
      console.log(`[AUTH] Blocked user ${decoded.userId} attempted access`);
      throw new Unauthorized("Your account has been blocked. Please contact support.");
    }

    if (user.status === "SUSPENDED") {
      // Check if suspension has expired
      if (user.suspendUntil && new Date() > user.suspendUntil) {
        // Auto-reactivate expired suspension
        user.status = "ACTIVE";
        user.suspendUntil = undefined;
        await user.save();
        console.log(`[AUTH] Auto-reactivated user ${decoded.userId} after suspension expired`);
      } else {
        console.log(`[AUTH] Suspended user ${decoded.userId} attempted access`);
        throw new Unauthorized("Your account has been suspended. Please contact support.");
      }
    }

    if (user.status === "DELETED" || user.isDeleted) {
      console.log(`[AUTH] Deleted user ${decoded.userId} attempted access`);
      throw new Unauthorized("Your account has been deleted.");
    }

    req.user = { ...decoded, role: user.role, status: user.status };
    req.userId = decoded.userId;

    console.log("[AUTH-MIDDLEWARE] Authentication successful for user:", decoded.userId);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("[AUTH-MIDDLEWARE] JWT verification failed:", error.message);
      next(new Unauthorized("Invalid token"));
    } else {
      console.error("[AUTH-MIDDLEWARE] Authentication error:", error);
      next(error);
    }
  }
};

export const authorize = (requiredRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new Unauthorized("User not authenticated");
      }

      const user = await User.findById(req.userId);

      if (!user) {
        throw new Unauthorized("User not found");
      }

      // Check user status - block suspended/blocked/deleted users
      if (user.status === "BLOCKED") {
        console.log(`[AUTH] Blocked user ${req.userId} attempted access`);
        throw new Unauthorized("Your account has been blocked. Please contact support.");
      }

      if (user.status === "SUSPENDED") {
        // Check if suspension has expired
        if (user.suspendUntil && new Date() > user.suspendUntil) {
          // Auto-reactivate expired suspension
          user.status = "ACTIVE";
          user.suspendUntil = undefined;
          await user.save();
          console.log(`[AUTH] Auto-reactivated user ${req.userId} after suspension expired`);
        } else {
          console.log(`[AUTH] Suspended user ${req.userId} attempted access`);
          throw new Unauthorized("Your account has been suspended. Please contact support.");
        }
      }

      if (user.status === "DELETED" || user.isDeleted) {
        console.log(`[AUTH] Deleted user ${req.userId} attempted access`);
        throw new Unauthorized("Your account has been deleted.");
      }

      if (!requiredRoles.includes(user.role)) {
        throw new Unauthorized("Access denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
