import type { Request, Response } from 'express';
import { ok, parseBody } from '../utils/http';
import { AlternativesBody, ApplyBody, ProjectIdBody, StrategyBody, UnderstandBody } from '../schemas/request.schemas';
import type { AIOrchestrator } from '../ai/AIOrchestrator';

export const createAIController = (ai: AIOrchestrator) => ({
  async understand(req: Request, res: Response) {
    const { projectId, rawIdea } = parseBody(UnderstandBody, req.body);
    ok(res, await ai.understandIdea(projectId, rawIdea));
  },

  async strategy(req: Request, res: Response) {
    const { projectId, section } = parseBody(StrategyBody, req.body);
    ok(res, await ai.buildStrategy(projectId, section));
  },

  async challenge(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    ok(res, await ai.challengeBrand(projectId));
  },

  async apply(req: Request, res: Response) {
    const body = parseBody(ApplyBody, req.body);
    ok(
      res,
      body.action === 'accept'
        ? await ai.applyImprovement(body.projectId, body.recommendation)
        : await ai.keepOriginal(body.projectId, body.challengeId),
    );
  },

  async alternatives(req: Request, res: Response) {
    const { projectId, challengeId } = parseBody(AlternativesBody, req.body);
    ok(res, await ai.generateAlternatives(projectId, challengeId));
  },

  async visual(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    ok(res, await ai.generateVisualIdentity(projectId));
  },

  async consistency(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    ok(res, await ai.checkConsistency(projectId));
  },

  async brandKit(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    ok(res, await ai.generateBrandKit(projectId));
  },
});
