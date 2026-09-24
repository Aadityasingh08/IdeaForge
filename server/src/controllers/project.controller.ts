import type { Request, Response } from 'express';
import { ok, parseBody } from '../utils/http';
import { CreateProjectBody, PatchProjectBody } from '../schemas/request.schemas';
import * as projects from '../services/project.service';

const id = (req: Request) => String(req.params.id);

export const projectController = {
  async create(req: Request, res: Response) {
    const { rawIdea } = parseBody(CreateProjectBody, req.body);
    const doc = await projects.createProject(rawIdea);
    ok(res, projects.serialize(doc), 201);
  },

  async list(_req: Request, res: Response) {
    ok(res, await projects.listProjects());
  },

  async get(req: Request, res: Response) {
    ok(res, projects.serialize(await projects.getProjectDoc(id(req))));
  },

  async patch(req: Request, res: Response) {
    const body = parseBody(PatchProjectBody, req.body);
    ok(res, await projects.patchProject(id(req), body));
  },

  async remove(req: Request, res: Response) {
    await projects.deleteProject(id(req));
    ok(res, { deleted: true });
  },

  async runs(req: Request, res: Response) {
    ok(res, await projects.listRuns(id(req)));
  },
};
