import { useCallback, useEffect, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import type { Project, VersionSummary } from '../../lib/types';
import { STAGE_LABEL } from '../../lib/stages';
import { timeAgo } from '../../lib/format';
import { useStore } from '../../state/ProjectContext';
import { Modal } from '../ui/Modal';
import { Button, IconButton } from '../ui/Button';
import { useToast } from '../ui/Toast';

/** Snapshots taken before every change — restore any of them (restoring is itself undoable). */
export function VersionHistory({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const { setProject } = useStore();
  const toast = useToast();

  const load = useCallback(() => {
    api.listVersions(project._id).then(setVersions, (e: Error) => setError(e.message));
  }, [project._id]);

  useEffect(() => {
    if (open) load();
  }, [open, load, project.updatedAt]);

  const restore = async (v: VersionSummary) => {
    setRestoring(v._id);
    try {
      setProject(await api.restoreVersion(project._id, v._id));
      toast('Version restored — you can undo from History');
      setOpen(false);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setRestoring(null);
    }
  };

  return (
    <>
      <IconButton label="Version history" onClick={() => setOpen(true)}>
        <History className="size-[18px]" />
      </IconButton>
      <Modal open={open} onClose={() => setOpen(false)} title="Version history" description="IdeaForge saves a snapshot before every change. Restore any point — nothing is lost.">
        {error && <p className="text-sm text-danger">{error}</p>}
        {!versions && !error && <div className="skeleton h-24 w-full" />}
        {versions?.length === 0 && <p className="rounded-xl bg-[#f8fafc] p-4 text-sm text-body">No snapshots yet. They appear as soon as you change something.</p>}
        {versions && versions.length > 0 && (
          <ol className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {versions.map((v) => (
              <li key={v._id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{v.label}</p>
                  <p className="text-xs text-muted">
                    {timeAgo(v.createdAt)} · {v.name} · {STAGE_LABEL[v.currentStage]}
                  </p>
                </div>
                <Button size="sm" onClick={() => restore(v)} loading={restoring === v._id} disabled={!!restoring} icon={<RotateCcw className="size-3.5" />}>
                  Restore
                </Button>
              </li>
            ))}
          </ol>
        )}
      </Modal>
    </>
  );
}
