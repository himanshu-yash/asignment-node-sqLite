import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError";

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

declare module "express-session" {
  interface SessionData {
    user: { id: number; email: string; role: string };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Access denied. No token provided."));
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token."));
  }
};

export const sessionGuard = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.session.user) {
    return next(new UnauthorizedError("Session expired. Please login again."));
  }
  next();
};

export const roleGuard = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Forbidden. Insufficient permissions."));
    }
    next();
  };
};
