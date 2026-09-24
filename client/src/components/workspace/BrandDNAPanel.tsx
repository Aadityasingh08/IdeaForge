import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import type { AIRunSummary, Project } from '../../lib/types';
import { Sparkle } from '../ui/Logo';

const TASK_LABEL: Record<string, string> = {
  understand: 'Understand',
  positioning: 'Positioning',
  personality: 'Personality',
  naming: 'Naming',
  messaging: 'Messaging',
  challenge: 'Challenge',
  alternatives: 'Alternatives',
  'apply-improvement': 'Improvement applied',
  'keep-original': 'Kept original',
  visual: 'Visual identity',
  'visual-check': 'Visual check',
  'brand-kit': 'Brand kit',
  consistency: 'Consistency',
};

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="eyebrow mb-0.5">{label}</dt>
      <dd className="text-[13px] leading-snug text-ink">{value}</dd>
    </div>
  );
}

/** Contextual side panel: the live BrandDNA every AI stage is building on, plus AI history. */
export function BrandDNAPanel({ project }: { project: Project }) {
  const d = project.brandDNA;
  const [runs, setRuns] = useState<AIRunSummary[]>([]);

  useEffect(() => {
    let alive = true;
    api.listRuns(project._id).then((r) => alive && setRuns(r), () => undefined);
    return () => {
      alive = false;
    };
  }, [project._id, project.updatedAt]);

  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkle className="size-4" /> Brand DNA
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">What the AI knows so far. Every stage builds on this.</p>
      </div>

      <dl className="space-y-3.5">
        <Row label="Idea" value={d.idea.rawIdea} />
        <Row label="Audience" value={d.positioning?.audience ?? d.idea.targetAudience?.primary} />
        <Row label="Value proposition" value={d.positioning?.valueProposition} />
        <Row label="Name" value={d.naming?.selectedName} />
        <Row label="Tagline" value={d.messaging?.tagline} />
        {d.personality && (
          <div>
            <dt className="eyebrow mb-1.5">Personality</dt>
            <dd className="flex flex-wrap gap-1">
              {d.personality.traits.map((t) => (
                <span key={t.name} className="rounded-full bg-mint-50 px-2 py-0.5 text-[11px] font-semibold text-mint-dark">
                  {t.name}
                </span>
              ))}
            </dd>
          </div>
        )}
        {d.visual && (
          <div>
            <dt className="eyebrow mb-1.5">Palette</dt>
            <dd className="flex gap-1">
              {d.visual.colors.map((c) => (
                <span key={c.hex + c.name} className="size-6 rounded-md ring-1 ring-inset ring-black/5" style={{ backgroundColor: c.hex }} title={`${c.name} ${c.hex}`} />
              ))}
            </dd>
          </div>
        )}
        {(d.decisions.edited.length > 0 || d.decisions.accepted.length > 0) && (
          <div>
            <dt className="eyebrow mb-0.5">Your decisions</dt>
            <dd className="text-[13px] text-body">
              {d.decisions.accepted.length} accepted · {d.decisions.edited.length} edited
            </dd>
          </div>
        )}
      </dl>

      {runs.length > 0 && (
        <div>
          <p className="eyebrow mb-2">AI history</p>
          <ol className="space-y-1.5">
            {runs.slice(0, 10).map((r) => (
              <li key={r._id} className="flex items-center gap-2 text-xs">
                {r.status === 'failed' ? (
                  <XCircle className="size-3.5 shrink-0 text-danger" aria-label="Failed" />
                ) : (
                  <CheckCircle2 className="size-3.5 shrink-0 text-mint" aria-label="Success" />
                )}
                <span className="flex-1 truncate text-body">{TASK_LABEL[r.task] ?? r.task}</span>
                {r.provider !== 'user' && r.duration != null && <span className="tabular-nums text-muted">{(r.duration / 1000).toFixed(1)}s</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
