import type { Request } from 'express';
import { OwnerHeader } from '../schemas/request.schemas';
import { ApiError } from './http';

/**
 * Projects are private to the browser that created them via an anonymous owner id.
 * This keeps demo data separate between visitors; it is not authentication.
 */
export function ownerOf(req: Request): string {
  const parsed = OwnerHeader.safeParse(req.header('x-ideaforge-owner'));
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Missing or invalid X-IdeaForge-Owner header.');
  return parsed.data;
}
