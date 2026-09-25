import type { AIRunSummary, Alternative, ChallengeTarget, Project, ProjectSummary, SharedBrand, StrategySection, VersionSummary } from './types';
import { ownerId } from './owner';

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, '');
const BASE = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`) : '/api';

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
      credentials: 'include', // send the httpOnly session cookie
      headers: { 'Content-Type': 'application/json', 'X-IdeaForge-Owner': ownerId(), ...(init?.headers ?? {}) },
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    });
  } catch {
    throw new NetworkError();
  }

  let payload: { success: boolean; data?: T; error?: { code: string; message: string } } | null = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  }

  if (res.status === 401 && !path.startsWith('/auth/')) {
    // Session expired or signed out elsewhere — let the app send the user to log in.
    window.dispatchEvent(new Event('ideaforge:unauthorized'));
  }
  if (!res.ok || !payload?.success) {
    if (res.status === 502 && !payload) throw new NetworkError();
    const fallbackMsg = res.status === 409
      ? 'An account with this email already exists. Try logging in.'
      : res.status === 401
      ? 'Invalid email or password. Please try again.'
      : !payload && res.status === 200
      ? 'Unexpected server response. Please try again.'
      : 'Something went wrong. Please try again.';
    throw new ApiError(res.status, payload?.error?.code ?? 'UNKNOWN', payload?.error?.message ?? fallbackMsg);
  }
  return payload.data as T;
}

const post = <T>(path: string, json: unknown) => request<T>(path, { method: 'POST', json });

export interface Edit {
  path: string;
  value: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const authApi = {
  me: () => request<User | null>('/auth/me'),
  signup: (body: { name: string; email: string; password: string; remember?: boolean }) => post<User>('/auth/signup', body),
  login: (body: { email: string; password: string; remember?: boolean }) => post<User>('/auth/login', body),
  logout: () => request<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' }),
  logoutAll: () => request<{ loggedOut: boolean }>('/auth/logout-all', { method: 'POST' }),
  forgotPassword: (email: string) => post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => post<User>('/auth/reset-password', { token, password }),
  updateProfile: (name: string) => request<User>('/auth/me', { method: 'PATCH', json: { name } }),
  changePassword: (current: string, next: string) => post<{ changed: boolean }>('/auth/change-password', { current, next }),
  deleteAccount: (password: string) => request<{ deleted: boolean }>('/auth/me', { method: 'DELETE', json: { password } }),
};

export const api = {
  health: () => request<{ status: string; database: string; ai: 'connected' | 'demo' }>('/health'),

  listProjects: () => request<ProjectSummary[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (rawIdea: string) => post<Project>('/projects', { rawIdea }),
  patchProject: (id: string, body: { name?: string; shared?: boolean; edits?: Edit[]; accept?: string[] }) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', json: body }),
  deleteProject: (id: string) => request<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  listRuns: (id: string) => request<AIRunSummary[]>(`/projects/${id}/runs`),
  listVersions: (id: string) => request<VersionSummary[]>(`/projects/${id}/versions`),
  restoreVersion: (id: string, versionId: string) => request<Project>(`/projects/${id}/versions/${versionId}/restore`, { method: 'POST' }),
  shared: (id: string) => request<SharedBrand>(`/share/${id}`),

  understand: (projectId: string, rawIdea?: string) => post<Project>('/ai/understand', { projectId, rawIdea }),
  strategy: (projectId: string, section?: StrategySection, mode?: 'regenerate' | 'fill') => post<Project>('/ai/strategy', { projectId, section, mode }),
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
