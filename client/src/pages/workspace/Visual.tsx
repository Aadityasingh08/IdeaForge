import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Palette, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Badge, Card } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states';
import { AIReasoning, WhyThis } from '../../components/brand/ai';
import { AbstractArt, ColorPalette, TypographyPreview } from '../../components/brand/identity';
import { useToast } from '../../components/ui/Toast';
import { StageFooter, useAutoRun, useCurrentWorkspace } from './shared';
import { LogoPicker } from '../../components/brand/logos';
import { brandPalette } from '../../lib/palette';
import { visualStaleness } from '../../lib/stale';
import type { LogoConcept } from '../../lib/types';

export default function Visual() {
  const { projectId, project, run, isPending, errorFor, clearError, patch } = useCurrentWorkspace();
  const [params] = useSearchParams();
  const toast = useToast();

  const generate = useCallback(() => run('visual', () => api.visual(projectId)), [projectId, run]);

  const dna = project?.brandDNA;
  const ready = !!(dna?.positioning && dna?.messaging && dna?.personality);
  const pending = isPending('visual');
  const error = errorFor('visual');

  useAutoRun(!!project && ready && !dna?.visual && params.get('run') === '1' && !pending && !error, generate);

  if (!project || !dna) return null;
  const v = dna.visual;
  const hexes = v?.colors.map((c) => c.hex) ?? [];
  const brandName = dna.naming?.selectedName ?? project.name;
  const palette = brandPalette(v);
  const stale = visualStaleness(dna);
  const chooseLogo = (concept: LogoConcept) => patch({ edits: [{ path: 'logo.concept', value: concept }] }).then((r) => r && toast('Logo selected'));

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 04 · Visual"
        title="Visual Identity"
        subtitle="Your strategy, translated into colour, typography, imagery and composition — every choice traceable to your personality and positioning."
        actions={
          v && !pending ? (
            <Button size="sm" onClick={() => generate()?.then((r) => r && toast('New visual direction created'))} icon={<RefreshCw className="size-3.5" />}>
              Regenerate
            </Button>
          ) : undefined
        }
      />

      {pending && <LoadingState op="visual" title="Now let’s make the visual identity." />}

      {!pending && error && (
        <div className="mb-6">
          <ErrorState error={error} title="AI couldn’t complete this step." onRetry={generate} onContinue={v ? () => clearError('visual') : undefined} />
        </div>
      )}

      {!pending && !v && !error && (
        <EmptyState
          icon={<Palette className="size-7 text-mint-dark" />}
          title="Your visual identity is waiting to be shaped."
          description={ready ? 'We’ll translate your positioning and personality into a palette, typography and visual language.' : 'Finish your strategy first.'}
          action={
            <Button variant="primary" size="lg" onClick={generate} disabled={!ready}>
              Create Visual Direction →
            </Button>
          }
        />
      )}

      {!pending && v && (
        <div className="space-y-8">
          {stale && (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
              <p className="text-sm text-[#1e3a8a]">
                <span className="font-semibold">Out of date.</span> {stale} Regenerate so your visuals match.
              </p>
              <Button size="sm" onClick={generate} icon={<RefreshCw className="size-3.5" />}>
                Regenerate visuals
              </Button>
            </div>
          )}
          {dna.visualCheck &&
            (dna.visualCheck.consistent ? (
              <div className="flex animate-slide-up items-center gap-3 rounded-2xl border border-[#a7f3d0] bg-[#f0fdf9] px-4 py-3">
                <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden />
                <p className="text-sm text-ink">
                  <span className="font-semibold">Consistency check passed.</span> <span className="text-body">Visuals match your personality, positioning and audience.</span>
                </p>
              </div>
            ) : (
              <div className="animate-slide-up rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#92400e]">
                  <AlertTriangle className="size-4" aria-hidden /> The consistency check found {dna.visualCheck.issues.length} conflict
                  {dna.visualCheck.issues.length > 1 ? 's' : ''}
                </p>
                <ul className="mt-2 space-y-1 pl-6 text-sm text-[#92400e]">
                  {dna.visualCheck.issues.map((i) => (
                    <li key={i} className="list-disc">
                      {i}
                    </li>
                  ))}
                </ul>
                <Button size="sm" className="mt-3" onClick={generate} icon={<RefreshCw className="size-3.5" />}>
                  Regenerate visual direction
                </Button>
              </div>
            ))}

          <section aria-labelledby="palette">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 id="palette" className="text-lg font-semibold text-ink">
                Brand colours
              </h2>
              <span className="text-xs text-muted">Click a colour to copy its HEX</span>
            </div>
            <ColorPalette colors={v.colors} />
            <WhyThis className="mt-2" question="Why this palette?" answer={v.rationale} />
          </section>

          <section aria-labelledby="type">
            <h2 id="type" className="mb-3 text-lg font-semibold text-ink">
              Typography
            </h2>
            <TypographyPreview heading={v.typography.heading} body={v.typography.body} brandName={brandName} line={dna.messaging?.tagline ?? brandName} accent={hexes[0]} />
            <p className="mt-3 text-sm leading-relaxed text-body">{v.typography.rationale}</p>
          </section>

          <section aria-labelledby="logo">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 id="logo" className="text-lg font-semibold text-ink">
                Logo
              </h2>
              <span className="text-xs text-muted">Generated from your name, palette and type</span>
            </div>
            <LogoPicker name={brandName} palette={palette} value={dna.logo?.concept ?? 'monogram'} onChange={chooseLogo} disabled={isPending('patch')} />
          </section>

          <section aria-labelledby="mood">
            <h2 id="mood" className="mb-3 text-lg font-semibold text-ink">
              Visual mood
            </h2>
            <div className="flex flex-wrap gap-2">
              {v.mood.map((m, i) => (
                <span
                  key={m}
                  className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-black/5"
                  style={{ backgroundColor: `${hexes[i % Math.max(1, hexes.length - 1)]}1f`, color: '#0F172A' }}
                >
                  {m}
                </span>
              ))}
            </div>
          </section>

          <section aria-labelledby="style" className="grid gap-4 sm:grid-cols-2">
            <h2 id="style" className="sr-only">
              Imagery and style
            </h2>
            {(
              [
                ['Imagery direction', 'imagery', v.imagery],
                ['Shapes', 'shapes', v.shapes],
                ['Composition', 'composition', v.composition],
                ['Visual principles', 'principles', v.principles],
              ] as const
            ).map(([title, variant, items]) => (
              <Card key={title} className="overflow-hidden p-4">
                <AbstractArt variant={variant} colors={hexes} />
                <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm leading-relaxed text-body">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mint" aria-hidden />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
            <Card className="overflow-hidden p-4 sm:col-span-2">
              <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
                <AbstractArt variant="avoid" colors={hexes} />
                <div>
                  <h3 className="text-sm font-semibold text-ink">Things to avoid</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {v.avoid.map((a) => (
                      <Badge key={a} tone="danger" className="!py-1 !text-xs !font-medium">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <AIReasoning title="How this follows your strategy">{v.rationale}</AIReasoning>

          <StageFooter
            label="Complete brand"
            to={`/workspace/${projectId}/brand-kit?run=1`}
            hint="Finally: we’ll compile your launch-ready brand kit and check it for consistency."
          />
        </div>
      )}
    </div>
  );
}
