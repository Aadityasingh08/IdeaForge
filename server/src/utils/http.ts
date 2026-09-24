import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import mongoose from 'mongoose';
import { logger } from './logger';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'AI_FAILED'
  | 'AI_INVALID_OUTPUT'
  | 'PRECONDITION_FAILED'
  | 'DATABASE_ERROR'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what = 'Project') => new ApiError(404, 'NOT_FOUND', `${what} not found.`);

export function ok<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ success: true, data });
}

export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path.join('.') || 'body';
    throw new ApiError(400, 'VALIDATION_ERROR', `Invalid request: ${path} — ${first?.message ?? 'invalid'}`);
  }
  return result.data;
}

export function assertObjectId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw notFound();
}

// Central error handler — never leaks stack traces or raw provider/database errors.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.status >= 500) logger.error(`${req.method} ${req.path} → ${err.code}: ${err.message}`);
    res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request.' } });
    return;
  }
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON body.' } });
    return;
  }
  if (err instanceof mongoose.Error || (err as { name?: string })?.name?.startsWith('Mongo')) {
    logger.error(`${req.method} ${req.path} database error`, err);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'We could not save or load your project. Please try again.' },
    });
    return;
  }
  logger.error(`${req.method} ${req.path} unexpected error`, err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } });
}
