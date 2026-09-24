import { Check } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Sparkle } from '../ui/Logo';

/**
 * Live strategy build: each section is generated in turn and its headline result
 * appears as soon as it is saved — real progress, not a timed animation.
 */
export function StrategyProgress({ dna }: { dna: BrandDNA }) {
  const steps = [
    { label: 'Positioning', working: 'Finding your differentiation…', result: dna.positioning?.statement },
    { label: 'Personality', working: 'Defining your personality…', result: dna.personality?.traits.map((t) => t.name).join(' · ') },
    { label: 'Naming territories', working: 'Exploring naming territories…', result: dna.naming?.territories.map((t) => t.name).join(' · ') },
    { label: 'Messaging', working: 'Writing your messaging…', result: dna.messaging ? `“${dna.messaging.tagline}”` : undefined },
  ];
  const current = steps.findIndex((s) => !s.result);
  const done = steps.filter((s) => s.result).length;

  return (
    <div className="card relative animate-fade-in overflow-hidden p-6 sm:p-8" role="status" aria-live="polite">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <Sparkle className="size-8" animated />
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">Let’s find the strategic opportunity.</p>
            <p className="text-sm text-mint-dark">{current >= 0 ? steps[current].working : 'Finishing up…'}</p>
          </div>
        </div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#eef2f6]" aria-hidden>
          <div className="h-full rounded-full bg-gradient-to-r from-mint to-aqua transition-all duration-500" style={{ width: `${Math.max(6, (done / steps.length) * 100)}%` }} />
        </div>
        <ol className="space-y-3">
          {steps.map((s, i) => {
            const state = s.result ? 'done' : i === current ? 'working' : 'waiting';
            return (
              <li key={s.label} className={`flex gap-3 rounded-2xl p-3 transition-colors ${state === 'working' ? 'bg-mint-50/70' : ''}`}>
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                    state === 'done' ? 'bg-mint text-white' : state === 'working' ? 'bg-white ring-2 ring-mint-light' : 'bg-[#f1f5f9]'
                  }`}
                  aria-hidden
                >
                  {state === 'done' ? <Check className="size-3.5" /> : state === 'working' ? <Sparkle className="size-3.5" animated /> : null}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${state === 'waiting' ? 'text-muted' : 'text-ink'}`}>
                    {s.label}
                    <span className="sr-only"> — {state}</span>
                  </p>
                  {s.result ? (
                    <p className="mt-0.5 animate-slide-up text-sm leading-relaxed text-body">{s.result}</p>
                  ) : state === 'working' ? (
                    <div className="mt-2 space-y-1.5" aria-hidden>
                      <div className="skeleton h-2.5 w-11/12" />
                      <div className="skeleton h-2.5 w-7/12" />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
