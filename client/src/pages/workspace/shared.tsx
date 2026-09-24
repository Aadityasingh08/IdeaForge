import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWorkspace } from '../../state/ProjectContext';
import { Button } from '../../components/ui/Button';

export function useCurrentWorkspace() {
  const { projectId = '' } = useParams();
  return { projectId, ...useWorkspace(projectId) };
}

/** Runs an AI stage once when its data is missing — never regenerates existing work automatically. */
export function useAutoRun(shouldRun: boolean, run: () => void) {
  const started = useRef(false);
  useEffect(() => {
    if (shouldRun && !started.current) {
      started.current = true;
      run();
    }
  }, [shouldRun, run]);
}

export function StageFooter({
  label,
  to,
  onClick,
  hint,
  disabled,
  loading,
}: {
  label: string;
  to?: string;
  onClick?: () => void;
  hint?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="mt-10 flex flex-col items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-body">{hint}</div>
      <Button
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
        disabled={disabled}
        loading={loading}
        onClick={() => (onClick ? onClick() : to && navigate(to))}
        iconRight={<ArrowRight className="size-4" />}
      >
        {label}
      </Button>
    </div>
  );
}
