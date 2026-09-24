import { useState } from 'react';
import { ArrowRight, Check, CornerDownRight, Pencil, Quote, Shuffle, Undo2 } from 'lucide-react';
import type { Alternative, ChallengeItem, RecommendedDirection, Resolution } from '../../lib/types';
import { ISSUE_LABEL, TARGET_LABEL } from '../../lib/format';
import { Badge } from '../ui/primitives';
import { Button } from '../ui/Button';
import { Sparkle } from '../ui/Logo';
import { LoadingState } from '../ui/states';

const SEVERITY: Record<ChallengeItem['severity'], { tone: 'danger' | 'warning' | 'neutral'; label: string; bar: string }> = {
  high: { tone: 'danger', label: 'High impact', bar: 'bg-danger' },
  medium: { tone: 'warning', label: 'Medium impact', bar: 'bg-warning' },
  low: { tone: 'neutral', label: 'Low impact', bar: 'bg-muted' },
};

export function ResolutionBadge({ resolution }: { resolution?: Resolution }) {
  if (!resolution) return null;
  const map: Record<Resolution, { tone: 'success' | 'neutral' | 'ice'; label: string }> = {
    accepted: { tone: 'success', label: 'Improvement accepted' },
    alternative: { tone: 'success', label: 'Alternative applied' },
    edited: { tone: 'ice', label: 'Edited by you' },
    kept_original: { tone: 'neutral', label: 'Kept original' },
  };
  const m = map[resolution];
  return (
    <Badge tone={m.tone}>
      {resolution === 'kept_original' ? <Undo2 className="size-3" aria-hidden /> : <Check className="size-3" aria-hidden />}
      {m.label}
    </Badge>
  );
}

function BeforeAfter({ before, after, label, resolved = false }: { before: string; after: string; label: string; resolved?: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
      <div className="rounded-xl border border-line bg-[#f8fafc] p-3.5">
        <p className="eyebrow mb-1">{resolved ? 'Before' : `Current ${label.toLowerCase()}`}</p>
        <p className="text-sm leading-relaxed text-body">{before || '—'}</p>
      </div>
      <div className="hidden place-items-center text-mint sm:grid" aria-hidden>
        <ArrowRight className="size-4" />
      </div>
      <div className="rounded-xl border border-[#99f6e4] bg-mint-50/70 p-3.5">
        <p className="eyebrow mb-1 !text-mint-dark">{resolved ? 'Applied' : 'Suggested'}</p>
        <p className="text-sm font-semibold leading-relaxed text-ink">{after}</p>
      </div>
    </div>
  );
}

export function AlternativesList({
  alternatives,
  onUse,
  busy,
}: {
  alternatives: Alternative[];
  onUse: (statement: string) => void;
  busy?: boolean;
}) {
  return (
    <div className="mt-4 space-y-2">
      <p className="eyebrow flex items-center gap-1.5">
        <Shuffle className="size-3" aria-hidden /> Three different directions
      </p>
      <div className="grid gap-2 lg:grid-cols-3">
        {alternatives.map((a, i) => (
          <div key={a.statement} className="card flex animate-slide-up flex-col p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <Badge tone="ice" className="w-fit">
              {a.difference.split(':')[0]}
            </Badge>
            <p className="mt-2.5 text-[15px] font-semibold leading-snug text-ink">{a.statement}</p>
            <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-body">{a.rationale}</p>
            <Button size="sm" className="mt-3 w-full" onClick={() => onUse(a.statement)} disabled={busy}>
              Use this
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ActionProps {
  currentValue: string;
  onAccept: (value: string, source: 'issue' | 'alternative') => void;
  onKeep: () => void;
  onAlternatives: () => void;
  busy?: boolean;
  alternativesLoading?: boolean;
}

/** One evidence-based weakness found by the Challenge engine, with the user in control. */
export function AIChallengeCard({ item, currentValue, onAccept, onKeep, onAlternatives, busy, alternativesLoading }: ActionProps & { item: ChallengeItem }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.suggestedValue);
  const sev = SEVERITY[item.severity];
  const hasField = item.target !== 'general';

  return (
    <article className={`card relative animate-slide-up overflow-hidden ${item.resolved ? 'opacity-90' : ''}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${item.resolved ? 'bg-success' : sev.bar}`} aria-hidden />
      <div className="p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={sev.tone}>{sev.label}</Badge>
          <Badge>{ISSUE_LABEL[item.type] ?? item.type}</Badge>
          {hasField && <span className="text-xs font-medium text-muted">Affects: {TARGET_LABEL[item.target]}</span>}
          <span className="ml-auto">
            <ResolutionBadge resolution={item.resolution} />
          </span>
        </div>

        <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-ink">{item.title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-body">{item.description}</p>

        <div className="mt-4 flex gap-2.5 rounded-xl bg-[#f8fafc] p-3.5">
          <Quote className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div>
            <p className="eyebrow mb-0.5">Evidence</p>
            <p className="text-sm leading-relaxed text-body">{item.evidence}</p>
          </div>
        </div>

        <p className="mt-4 flex gap-2 text-sm leading-relaxed text-ink">
          <CornerDownRight className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
          <span>
            <span className="font-semibold">Recommendation: </span>
            {item.recommendation}
          </span>
        </p>

        {item.resolved ? (
          item.appliedValue &&
          item.resolution !== 'kept_original' && (
            <div className="mt-4">
              <BeforeAfter before={item.originalValue ?? ''} after={item.appliedValue} label={TARGET_LABEL[item.target]} resolved />
            </div>
          )
        ) : (
          <>
            {hasField && item.suggestedValue && (
              <div className="mt-4">
                {editing ? (
                  <div className="animate-fade-in">
                    <label htmlFor={`edit-${item.id}`} className="eyebrow mb-1.5 block !text-mint-dark">
                      Refine the suggestion
                    </label>
                    <textarea
                      id={`edit-${item.id}`}
                      value={draft}
                      rows={2}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-4 focus:ring-[rgb(20_184_166/0.12)]"
                    />
                  </div>
                ) : (
                  <BeforeAfter before={currentValue} after={item.suggestedValue} label={TARGET_LABEL[item.target]} />
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {hasField && item.suggestedValue ? (
                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => onAccept(editing ? draft.trim() : item.suggestedValue, 'issue')}
                  disabled={busy || (editing && !draft.trim())}
                  icon={<Check className="size-3.5" />}
                >
                  Accept improvement
                </Button>
              ) : (
                <Button variant="mint" size="sm" onClick={() => onAccept('', 'issue')} disabled={busy} icon={<Check className="size-3.5" />}>
                  Noted — mark resolved
                </Button>
              )}
              {hasField && item.suggestedValue && (
                <Button size="sm" onClick={() => setEditing((e) => !e)} disabled={busy} icon={<Pencil className="size-3.5" />}>
                  {editing ? 'Show comparison' : 'Edit'}
                </Button>
              )}
              {hasField && (
                <Button size="sm" onClick={onAlternatives} loading={alternativesLoading} disabled={busy} icon={<Shuffle className="size-3.5" />}>
                  Generate alternatives
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={onKeep} disabled={busy} icon={<Undo2 className="size-3.5" />}>
                Keep original
              </Button>
            </div>

            {alternativesLoading && (
              <div className="mt-4">
                <LoadingState op="alternatives" compact />
              </div>
            )}
            {!alternativesLoading && item.alternatives?.length ? (
              <AlternativesList alternatives={item.alternatives} onUse={(s) => onAccept(s, 'alternative')} busy={busy} />
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

/** The single most important improvement the reviewer recommends. */
export function RecommendationCard({
  direction,
  currentValue,
  onAccept,
  onKeep,
  onAlternatives,
  alternatives,
  busy,
  alternativesLoading,
}: Omit<ActionProps, 'onAccept'> & {
  direction: RecommendedDirection;
  onAccept: (value: string, source: 'direction' | 'alternative') => void;
  alternatives?: Alternative[];
}) {
  const resolved = !!direction.resolution;
  return (
    <section className="relative animate-slide-up overflow-hidden rounded-3xl border border-[#99f6e4] bg-white shadow-glow">
      <div className="hero-gradient absolute inset-0 opacity-80" aria-hidden />
      <div className="relative p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            <Sparkle className="size-3" /> Recommended direction
          </span>
          <span className="text-xs font-medium text-body">Improves: {TARGET_LABEL[direction.target]}</span>
          <span className="ml-auto">
            <ResolutionBadge resolution={direction.resolution} />
          </span>
        </div>

        {!resolved && currentValue && (
          <p className="mt-5 text-sm text-body">
            <span className="font-medium text-muted line-through decoration-[#cbd5e1]">{currentValue}</span>
          </p>
        )}
        <p className="mt-2 text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">“{direction.resolution && direction.resolution !== 'kept_original' && direction.appliedValue ? direction.appliedValue : direction.statement}”</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Why it works</p>
            <ul className="space-y-1.5">
              {direction.whyItWorks.map((w) => (
                <li key={w} className="flex gap-2 text-sm leading-relaxed text-body">
                  <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          {direction.improvements.length > 0 && (
            <div>
              <p className="eyebrow mb-2">Improvements</p>
              <div className="flex flex-wrap gap-1.5">
                {direction.improvements.map((i) => (
                  <Badge key={i} tone="mint">
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {!resolved && (
          <>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button variant="primary" onClick={() => onAccept(direction.statement, 'direction')} disabled={busy} icon={<Check className="size-4" />}>
                Accept improvement
              </Button>
              <Button onClick={onAlternatives} loading={alternativesLoading} disabled={busy} icon={<Shuffle className="size-4" />}>
                Generate alternatives
              </Button>
              <Button variant="ghost" onClick={onKeep} disabled={busy} icon={<Undo2 className="size-4" />}>
                Keep original
              </Button>
            </div>
            {alternativesLoading && (
              <div className="mt-4">
                <LoadingState op="alternatives" compact />
              </div>
            )}
            {!alternativesLoading && alternatives?.length ? (
              <AlternativesList alternatives={alternatives} onUse={(s) => onAccept(s, 'alternative')} busy={busy} />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
