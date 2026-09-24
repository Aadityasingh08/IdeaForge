import type { Request } from 'express';
import { ApiError } from './http';

/** Projects belong to the signed-in account. Routes using this sit behind requireAuth. */
export function ownerOf(req: Request): string {
  if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Please log in to continue.');
  return String(req.user._id);
}
