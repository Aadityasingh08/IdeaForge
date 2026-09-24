import { useCallback, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, Compass, Gem, MessageSquareQuote, Smile, Tag } from 'lucide-react';
import { api } from '../../lib/api';
import type { Project, StrategySection, Trait } from '../../lib/types';
import { SectionHeading, Badge, Card } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState } from '../../components/ui/states';
import { AIReasoning, DecisionBar, EditableField, WhyThis } from '../../components/brand/ai';
import { BrandTrait } from '../../components/brand/identity';
import { CopyButton } from '../../components/ui/CopyButton';
import { Sparkle } from '../../components/ui/Logo';
import { useToast } from '../../components/ui/Toast';
import { StageFooter, useAutoRun, useCurrentWorkspace } from './shared';

type Tab = 'positioning' | 'value' | 'personality' | 'naming' | 'messaging';

const TABS: { key: Tab; label: string; icon: ReactNode; section: StrategySection }[] = [
  { key: 'positioning', label: 'Positioning', icon: <Compass className="size-4" />, section: 'positioning' },
  { key: 'value', label: 'Value Proposition', icon: <Gem className="size-4" />, section: 'positioning' },
  { key: 'personality', label: 'Personality', icon: <Smile className="size-4" />, section: 'personality' },
  { key: 'naming', label: 'Naming', icon: <Tag className="size-4" />, section: 'naming' },
  { key: 'messaging', label: 'Messaging', icon: <MessageSquareQuote className="size-4" />, section: 'messaging' },
];

export default function Strategy() {
  const ws = useCurrentWorkspace();
  const { projectId, project, run, isPending, errorFor, clearError } = ws;
  const [params, setParams] = useSearchParams();
  const [manual, setManual] = useState(false);
  const tab = (TABS.find((t) => t.key === params.get('tab'))?.key ?? 'positioning') as Tab;

  const build = useCallback(() => run('strategy', () => api.strategy(projectId)), [projectId, run]);

  const dna = project?.brandDNA;
  const hasIdea = !!dna?.idea.problem;
  const hasAny = !!(dna?.positioning || dna?.personality || dna?.naming || dna?.messaging);
  const complete = !!(dna?.positioning && dna?.personality && dna?.naming && dna?.messaging);
  const pending = isPending('strategy');
  const error = errorFor('strategy');

  useAutoRun(!!project && hasIdea && !complete && !pending && !error && !manual, build);

  if (!project || !dna) return null;

  const current = TABS.find((t) => t.key === tab)!;

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 02 · Strategy"
        title="Brand Strategy"
        subtitle="We create a strategic foundation for your brand based on your idea and target audience."
      />

      {pending && <LoadingState op="strategy" title="Let’s find the strategic opportunity." />}

      {!pending && error && (
        <div className="mb-6">
          <ErrorState
            error={error}
            title="Couldn’t complete this step."
            onRetry={build}
            onContinue={() => {
              clearError('strategy');
              setManual(true);
            }}
            continueLabel={hasAny ? 'Continue with existing information' : 'Continue manually'}
          />
        </div>
      )}

      {!pending && (hasAny || manual) && (
        <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav aria-label="Strategy sections" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
              {TABS.map((t) => {
                const active = t.key === tab;
                const done = !!dna[t.section];
                return (
                  <li key={t.key} className={t.key === 'messaging' ? 'col-span-2 sm:col-span-1' : ''}>
                    <button
                      onClick={() => setParams({ tab: t.key }, { replace: true })}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                        active ? 'bg-white text-ink shadow-soft ring-1 ring-[#99f6e4]' : 'text-body hover:bg-white/70 hover:text-ink'
                      }`}
                    >
                      <span className={active ? 'text-mint-dark' : 'text-muted'} aria-hidden>
                        {t.icon}
                      </span>
                      <span className="flex-1 truncate">{t.label}</span>
                      {done && <Check className="size-3.5 text-mint" aria-label="ready" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0">
            <SectionPanel key={tab} ws={ws} project={project} tab={tab} section={current.section} />
          </div>
        </div>
      )}

      {!pending && hasAny && (
        <StageFooter
          label="Continue to Challenge"
          to={`/workspace/${projectId}/challenge?run=1`}
          disabled={!complete}
          hint={complete ? 'Next: an AI reviewer will stress-test these decisions.' : 'Complete every section to continue.'}
        />
      )}
    </div>
  );
}

type WS = ReturnType<typeof useCurrentWorkspace>;

function SectionPanel({ ws, project, tab, section }: { ws: WS; project: Project; tab: Tab; section: StrategySection }) {
  const { projectId, run, isPending, errorFor, patch } = ws;
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const dna = project.brandDNA;
  const op = `strategy:${section}`;
  const regenerating = isPending(op);
  const regenError = errorFor(op);

  const regenerate = () => run(op, () => api.strategy(projectId, section)).then((r) => r && toast(`${section[0].toUpperCase() + section.slice(1)} regenerated`));
  const challenge = () => navigate(`/workspace/${projectId}/challenge?run=1`);
  const edited = (p: string) => dna.decisions.edited.includes(p);
  const accepted = (k: string) => dna.decisions.accepted.includes(k);
  const accept = (k: string) => patch({ accept: [k] }).then((r) => r && toast('Accepted'));
  const save = (path: string) => async (value: string | string[] | Trait[]) => {
    const res = await patch({ edits: [{ path, value }] });
    if (res) toast('Saved — this is now the source of truth');
  };

  if (regenerating) return <LoadingState op={section} title={`Regenerating ${section}…`} />;

  const errorBox = regenError && (
    <div className="mb-4">
      <ErrorState error={regenError} onRetry={regenerate} onContinue={() => ws.clearError(op)} />
    </div>
  );

  const missing = !dna[section];
  if (missing) {
    return (
      <>
        {errorBox}
        <Card className="p-8 text-center">
          <Sparkle className="mx-auto size-8" />
          <p className="mt-3 font-semibold text-ink">This section hasn’t been generated yet.</p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={regenerate}>
              Generate {section}
            </Button>
          </div>
        </Card>
      </>
    );
  }

  switch (tab) {
    case 'positioning': {
      const p = dna.positioning!;
      return (
        <div className="space-y-5 animate-fade-in">
          {errorBox}
          <div className="relative overflow-hidden rounded-3xl border border-[#99f6e4] bg-white p-6 shadow-glow sm:p-8">
            <div className="hero-gradient absolute inset-0 opacity-70" aria-hidden />
            <div className="relative">
              <p className="eyebrow mb-3 !text-mint-dark">Positioning statement</p>
              <EditableField
                label="Positioning statement"
                value={p.statement}
                onSave={save('positioning.statement')}
                edited={edited('positioning.statement')}
                copy
                editing={editing}
                onEditingChange={setEditing}
                display={<p className="text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">“{p.statement}”</p>}
              />
            </div>
          </div>
          <DecisionBar
            accepted={accepted('positioning')}
            onAccept={() => accept('positioning')}
            onEdit={() => setEditing(true)}
            onRegenerate={regenerate}
            onChallenge={challenge}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['Category', 'positioning.category', p.category],
                ['Target audience', 'positioning.audience', p.audience],
                ['Problem', 'positioning.problem', p.problem],
                ['Differentiator', 'positioning.differentiator', p.differentiator],
                ['Competitive angle', 'positioning.competitiveAngle', p.competitiveAngle],
              ] as const
            ).map(([label, path, value], i) => (
              <Card key={path} className={`p-4 sm:p-5 ${i === 4 ? 'sm:col-span-2' : ''}`}>
                <p className="eyebrow mb-1.5">{label}</p>
                <EditableField label={label} value={value} onSave={save(path)} edited={edited(path)} display={<p className="text-[15px] leading-relaxed text-ink">{value}</p>} />
              </Card>
            ))}
          </div>
          <AIReasoning>{p.rationale}</AIReasoning>
        </div>
      );
    }

    case 'value': {
      const p = dna.positioning!;
      return (
        <div className="space-y-5 animate-fade-in">
          {errorBox}
          <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-lift sm:p-10">
            <div className="absolute -right-10 -top-10 size-48 rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.35),transparent_70%)]" aria-hidden />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="eyebrow !text-mint-light">Value proposition</p>
                <CopyButton text={p.valueProposition} label="Copy value proposition" className="!text-[#cbd5e1] hover:!bg-white/10 hover:!text-white" />
              </div>
              {editing ? (
                <div className="rounded-2xl bg-white p-3">
                  <EditableField label="Value proposition" value={p.valueProposition} onSave={save('positioning.valueProposition')} editing onEditingChange={setEditing} />
                </div>
              ) : (
                <p className="text-[26px] font-bold leading-tight tracking-tight sm:text-[34px]">“{p.valueProposition}”</p>
              )}
              {edited('positioning.valueProposition') && (
                <Badge tone="ice" className="mt-4">
                  Edited by you
                </Badge>
              )}
            </div>
          </div>
          <DecisionBar
            accepted={accepted('positioning.valueProposition')}
            onAccept={() => accept('positioning.valueProposition')}
            onEdit={() => setEditing(true)}
            onRegenerate={regenerate}
            onChallenge={challenge}
          />
          <Card className="p-5 sm:p-6">
            <h3 className="text-base font-semibold text-ink">Why this matters</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-body">{p.valuePropositionRationale}</p>
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-1">For</p>
                <p className="text-sm text-ink">{p.audience}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Different because</p>
                <p className="text-sm text-ink">{p.differentiator}</p>
              </div>
            </div>
          </Card>
          <p className="text-xs text-muted">Regenerating rewrites the positioning section only — personality, naming and messaging stay as they are.</p>
        </div>
      );
    }

    case 'personality': {
      const pers = dna.personality!;
      const asLines = pers.traits.map((t) => `${t.name} — ${t.reason}`);
      const saveTraits = (value: string | string[]) => {
        const lines = value as string[];
        const traits = lines.map((line) => {
          const [name, ...rest] = line.split(/\s+[—–-]\s+/);
          const prev = pers.traits.find((t) => t.name.toLowerCase() === name.trim().toLowerCase());
          return { name: name.trim().slice(0, 40), reason: rest.join(' — ').trim() || prev?.reason || '', audienceFit: prev?.audienceFit ?? '' };
        });
        return save('personality.traits')(traits);
      };
      return (
        <div className="space-y-5 animate-fade-in">
          {errorBox}
          {editing ? (
            <Card className="p-5">
              <p className="mb-2 text-sm font-semibold text-ink">Edit traits — one per line, as “Trait — reason”</p>
              <EditableField label="Personality traits" value={asLines} onSave={saveTraits} editing onEditingChange={setEditing} />
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pers.traits.map((t) => (
                <div key={t.name} className="flex flex-col">
                  <BrandTrait name={t.name} reason={t.reason} />
                  <WhyThis
                    className="mt-1"
                    question={`Why did AI choose “${t.name}”?`}
                    answer={
                      <>
                        {t.reason} {t.audienceFit}
                      </>
                    }
                  />
                </div>
              ))}
            </div>
          )}
          {edited('personality.traits') && <Badge tone="ice">Edited by you</Badge>}
          <DecisionBar
            accepted={accepted('personality')}
            onAccept={() => accept('personality')}
            onEdit={() => setEditing(true)}
            onRegenerate={regenerate}
            onChallenge={challenge}
          />
          <Card className="p-5">
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <AlertTriangle className="size-3" aria-hidden /> Traits to avoid
            </p>
            <div className="flex flex-wrap gap-2">
              {pers.traitsToAvoid.map((t) => (
                <BrandTrait key={t} name={t} tone="muted" />
              ))}
            </div>
          </Card>
          <AIReasoning title="Why this personality?">{pers.rationale}</AIReasoning>
        </div>
      );
    }

    case 'naming':
      return <NamingPanel project={project} save={save} regenerate={regenerate} errorBox={errorBox} challenge={challenge} />;

    case 'messaging': {
      const m = dna.messaging!;
      return (
        <div className="space-y-4 animate-fade-in">
          {errorBox}
          <div className="relative overflow-hidden rounded-3xl border border-[#99f6e4] bg-white p-6 shadow-glow sm:p-8">
            <div className="hero-gradient absolute inset-0 opacity-70" aria-hidden />
            <div className="relative">
              <p className="eyebrow mb-3 !text-mint-dark">Tagline</p>
              <EditableField
                label="Tagline"
                value={m.tagline}
                onSave={save('messaging.tagline')}
                edited={edited('messaging.tagline')}
                copy
                editing={editing}
                onEditingChange={setEditing}
                display={<p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">“{m.tagline}”</p>}
              />
            </div>
          </div>
          <DecisionBar
            accepted={accepted('messaging')}
            onAccept={() => accept('messaging')}
            onEdit={() => setEditing(true)}
            onRegenerate={regenerate}
            onChallenge={challenge}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <p className="eyebrow mb-1.5">One-line pitch</p>
              <EditableField label="One-line pitch" value={m.oneLinePitch} onSave={save('messaging.oneLinePitch')} edited={edited('messaging.oneLinePitch')} copy display={<p className="text-[15px] font-medium leading-relaxed text-ink">{m.oneLinePitch}</p>} />
            </Card>
            <Card className="p-5">
              <p className="eyebrow mb-1.5">Short product description</p>
              <EditableField label="Short description" value={m.shortDescription} onSave={save('messaging.shortDescription')} edited={edited('messaging.shortDescription')} copy multiline display={<p className="text-sm leading-relaxed text-body">{m.shortDescription}</p>} />
            </Card>
            <Card className="p-5">
              <p className="eyebrow mb-2">Brand voice</p>
              <EditableField
                label="Brand voice"
                value={m.voice}
                onSave={save('messaging.voice')}
                edited={edited('messaging.voice')}
                display={
                  <div className="flex flex-wrap gap-1.5">
                    {m.voice.map((v) => (
                      <Badge key={v} tone="mint" className="!px-3 !py-1 !text-[13px]">
                        {v}
                      </Badge>
                    ))}
                  </div>
                }
              />
              <p className="mt-4 eyebrow mb-1">Tone</p>
              <EditableField label="Tone" value={m.tone} onSave={save('messaging.tone')} edited={edited('messaging.tone')} display={<p className="text-sm leading-relaxed text-body">{m.tone}</p>} />
            </Card>
            <Card className="p-5">
              <p className="eyebrow mb-2">Messaging principles</p>
              <EditableField
                label="Messaging principles"
                value={m.principles}
                onSave={save('messaging.principles')}
                edited={edited('messaging.principles')}
                display={
                  <ol className="space-y-2">
                    {m.principles.map((pr, i) => (
                      <li key={pr} className="flex gap-2.5 text-sm leading-relaxed text-body">
                        <span className="font-bold text-mint">{String(i + 1).padStart(2, '0')}</span>
                        {pr}
                      </li>
                    ))}
                  </ol>
                }
              />
            </Card>
          </div>
          <AIReasoning>{m.rationale}</AIReasoning>
        </div>
      );
    }
  }
}

function NamingPanel({
  project,
  save,
  regenerate,
  errorBox,
  challenge,
}: {
  project: Project;
  save: (path: string) => (v: string) => Promise<void>;
  regenerate: () => void;
  errorBox: ReactNode;
  challenge: () => void;
}) {
  const naming = project.brandDNA.naming!;
  const [custom, setCustom] = useState('');
  const toast = useToast();
  const selectedName = naming.selectedName;

  const choose = async (territory: string, name?: string) => {
    await save('naming.selectedTerritory')(territory);
    if (name) {
      await save('naming.selectedName')(name);
      toast(`“${name}” selected as your brand name`);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {errorBox}
      <p className="text-[15px] leading-relaxed text-body">
        Instead of a list of random names, we explored strategic <strong className="text-ink">naming territories</strong>. Pick a direction, then a name.
      </p>
      {selectedName && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#99f6e4] bg-mint-50/70 p-4">
          <Sparkle className="size-5" />
          <p className="text-sm text-body">
            Selected name: <span className="text-lg font-bold text-ink">{selectedName}</span>
            {naming.selectedTerritory && <span className="text-muted"> · {naming.selectedTerritory} territory</span>}
          </p>
        </div>
      )}
      <div className="space-y-3">
        {naming.territories.map((t, i) => {
          const active = naming.selectedTerritory === t.name;
          return (
            <article key={t.name} className={`card p-5 transition-all sm:p-6 ${active ? 'border-mint shadow-glow' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow !text-mint-dark">Territory {String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">{t.name}</h3>
                </div>
                <Button size="sm" variant={active ? 'mint' : 'secondary'} onClick={() => choose(t.name)} aria-pressed={active} icon={active ? <Check className="size-3.5" /> : undefined}>
                  {active ? 'Selected direction' : 'Select direction'}
                </Button>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">{t.concept}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-body">{t.rationale}</p>
              <div className="mt-4">
                <p className="eyebrow mb-2">Examples — click to choose</p>
                <div className="flex flex-wrap gap-2">
                  {t.examples.map((ex) => {
                    const chosen = selectedName === ex;
                    return (
                      <button
                        key={ex}
                        onClick={() => choose(t.name, ex)}
                        aria-pressed={chosen}
                        className={`rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-all ${
                          chosen ? 'bg-ink text-white shadow-soft' : 'bg-[#f1f5f9] text-ink hover:bg-mint-50 hover:text-mint-dark'
                        }`}
                      >
                        {ex}
                      </button>
                    );
                  })}
                </div>
              </div>
              {t.risks.length > 0 && (
                <div className="mt-4 flex gap-2 rounded-xl bg-[#fffbeb] p-3 text-[13px] leading-relaxed text-[#92400e]">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>
                    <span className="font-semibold">Potential risks: </span>
                    {t.risks.join(' ')}
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <Card className="p-5">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!custom.trim()) return;
            save('naming.selectedName')(custom.trim()).then(() => {
              toast(`“${custom.trim()}” selected as your brand name`);
              setCustom('');
            });
          }}
        >
          <label htmlFor="custom-name" className="sr-only">
            Your own name
          </label>
          <input
            id="custom-name"
            value={custom}
            maxLength={60}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Have a name in mind? Type it here"
            className="h-10 flex-1 rounded-xl border border-line px-3.5 text-[15px] focus:border-mint focus:outline-none focus:ring-4 focus:ring-[rgb(20_184_166/0.12)]"
          />
          <Button type="submit" disabled={!custom.trim()}>
            Use my name
          </Button>
        </form>
      </Card>
      <DecisionBar onRegenerate={regenerate} onChallenge={challenge} />
    </div>
  );
}
