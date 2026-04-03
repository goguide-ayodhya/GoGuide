import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/environment";
import { Unauthorized } from "../utils/httpException";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Unauthorized("Missing or invalid authorization token");
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new Unauthorized("Invalid token"));
    } else {
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

      if (!requiredRoles.includes(user.role)) {
        throw new Unauthorized("Access denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
