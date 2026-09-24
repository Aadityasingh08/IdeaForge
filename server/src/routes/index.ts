import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler, ok } from '../utils/http';
import { projectController as p } from '../controllers/project.controller';
import { createAIController } from '../controllers/ai.controller';
import type { AIOrchestrator } from '../ai/AIOrchestrator';
import { isDatabaseReady } from '../config/db';
import { env } from '../config/env';
import { authController as a } from '../controllers/auth.controller';
import { requireAuth } from '../utils/auth';

const limited = (limit: number, message: string, windowMs = 60_000) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message } }),
  });

export function createRouter(ai: AIOrchestrator) {
  const router = Router();
  const c = createAIController(ai);

  router.use(limited(env.apiRateLimit, 'Too many requests — please slow down for a moment.'));

  router.get('/health', (_req, res) => ok(res, { status: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected', ai: ai.mode }));

  // Accounts — sign-up/log-in/reset get a strict limit to stop password guessing.
  const auth$ = limited(env.authRateLimit, 'Too many attempts. Please wait a few minutes and try again.', 15 * 60_000);
  router.post('/auth/signup', auth$, asyncHandler(a.signup));
  router.post('/auth/login', auth$, asyncHandler(a.login));
  router.post('/auth/forgot-password', auth$, asyncHandler(a.forgot));
  router.post('/auth/reset-password', auth$, asyncHandler(a.reset));
  router.post('/auth/logout', asyncHandler(a.logout));
  router.get('/auth/me', asyncHandler(a.me));
  router.post('/auth/logout-all', requireAuth, asyncHandler(a.logoutAll));
  router.patch('/auth/me', requireAuth, asyncHandler(a.updateProfile));
  router.post('/auth/change-password', requireAuth, auth$, asyncHandler(a.changePassword));
  router.delete('/auth/me', requireAuth, auth$, asyncHandler(a.deleteAccount));

  // Public, read-only brand page (only when the owner enabled sharing).
  router.get('/share/:id', asyncHandler(p.shared));

  // Everything below requires a signed-in account.
  router.use(requireAuth);

  router.post('/projects', asyncHandler(p.create));
  router.get('/projects', asyncHandler(p.list));
  router.get('/projects/:id', asyncHandler(p.get));
  router.patch('/projects/:id', asyncHandler(p.patch));
  router.delete('/projects/:id', asyncHandler(p.remove));
  router.get('/projects/:id/runs', asyncHandler(p.runs));
  router.get('/projects/:id/versions', asyncHandler(p.versions));
  router.post('/projects/:id/versions/:versionId/restore', asyncHandler(p.restore));

  // AI calls cost money — they get their own, stricter limit.
  const ai$ = limited(env.aiRateLimit, 'You’re generating very quickly — wait a minute and try again.');
  router.post('/ai/understand', ai$, asyncHandler(c.understand));
  router.post('/ai/strategy', ai$, asyncHandler(c.strategy));
  router.post('/ai/challenge', ai$, asyncHandler(c.challenge));
  router.post('/ai/challenge/apply', asyncHandler(c.apply));
  router.post('/ai/challenge/alternatives', ai$, asyncHandler(c.alternatives));
  router.post('/ai/visual', ai$, asyncHandler(c.visual));
  router.post('/ai/consistency', ai$, asyncHandler(c.consistency));
  router.post('/ai/brand-kit', ai$, asyncHandler(c.brandKit));

  return router;
}
