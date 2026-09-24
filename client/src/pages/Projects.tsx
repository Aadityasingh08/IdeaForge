import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import type { ProjectSummary } from '../lib/types';
import { useStore } from '../state/ProjectContext';
import { Logo, Sparkle } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState } from '../components/ui/states';
import { ProjectCard } from '../components/brand/ProjectCard';
import { NewIdeaDialog } from '../components/NewIdea';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { UserMenu } from '../components/UserMenu';

export default function Projects() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<ProjectSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { forgetProject } = useStore();
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setProjects(await api.listProjects());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Your ideas · IdeaForge';
    // Fetching is the external sync this effect exists for; state updates happen after the await.
    void Promise.resolve().then(load);
  }, [load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteProject(toDelete._id);
      forgetProject(toDelete._id);
      setProjects((p) => p?.filter((x) => x._id !== toDelete._id) ?? null);
      toast(`“${toDelete.name}” deleted`);
      setToDelete(null);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Your ideas</h1>
            <p className="mt-2 text-[15px] text-body">Continue building a brand from where you left off.</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setCreating(true)} icon={<Plus className="size-4" />} className="w-full sm:w-auto">
            New Idea
          </Button>
        </div>

        {error && !projects && (
          <ErrorState
            error={error}
            onRetry={() => {
              setLoading(true);
              setError(null);
              load();
            }}
            retrying={loading}
          />
        )}

        {!projects && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading projects" role="status">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card space-y-4 p-6">
                <div className="skeleton size-11 rounded-2xl" />
                <div className="skeleton h-5 w-1/2" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-4/5" />
              </div>
            ))}
          </div>
        )}

        {projects && projects.length === 0 && (
          <EmptyState
            title="Your next brand starts with an idea."
            description="Describe what you’re building in a sentence. IdeaForge will understand it, challenge it and shape it into a brand."
            action={
              <Button variant="primary" size="lg" onClick={() => setCreating(true)}>
                Start building →
              </Button>
            }
          />
        )}

        {projects && projects.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <li key={p._id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <ProjectCard project={p} onDelete={setToDelete} />
              </li>
            ))}
            <li>
              <button
                onClick={() => setCreating(true)}
                className="group flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line text-body transition-colors hover:border-mint hover:bg-white hover:text-mint-dark"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-soft transition-transform group-hover:rotate-45">
                  <Sparkle className="size-5" />
                </span>
                <span className="text-sm font-semibold">New idea</span>
              </button>
            </li>
          </ul>
        )}
      </main>

      <NewIdeaDialog open={creating} onClose={() => setCreating(false)} />

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this project?" description="This permanently removes the project, its Brand DNA and AI history." size="sm">
        <p className="rounded-xl bg-[#f8fafc] p-3 text-sm font-semibold text-ink">{toDelete?.name}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            Delete project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
