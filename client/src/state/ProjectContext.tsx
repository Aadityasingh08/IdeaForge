import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, type Edit } from '../lib/api';
import type { Project } from '../lib/types';

interface ProjectStore {
  projects: Record<string, Project>;
  loadErrors: Record<string, Error | undefined>;
  pending: Record<string, boolean>;
  errors: Record<string, Error | undefined>;
  aiMode: 'connected' | 'demo' | null;
  setProject: (p: Project) => void;
  forgetProject: (id: string) => void;
  loadProject: (id: string, force?: boolean) => Promise<Project | undefined>;
  runOp: <T>(projectId: string, op: string, fn: () => Promise<T>, pick?: (result: T) => Project) => Promise<T | undefined>;
  clearError: (projectId: string, op: string) => void;
}

const Ctx = createContext<ProjectStore | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, Error | undefined>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | undefined>>({});
  const [aiMode, setAiMode] = useState<'connected' | 'demo' | null>(null);
  // Synchronous in-flight guard so the same AI operation never runs twice (e.g. StrictMode effects).
  const inflight = useRef(new Set<string>());
  const loading = useRef(new Map<string, Promise<Project | undefined>>());

  useEffect(() => {
    api.health().then((h) => setAiMode(h.ai), () => setAiMode(null));
  }, []);

  const setProject = useCallback((p: Project) => setProjects((prev) => ({ ...prev, [p._id]: p })), []);

  const forgetProject = useCallback((id: string) => {
    setProjects((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const loadProject = useCallback(
    (id: string, force = false) => {
      const existing = loading.current.get(id);
      if (existing && !force) return existing;
      const promise = api
        .getProject(id)
        .then((p) => {
          setProject(p);
          setLoadErrors((prev) => ({ ...prev, [id]: undefined }));
          return p;
        })
        .catch((err: Error) => {
          setLoadErrors((prev) => ({ ...prev, [id]: err }));
          loading.current.delete(id);
          return undefined;
        });
      loading.current.set(id, promise);
      return promise;
    },
    [setProject],
  );

  const runOp = useCallback(
    async <T,>(projectId: string, op: string, fn: () => Promise<T>, pick?: (result: T) => Project) => {
      const key = `${projectId}:${op}`;
      if (inflight.current.has(key)) return undefined;
      inflight.current.add(key);
      setPending((p) => ({ ...p, [key]: true }));
      setErrors((e) => ({ ...e, [key]: undefined }));
      try {
        const result = await fn();
        const project = pick ? pick(result) : (result as unknown as Project);
        if (project && (project as Project)._id) setProject(project);
        return result;
      } catch (err) {
        setErrors((e) => ({ ...e, [key]: err as Error }));
        return undefined;
      } finally {
        inflight.current.delete(key);
        setPending((p) => ({ ...p, [key]: false }));
      }
    },
    [setProject],
  );

  const clearError = useCallback((projectId: string, op: string) => {
    setErrors((e) => ({ ...e, [`${projectId}:${op}`]: undefined }));
  }, []);

  const value = useMemo(
    () => ({ projects, loadErrors, pending, errors, aiMode, setProject, forgetProject, loadProject, runOp, clearError }),
    [projects, loadErrors, pending, errors, aiMode, setProject, forgetProject, loadProject, runOp, clearError],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within ProjectProvider');
  return ctx;
}

/** Everything a workspace page needs for one project. Cached — never refetches needlessly. */
export function useWorkspace(id: string) {
  const store = useStore();
  const project = store.projects[id];

  useEffect(() => {
    if (!project) store.loadProject(id);
  }, [id, project, store]);

  const isPending = (op: string) => !!store.pending[`${id}:${op}`];
  const errorFor = (op: string) => store.errors[`${id}:${op}`];

  return {
    project,
    loadError: store.loadErrors[id],
    reload: () => store.loadProject(id, true),
    isPending,
    anyPending: (ops: string[]) => ops.some(isPending),
    errorFor,
    clearError: (op: string) => store.clearError(id, op),
    run: <T,>(op: string, fn: () => Promise<T>, pick?: (r: T) => Project) => store.runOp(id, op, fn, pick),
    patch: (body: { name?: string; edits?: Edit[]; accept?: string[] }) => store.runOp(id, 'patch', () => api.patchProject(id, body)),
  };
}
