import { useState } from 'react';
import { ExternalLink, Globe, Lock, Share2 } from 'lucide-react';
import type { Project } from '../../lib/types';
import { useWorkspace } from '../../state/ProjectContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CopyButton } from '../ui/CopyButton';
import { useToast } from '../ui/Toast';

/** Toggle a public, read-only brand page and copy its link. */
export function ShareDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const { patch, isPending } = useWorkspace(project._id);
  const toast = useToast();
  const url = `${window.location.origin}/b/${project._id}`;
  const shared = !!project.shared;

  const toggle = async () => {
    const res = await patch({ shared: !shared });
    if (res) toast(shared ? 'Brand page is now private' : 'Public brand page is live');
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} icon={<Share2 className="size-4" />}>
        Share
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Share your brand" description="Publish a read-only brand page anyone with the link can view. Your workspace stays private.">
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4">
          <div className="flex gap-3">
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${shared ? 'bg-mint-50 text-mint-dark' : 'bg-[#f1f5f9] text-muted'}`}>
              {shared ? <Globe className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{shared ? 'Public brand page' : 'Private'}</p>
              <p className="text-[13px] text-body">{shared ? 'Anyone with the link can view the brand kit.' : 'Only this browser can see this brand.'}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={shared}
            aria-label="Public brand page"
            onClick={toggle}
            disabled={isPending('patch')}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${shared ? 'bg-mint' : 'bg-[#cbd5e1]'}`}
          >
            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${shared ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {shared && (
          <div className="mt-4 animate-fade-in">
            <label htmlFor="share-url" className="eyebrow mb-1.5 block">
              Public link
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-[#f8fafc] p-1.5 pl-3">
              <input id="share-url" readOnly value={url} className="min-w-0 flex-1 bg-transparent text-sm text-ink focus:outline-none" onFocus={(e) => e.target.select()} />
              <CopyButton text={url} label="Copy public link" showLabel />
              <a href={url} target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white hover:text-ink" aria-label="Open public page">
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
