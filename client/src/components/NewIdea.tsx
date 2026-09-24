import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../state/ProjectContext';
import { useAuth } from '../state/AuthContext';
import { Modal } from './ui/Modal';
import { Textarea } from './ui/primitives';
import { Button } from './ui/Button';

const PENDING_KEY = 'ideaforge.pendingIdea';

/** An idea typed before signing in, kept until the account exists. */
export function takePendingIdea(): string | null {
  try {
    const idea = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return idea;
  } catch {
    return null;
  }
}

export function validateIdea(idea: string): string | null {
  const text = idea.trim();
  if (!text) return 'Tell us a little about your idea first.';
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (text.length < 12 || words.length < 3) return 'Tell us a little more — a sentence or two is perfect.';
  return null;
}

/** Validates, creates the project on the backend, then opens the workspace where analysis starts. */
export function useCreateProject() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProject } = useStore();
  const { status } = useAuth();
  const navigate = useNavigate();

  const create = async (idea: string) => {
    const invalid = validateIdea(idea);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (status !== 'signed-in') {
      // Keep the idea and continue it right after sign-up.
      try {
        sessionStorage.setItem(PENDING_KEY, idea.trim());
      } catch {
        /* storage unavailable — the user can retype it */
      }
      navigate('/signup?next=/new-idea');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const project = await api.createProject(idea.trim());
      setProject(project);
      navigate(`/workspace/${project._id}/understand`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error, setError };
}

export function NewIdeaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [idea, setIdea] = useState('');
  const { create, creating, error, setError } = useCreateProject();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create(idea);
  };

  return (
    <Modal open={open} onClose={onClose} title="What are you building?" description="Don’t worry about getting it right. IdeaForge will help shape it.">
      <form onSubmit={submit} noValidate>
        <Textarea
          label="Describe your idea in your own words."
          rows={5}
          value={idea}
          maxLength={2000}
          onChange={(e) => {
            setIdea(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) create(idea);
          }}
          placeholder="e.g. An app that helps students find teammates for hackathons"
          error={error ?? undefined}
        />
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={creating} iconRight={<ArrowRight className="size-4" />}>
            Start building
          </Button>
        </div>
      </form>
    </Modal>
  );
}
