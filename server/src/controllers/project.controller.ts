import type { Request, Response } from 'express';
import { ok, parseBody } from '../utils/http';
import { ownerOf } from '../utils/owner';
import { CreateProjectBody, PatchProjectBody } from '../schemas/request.schemas';
import * as projects from '../services/project.service';
import * as versions from '../services/version.service';

const id = (req: Request) => String(req.params.id);
const owned = (req: Request) => projects.getOwnedProject(id(req), ownerOf(req));

export const projectController = {
  async create(req: Request, res: Response) {
    const { rawIdea } = parseBody(CreateProjectBody, req.body);
    const doc = await projects.createProject(rawIdea, ownerOf(req));
    ok(res, projects.serialize(doc), 201);
  },

  async list(req: Request, res: Response) {
    ok(res, await projects.listProjects(ownerOf(req)));
  },

  async get(req: Request, res: Response) {
    ok(res, projects.serialize(await owned(req)));
  },

  async patch(req: Request, res: Response) {
    const body = parseBody(PatchProjectBody, req.body);
    ok(res, await projects.patchProject(await owned(req), body));
  },

  async remove(req: Request, res: Response) {
    await projects.deleteProject(await owned(req));
    ok(res, { deleted: true });
  },

  async runs(req: Request, res: Response) {
    ok(res, await projects.listRuns(await owned(req)));
  },

  async versions(req: Request, res: Response) {
    const doc = await owned(req);
    ok(res, await versions.listVersions(String(doc._id)));
  },

  async restore(req: Request, res: Response) {
    const doc = await owned(req);
    await versions.restoreVersion(doc, String(req.params.versionId));
    ok(res, projects.serialize(doc));
  },

  async shared(req: Request, res: Response) {
    ok(res, await projects.getSharedBrand(id(req)));
  },
};
