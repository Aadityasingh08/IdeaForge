import type { AIRunSummary, Alternative, ChallengeTarget, Project, ProjectSummary, StrategySection } from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api';

/** Error returned by the API in the standard { success: false, error } shape. */
export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
  get isAI() {
    return this.status === 502;
  }
}

/** The backend could not be reached at all. */
export class NetworkError extends Error {
  constructor() {
    super('Can’t connect to IdeaForge right now.');
  }
}

async function request<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    });
  } catch {
    throw new NetworkError();
  }

  let payload: { success: boolean; data?: T; error?: { code: string; message: string } } | null = null;
  try {
    payload = await res.json();
  } catch {
    // Proxy/gateway errors (backend down) come back as non-JSON.
    if (res.status >= 500) throw new NetworkError();
  }
  if (!res.ok || !payload?.success) {
    if (res.status === 502 && !payload) throw new NetworkError();
    throw new ApiError(res.status, payload?.error?.code ?? 'UNKNOWN', payload?.error?.message ?? 'Something went wrong.');
  }
  return payload.data as T;
}

const post = <T>(path: string, json: unknown) => request<T>(path, { method: 'POST', json });

export interface Edit {
  path: string;
  value: unknown;
}

export const api = {
  health: () => request<{ status: string; database: string; ai: 'connected' | 'demo' }>('/health'),

  listProjects: () => request<ProjectSummary[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (rawIdea: string) => post<Project>('/projects', { rawIdea }),
  patchProject: (id: string, body: { name?: string; edits?: Edit[]; accept?: string[] }) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', json: body }),
  deleteProject: (id: string) => request<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  listRuns: (id: string) => request<AIRunSummary[]>(`/projects/${id}/runs`),

  understand: (projectId: string, rawIdea?: string) => post<Project>('/ai/understand', { projectId, rawIdea }),
  strategy: (projectId: string, section?: StrategySection) => post<Project>('/ai/strategy', { projectId, section }),
  challenge: (projectId: string) => post<Project>('/ai/challenge', { projectId }),
  acceptImprovement: (
    projectId: string,
    recommendation: { challengeId?: string; source: 'issue' | 'direction' | 'alternative'; target: ChallengeTarget; value: string },
  ) => post<Project>('/ai/challenge/apply', { action: 'accept', projectId, recommendation }),
  keepOriginal: (projectId: string, challengeId: string) =>
    post<Project>('/ai/challenge/apply', { action: 'keep_original', projectId, challengeId }),
  alternatives: (projectId: string, challengeId: string) =>
    post<{ project: Project; alternatives: Alternative[]; target: ChallengeTarget }>('/ai/challenge/alternatives', {
      projectId,
      challengeId,
    }),
  visual: (projectId: string) => post<Project>('/ai/visual', { projectId }),
  consistency: (projectId: string) => post<Project>('/ai/consistency', { projectId }),
  brandKit: (projectId: string) => post<Project>('/ai/brand-kit', { projectId }),
};
