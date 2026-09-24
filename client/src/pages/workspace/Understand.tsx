import { useCallback, useState } from 'react';
import { AlertCircle, HelpCircle, Lightbulb, Pencil, RefreshCw, Target, TrendingUp, Users, Heart } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Badge } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/states';
import { AIInsightCard, EditableField } from '../../components/brand/ai';
import { Sparkle } from '../../components/ui/Logo';
import { useToast } from '../../components/ui/Toast';
import { StageFooter, useAutoRun, useCurrentWorkspace } from './shared';
import { validateIdea } from '../../components/NewIdea';

export default function Understand() {
  const { projectId, project, run, isPending, errorFor, clearError, patch } = useCurrentWorkspace();
  const toast = useToast();
  const [editingIdea, setEditingIdea] = useState(false);
  const [ideaDraft, setIdeaDraft] = useState('');
  const [ideaError, setIdeaError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  const analyze = useCallback(
    (rawIdea?: string) => run('understand', () => api.understand(projectId, rawIdea)),
    [projectId, run],
  );

  const idea = project?.brandDNA.idea;
  const analyzed = !!idea?.problem;
  const pending = isPending('understand');
  const error = errorFor('understand');

  useAutoRun(!!project && !analyzed && !pending && !error && !manual, () => analyze());

  if (!project || !idea) return null;
  const edited = (p: string) => project.brandDNA.decisions.edited.includes(p);
  const save = (path: string) => async (value: string | string[]) => {
    const res = await patch({ edits: [{ path, value }] });
    if (res) toast('Saved — AI will build on your edit');
  };

  const submitIdea = async () => {
    const invalid = validateIdea(ideaDraft);
    if (invalid) return setIdeaError(invalid);
    setEditingIdea(false);
    await analyze(ideaDraft.trim());
  };

  const showResults = analyzed || manual;

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 01 · Understand"
        title="Understanding your idea"
        subtitle="We analyze your idea to identify the problem, audience, opportunities and key insights."
      />

      {/* Original idea */}
      <section className="card relative mb-6 overflow-hidden p-5 sm:p-6" aria-labelledby="idea-label">
        <div className="hero-gradient absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p id="idea-label" className="eyebrow">
              Your idea
            </p>
            {!editingIdea && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIdeaDraft(project.rawIdea);
                  setIdeaError(null);
                  setEditingIdea(true);
                }}
                disabled={pending}
                icon={<Pencil className="size-3.5" />}
              >
                Edit
              </Button>
            )}
          </div>
          {editingIdea ? (
            <div className="animate-fade-in">
              <label htmlFor="edit-idea" className="sr-only">
                Edit your idea
              </label>
              <textarea
                id="edit-idea"
                autoFocus
                rows={3}
                maxLength={2000}
                value={ideaDraft}
                onChange={(e) => {
                  setIdeaDraft(e.target.value);
                  setIdeaError(null);
                }}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-3 text-[17px] leading-relaxed text-ink focus:outline-none focus:ring-4 focus:ring-[rgb(20_184_166/0.12)]"
              />
              {ideaError && (
                <p className="mt-1.5 text-[13px] font-medium text-danger" role="alert">
                  {ideaError}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={submitIdea} icon={<RefreshCw className="size-3.5" />}>
                  Re-analyze idea
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingIdea(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-lg font-medium leading-relaxed text-ink sm:text-xl">“{project.rawIdea}”</p>
          )}
        </div>
      </section>

      {pending && <LoadingState op="understand" title="Let’s understand it." />}

      {!pending && error && (
        <div className="mb-6">
          <ErrorState
            error={error}
            title="Something went wrong while analyzing your idea."
            onRetry={() => analyze()}
            onContinue={() => {
              clearError('understand');
              setManual(true);
            }}
            continueLabel="Continue manually"
          />
        </div>
      )}

      {!pending && showResults && (
        <>
          {analyzed && (
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-mint-dark">
              <Sparkle className="size-4" /> Here’s what we found in your idea. Edit anything that doesn’t feel right.
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <AIInsightCard icon={<AlertCircle className="size-4" />} title="Problem" className="md:col-span-2" accent delay={0}>
              <EditableField label="Problem" value={idea.problem ?? ''} onSave={save('idea.problem')} edited={edited('idea.problem')} display={idea.problem || <Placeholder />} />
            </AIInsightCard>

            <AIInsightCard icon={<Users className="size-4" />} title="Target audience" delay={60}>
              <EditableField
                label="Primary audience"
                value={idea.targetAudience?.primary ?? ''}
                onSave={save('idea.targetAudience.primary')}
                edited={edited('idea.targetAudience.primary')}
                display={
                  <>
                    <p className="font-semibold text-ink">{idea.targetAudience?.primary || <Placeholder />}</p>
                    {idea.targetAudience?.secondary && <p className="mt-1 text-sm">Also: {idea.targetAudience.secondary}</p>}
                  </>
                }
              />
            </AIInsightCard>

            <AIInsightCard icon={<Heart className="size-4" />} title="User need" delay={120}>
              <EditableField label="User need" value={idea.userNeed ?? ''} onSave={save('idea.userNeed')} edited={edited('idea.userNeed')} display={idea.userNeed || <Placeholder />} />
            </AIInsightCard>

            <AIInsightCard icon={<TrendingUp className="size-4" />} title="Opportunity" className="md:col-span-2" delay={180}>
              <EditableField label="Opportunity" value={idea.opportunity ?? ''} onSave={save('idea.opportunity')} edited={edited('idea.opportunity')} display={idea.opportunity || <Placeholder />} />
              {idea.context && <p className="mt-3 border-t border-line pt-3 text-sm text-muted">Context: {idea.context}</p>}
            </AIInsightCard>

            <AIInsightCard icon={<Lightbulb className="size-4" />} title="Key insights" delay={240}>
              <EditableField
                label="Key insights"
                value={idea.keyInsights ?? []}
                onSave={save('idea.keyInsights')}
                edited={edited('idea.keyInsights')}
                display={<BulletList items={idea.keyInsights} />}
              />
            </AIInsightCard>

            <AIInsightCard icon={<HelpCircle className="size-4" />} title="Open questions" delay={300}>
              <EditableField
                label="Open questions"
                value={idea.openQuestions ?? []}
                onSave={save('idea.openQuestions')}
                edited={edited('idea.openQuestions')}
                display={<BulletList items={idea.openQuestions} marker="?" />}
              />
            </AIInsightCard>

            {!!idea.assumptions?.length && (
              <AIInsightCard icon={<Target className="size-4" />} title="Assumptions to validate" className="md:col-span-2" delay={360}>
                <p className="mb-2 text-[13px] text-muted">Things the AI inferred that you didn’t say — worth checking.</p>
                <div className="flex flex-wrap gap-2">
                  {idea.assumptions.map((a) => (
                    <Badge key={a} tone="warning" className="!py-1 !text-xs !font-medium">
                      {a}
                    </Badge>
                  ))}
                </div>
              </AIInsightCard>
            )}
          </div>

          <StageFooter
            label="Continue to Strategy"
            to={`/workspace/${projectId}/strategy`}
            disabled={!analyzed && !idea.problem}
            hint={analyzed ? 'Next: we’ll build positioning, personality, naming and messaging on top of this.' : 'Add the problem to continue.'}
          />
        </>
      )}
    </div>
  );
}

function Placeholder() {
  return <span className="italic text-muted">Not defined yet — click edit to add it.</span>;
}

function BulletList({ items, marker }: { items?: string[]; marker?: string }) {
  if (!items?.length) return <Placeholder />;
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it} className="flex gap-2.5 leading-relaxed">
          {marker ? (
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#eff6ff] text-[11px] font-bold text-ice">{marker}</span>
          ) : (
            <Sparkle className="mt-[6px] size-3 shrink-0" />
          )}
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
