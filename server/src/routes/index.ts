import { Router } from 'express';
import { asyncHandler, ok } from '../utils/http';
import { projectController as p } from '../controllers/project.controller';
import { createAIController } from '../controllers/ai.controller';
import type { AIOrchestrator } from '../ai/AIOrchestrator';
import { isDatabaseReady } from '../config/db';

export function createRouter(ai: AIOrchestrator) {
  const router = Router();
  const c = createAIController(ai);

  router.get('/health', (_req, res) => ok(res, { status: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected', ai: ai.mode }));

  router.post('/projects', asyncHandler(p.create));
  router.get('/projects', asyncHandler(p.list));
  router.get('/projects/:id', asyncHandler(p.get));
  router.patch('/projects/:id', asyncHandler(p.patch));
  router.delete('/projects/:id', asyncHandler(p.remove));
  router.get('/projects/:id/runs', asyncHandler(p.runs));

  router.post('/ai/understand', asyncHandler(c.understand));
  router.post('/ai/strategy', asyncHandler(c.strategy));
  router.post('/ai/challenge', asyncHandler(c.challenge));
  router.post('/ai/challenge/apply', asyncHandler(c.apply));
  router.post('/ai/challenge/alternatives', asyncHandler(c.alternatives));
  router.post('/ai/visual', asyncHandler(c.visual));
  router.post('/ai/consistency', asyncHandler(c.consistency));
  router.post('/ai/brand-kit', asyncHandler(c.brandKit));

  return router;
}
