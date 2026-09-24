import type { Request, Response } from 'express';
import { ok, parseBody } from '../utils/http';
import { ownerOf } from '../utils/owner';
import { AlternativesBody, ApplyBody, ProjectIdBody, StrategyBody, UnderstandBody } from '../schemas/request.schemas';
import { getOwnedProject } from '../services/project.service';
import type { AIOrchestrator } from '../ai/AIOrchestrator';

/** Every AI call first confirms the project belongs to the requesting browser. */
const authorize = (req: Request, projectId: string) => getOwnedProject(projectId, ownerOf(req));

export const createAIController = (ai: AIOrchestrator) => ({
  async understand(req: Request, res: Response) {
    const { projectId, rawIdea } = parseBody(UnderstandBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.understandIdea(projectId, rawIdea));
  },

  async strategy(req: Request, res: Response) {
    const { projectId, section, mode } = parseBody(StrategyBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.buildStrategy(projectId, section, mode));
  },

  async challenge(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.challengeBrand(projectId));
  },

  async apply(req: Request, res: Response) {
    const body = parseBody(ApplyBody, req.body);
    await authorize(req, body.projectId);
    ok(
      res,
      body.action === 'accept'
        ? await ai.applyImprovement(body.projectId, body.recommendation)
        : await ai.keepOriginal(body.projectId, body.challengeId),
    );
  },

  async alternatives(req: Request, res: Response) {
    const { projectId, challengeId } = parseBody(AlternativesBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.generateAlternatives(projectId, challengeId));
  },

  async visual(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.generateVisualIdentity(projectId));
  },

  async consistency(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.checkConsistency(projectId));
  },

  async brandKit(req: Request, res: Response) {
    const { projectId } = parseBody(ProjectIdBody, req.body);
    await authorize(req, projectId);
    ok(res, await ai.generateBrandKit(projectId));
  },
});
