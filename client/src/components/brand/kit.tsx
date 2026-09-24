import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronDown, Download, FileJson, FileText, XCircle } from 'lucide-react';
import type { CheckStatus, Consistency, Project } from '../../lib/types';
import { downloadJSON, downloadMarkdown } from '../../lib/export';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export function StatusIcon({ status, className = 'size-4' }: { status: CheckStatus; className?: string }) {
  if (status === 'pass')
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#d1fae5] text-[#047857]">
        <Check className={className} aria-label="Pass" />
      </span>
    );
  if (status === 'warning')
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fef3c7] text-[#b45309]">
        <AlertTriangle className={className} aria-label="Warning" />
      </span>
    );
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fee2e2] text-[#b91c1c]">
      <XCircle className={className} aria-label="Fail" />
    </span>
  );
}

export function BrandSection({ id, eyebrow, title, children, action }: { id: string; eyebrow: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1.5 !text-mint-dark">{eyebrow}</p>
          <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight text-ink">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Brand health — every line comes from checks the Consistency Guardian actually ran. No invented scores. */
export function BrandHealthCheck({ consistency }: { consistency: Consistency }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">Brand Health</h3>
        <span className={`text-xs font-semibold ${consistency.consistent ? 'text-[#047857]' : 'text-[#b45309]'}`}>
          {consistency.consistent ? 'Coherent brand' : 'Needs attention'}
        </span>
      </div>
      <ul className="space-y-3">
        {consistency.health.map((h) => (
          <li key={h.label} className="flex items-start gap-3">
            <StatusIcon status={h.status} className="size-3.5" />
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium text-ink">{h.label}</p>
              {h.note && h.status !== 'pass' && <p className="mt-0.5 text-[13px] leading-snug text-body">{h.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConsistencyReport({ consistency, onReview }: { consistency: Consistency; onReview: () => void }) {
  return (
    <div className="card divide-y divide-line">
      {consistency.checks.map((c) => (
        <div key={c.area} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
          <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
            <StatusIcon status={c.status} className="size-3.5" />
            <span className="text-sm font-semibold text-ink">{c.area}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-body">{c.explanation}</p>
            {c.status !== 'pass' && c.recommendation && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium text-[#b45309]">{c.recommendation}</p>
                <Button size="sm" variant="ghost" onClick={onReview}>
                  Review recommendation →
                </Button>
              </div>
            )}
          </div>
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wider ${
              c.status === 'pass' ? 'bg-[#ecfdf5] text-[#047857]' : c.status === 'warning' ? 'bg-[#fffbeb] text-[#b45309]' : 'bg-[#fef2f2] text-[#b91c1c]'
            }`}
          >
            {c.status.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Download Brand Kit — Markdown and JSON, both generated from the final BrandDNA. */
export function DownloadMenu({ project, variant = 'primary' }: { project: Project; variant?: 'primary' | 'mint' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (kind: 'md' | 'json') => {
    if (kind === 'md') downloadMarkdown(project);
    else downloadJSON(project);
    toast(kind === 'md' ? 'IdeaForge-Brand-Kit.md downloaded' : 'IdeaForge-Brand-Kit.json downloaded');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant={variant}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        icon={<Download className="size-4" />}
        iconRight={<ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />}
      >
        Download Brand Kit
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-64 text-left animate-scale-in rounded-2xl border border-line bg-white p-1.5 shadow-lift">
          <button role="menuitem" onClick={() => pick('md')} className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-[#f1f7f8]">
            <FileText className="mt-0.5 size-4 text-mint-dark" aria-hidden />
            <span>
              <span className="block text-sm font-semibold text-ink">Markdown brand kit</span>
              <span className="block text-xs text-muted">IdeaForge-Brand-Kit.md</span>
            </span>
          </button>
          <button role="menuitem" onClick={() => pick('json')} className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-[#f1f7f8]">
            <FileJson className="mt-0.5 size-4 text-ice" aria-hidden />
            <span>
              <span className="block text-sm font-semibold text-ink">Structured BrandDNA</span>
              <span className="block text-xs text-muted">IdeaForge-Brand-Kit.json</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
