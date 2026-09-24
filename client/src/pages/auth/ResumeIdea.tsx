import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useStore } from '../../state/ProjectContext';
import { takePendingIdea } from '../../components/NewIdea';
import { Sparkle } from '../../components/ui/Logo';

/** /new-idea — creates the project from an idea typed before signing up, then opens it. */
export default function ResumeIdea() {
  const navigate = useNavigate();
  const { setProject } = useStore();
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const idea = takePendingIdea();
    if (!idea) {
      void Promise.resolve().then(() => setDone(true));
      return;
    }
    api.createProject(idea).then(
      (project) => {
        setProject(project);
        navigate(`/workspace/${project._id}/understand`, { replace: true });
      },
      () => setDone(true),
    );
  }, [navigate, setProject]);

  if (done) return <Navigate to="/projects" replace />;
  return (
    <div className="grid min-h-screen place-items-center" role="status">
      <div className="flex flex-col items-center gap-3 text-sm font-medium text-mint-dark">
        <Sparkle className="size-10" animated />
        Opening your idea…
      </div>
    </div>
  );
}
