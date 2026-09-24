import type { NextFunction, Request, Response } from 'express';
import { isAllowedOrigin } from '../config/env';
import { userFromRequest } from '../services/auth.service';
import { ApiError } from './http';

/** Attaches the signed-in user (if any) from the session cookie. */
export async function sessionMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const found = await userFromRequest(req);
    if (found) {
      req.user = found.user;
      req.sessionHash = found.hash;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new ApiError(401, 'UNAUTHORIZED', 'Please log in to continue.'));
  next();
}

/**
 * CSRF protection: cookies are sent automatically, so state-changing requests coming
 * from a browser must originate from the IdeaForge frontend.
 */
export function originCheck(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.header('origin');
  if (origin && !isAllowedOrigin(origin)) {
    return next(new ApiError(403, 'FORBIDDEN', 'This request was blocked for your security.'));
  }
  next();
}
