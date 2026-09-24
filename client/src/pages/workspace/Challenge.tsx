import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, ShieldCheck, Swords } from 'lucide-react';
import { api } from '../../lib/api';
import type { Alternative, ChallengeTarget } from '../../lib/types';
import { getPath } from '../../lib/format';
import { SectionHeading, Badge } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states';
import { AIChallengeCard, RecommendationCard } from '../../components/brand/challenge';
import { Sparkle } from '../../components/ui/Logo';
import { useToast } from '../../components/ui/Toast';
import { StageFooter, useAutoRun, useCurrentWorkspace } from './shared';

export default function Challenge() {
  const { projectId, project, run, isPending, errorFor, clearError } = useCurrentWorkspace();
  const [params] = useSearchParams();
  const toast = useToast();
  const [directionAlts, setDirectionAlts] = useState<Alternative[] | undefined>();
  const [altFor, setAltFor] = useState<string | null>(null);

  const runChallenge = useCallback(() => {
    setDirectionAlts(undefined);
    return run('challenge', () => api.challenge(projectId));
  }, [projectId, run]);

  const dna = project?.brandDNA;
  const summary = dna?.challengeSummary;
  const ready = !!(dna?.positioning && dna?.messaging);
  const pending = isPending('challenge');
  const error = errorFor('challenge');

  useAutoRun(!!project && ready && !summary && params.get('run') === '1' && !pending && !error, runChallenge);

  if (!project || !dna) return null;

  const busy = isPending('apply');
  const applyError = errorFor('apply');
  const current = (target: ChallengeTarget) => (target === 'general' ? '' : String(getPath(dna, target) ?? ''));

  const accept = (challengeId: string | undefined, target: ChallengeTarget, value: string, source: 'issue' | 'direction' | 'alternative') =>
    run('apply', () => api.acceptImprovement(projectId, { challengeId, source, target, value })).then((r) => r && toast('Improvement applied — Brand DNA updated'));

  const keep = (challengeId: string) =>
    run('apply', () => api.keepOriginal(projectId, challengeId)).then((r) => r && toast('Kept your original', 'info'));

  const alternatives = async (challengeId: string) => {
    setAltFor(challengeId);
    const res = await run(`alts:${challengeId}`, () => api.alternatives(projectId, challengeId), (r) => r.project);
    if (res && challengeId === 'direction') setDirectionAlts(res.alternatives);
    setAltFor(null);
  };

  const open = dna.challenges.filter((c) => !c.resolved);
  const resolved = dna.challenges.filter((c) => c.resolved);
  const altError = altFor ? undefined : dna.challenges.map((c) => errorFor(`alts:${c.id}`)).find(Boolean) ?? errorFor('alts:direction');

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 03 · Challenge"
        title="Challenge your brand"
        subtitle="A critical AI reviewer stress-tests your strategy for generic language, weak differentiation and inconsistencies — and only flags issues it can back with evidence."
        actions={
          summary && !pending ? (
            <Button size="sm" onClick={runChallenge} icon={<RefreshCw className="size-3.5" />}>
              Re-run challenge
            </Button>
          ) : undefined
        }
      />

      {pending && <LoadingState op="challenge" title="Wait — let’s check if any decision is generic." />}

      {!pending && error && (
        <div className="mb-6">
          <ErrorState
            error={error}
            title="AI couldn’t complete the challenge."
            onRetry={runChallenge}
            onContinue={summary ? () => clearError('challenge') : undefined}
          />
        </div>
      )}

      {!pending && !summary && !error && (
        <EmptyState
          icon={<Swords className="size-7 text-mint-dark" />}
          title="Your brand hasn’t been challenged yet."
          description={
            ready
              ? 'An AI reviewer will look for generic thinking, weak differentiation and inconsistencies — with evidence for every issue.'
              : 'Build your strategy first — then the reviewer has something to stress-test.'
          }
          action={
            <Button variant="primary" size="lg" onClick={runChallenge} disabled={!ready}>
              Run AI Challenge →
            </Button>
          }
        />
      )}

      {!pending && summary && (
        <div className="space-y-6">
          {(applyError || altError) && (
            <ErrorState
              error={(applyError || altError)!}
              onRetry={undefined}
              onContinue={() => {
                clearError('apply');
                dna.challenges.forEach((c) => clearError(`alts:${c.id}`));
                clearError('alts:direction');
              }}
              continueLabel="Dismiss"
            />
          )}

          <section className="card flex animate-slide-up flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink">
              <Sparkle className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-ink">Reviewer’s assessment</h2>
                {open.length > 0 ? (
                  <Badge tone="warning">{open.length} to review</Badge>
                ) : (
                  <Badge tone="success">All decisions resolved</Badge>
                )}
                {resolved.length > 0 && <Badge>{resolved.length} resolved</Badge>}
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed text-body">{summary.overallAssessment}</p>
            </div>
          </section>

          {summary.recommendedDirection && (
            <RecommendationCard
              direction={summary.recommendedDirection}
              currentValue={current(summary.recommendedDirection.target)}
              onAccept={(value, source) => accept(undefined, summary.recommendedDirection!.target, value, source)}
              onKeep={() => keep('direction')}
              onAlternatives={() => alternatives('direction')}
              alternatives={directionAlts}
              busy={busy}
              alternativesLoading={isPending('alts:direction')}
            />
          )}

          {open.length > 0 && (
            <section aria-labelledby="open-issues">
              <h2 id="open-issues" className="mb-3 text-sm font-semibold text-ink">
                Issues found
              </h2>
              <div className="space-y-4">
                {open.map((item) => (
                  <AIChallengeCard
                    key={item.id}
                    item={item}
                    currentValue={current(item.target)}
                    onAccept={(value, source) => accept(item.id, item.target, value, source)}
                    onKeep={() => keep(item.id)}
                    onAlternatives={() => alternatives(item.id)}
                    busy={busy}
                    alternativesLoading={isPending(`alts:${item.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {dna.challenges.length === 0 && (
            <div className="card flex items-start gap-4 border-[#a7f3d0] bg-[#f0fdf9] p-5 sm:p-6">
              <ShieldCheck className="size-6 shrink-0 text-success" aria-hidden />
              <div>
                <p className="font-semibold text-ink">Your strategy holds up.</p>
                <p className="mt-1 text-sm text-body">The reviewer found no evidence-based weaknesses worth changing. That’s a good sign — move on with confidence.</p>
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <section aria-labelledby="resolved-issues">
              <h2 id="resolved-issues" className="mb-3 text-sm font-semibold text-ink">
                Your decisions
              </h2>
              <div className="space-y-3">
                {resolved.map((item) => (
                  <AIChallengeCard
                    key={item.id}
                    item={item}
                    currentValue={current(item.target)}
                    onAccept={() => undefined}
                    onKeep={() => undefined}
                    onAlternatives={() => undefined}
                  />
                ))}
              </div>
            </section>
          )}

          <StageFooter
            label="Build visual identity"
            to={`/workspace/${projectId}/visual?run=1`}
            hint={open.length ? `${open.length} open issue${open.length > 1 ? 's' : ''} — you can still continue.` : 'Here’s how we improved it. Now let’s make it visual.'}
          />
        </div>
      )}
    </div>
  );
}
