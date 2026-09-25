import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, PartyPopper, Presentation, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { Project } from '../../lib/types';
import { loadGoogleFont } from '../../lib/format';
import { ShareDialog } from '../../components/brand/ShareDialog';
import { useStore } from '../../state/ProjectContext';
import { SectionHeading, Badge, Card } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states';
import { CopyButton } from '../../components/ui/CopyButton';
import { Sparkle } from '../../components/ui/Logo';
import { AbstractArt, BrandTrait, ColorPalette, TypographyPreview } from '../../components/brand/identity';
import { BrandHero, LandingPreview, LaunchMockups } from '../../components/brand/showcase';
import { brandPalette } from '../../lib/palette';
import { kitStaleness } from '../../lib/stale';
import { WhyThis } from '../../components/brand/ai';
import { BrandHealthCheck, BrandSection, ConsistencyReport, DownloadMenu } from '../../components/brand/kit';
import { CompetitorMatrix } from '../../components/brand/CompetitorMatrix';
import { AudienceSimulator } from '../../components/brand/AudienceSimulator';
import { SocialLaunchStudio } from '../../components/brand/SocialLaunchStudio';
import { SharkTankSimulator } from '../../components/brand/SharkTankSimulator';
import { MerchStudio } from '../../components/brand/MerchStudio';
import { ViralCampaignEngine } from '../../components/brand/ViralCampaignEngine';
import { AudioVoiceStudio } from '../../components/brand/AudioVoiceStudio';
import { ConfettiBlast } from '../../components/ui/ConfettiBlast';
import { useToast } from '../../components/ui/Toast';
import { useAutoRun, useCurrentWorkspace } from './shared';

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'strategy', label: 'Brand Strategy' },
  { id: 'visual', label: 'Visual Identity' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'launch', label: 'Launch Assets' },
  { id: 'market-radar', label: 'Market Moat' },
  { id: 'audience-simulator', label: 'Audience Simulator' },
  { id: 'social-studio', label: 'Social Studio' },
  { id: 'shark-tank', label: 'Shark Tank VC' },
  { id: 'merch-studio', label: '3D Merch Studio' },
  { id: 'viral-campaign', label: 'Viral Hooks' },
  { id: 'audio-voice', label: 'Audio Commercial' },
];
const NAV_IDS = NAV.map((n) => n.id);

function useScrollSpy(ids: string[], enabled: boolean) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!enabled) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids, enabled]);
  return [active, setActive] as const;
}

function CopyBlock({ label, text, large = false, children }: { label: string; text: string; large?: boolean; children?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        <CopyButton text={text} label={`Copy ${label.toLowerCase()}`} showLabel />
      </div>
      {children ?? <p className={large ? 'text-xl font-bold leading-snug tracking-tight text-ink' : 'text-[15px] leading-relaxed text-ink'}>{text}</p>}
    </Card>
  );
}

export default function BrandKit() {
  const { projectId, project, run, isPending, errorFor, clearError } = useCurrentWorkspace();
  const { setProject } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Brand kit first (it writes the launch copy), then the Consistency Guardian checks everything together.
  const complete = useCallback(
    () =>
      run('brand-kit', async () => {
        const withKit = await api.brandKit(projectId);
        setProject(withKit);
        return api.consistency(projectId);
      }),
    [projectId, run, setProject],
  );
  const recheck = () => run('consistency', () => api.consistency(projectId)).then((r) => r && toast('Consistency re-checked'));

  const dna = project?.brandDNA;
  const kit = dna?.brandKit;
  const ready = !!(dna?.positioning && dna?.messaging && dna?.visual);
  const pending = isPending('brand-kit');
  const error = errorFor('brand-kit');
  const [active, setActive] = useScrollSpy(NAV_IDS, !!kit && !pending);

  useAutoRun(!!project && ready && !kit && params.get('run') === '1' && !pending && !error, complete);

  const heading = dna?.visual?.typography.heading;
  useEffect(() => {
    if (heading) loadGoogleFont(heading);
  }, [heading]);

  if (!project || !dna) return null;

  const header = (
    <SectionHeading
      eyebrow="Stage 05 · Brand Kit"
      title="Your Complete Brand Kit"
      subtitle="Everything you need to launch your brand."
      actions={
        kit && !pending ? (
          <>
            <Link
              to={`/pitch-deck/${project._id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-teal-500 transition-colors"
            >
              <Presentation className="size-3.5" /> Pitch Deck
            </Link>
            <Button size="sm" variant="ghost" onClick={complete} icon={<RefreshCw className="size-3.5" />}>
              Rebuild
            </Button>
            <ShareDialog project={project} />
            <DownloadMenu project={project} />
          </>
        ) : undefined
      }
    />
  );

  if (pending) {
    return (
      <div>
        {header}
        <LoadingState op="brand-kit" title="Bringing everything together." />
      </div>
    );
  }

  if (!kit) {
    return (
      <div>
        {header}
        {error && (
          <div className="mb-6">
            <ErrorState error={error} title="Something went wrong while preparing your brand kit." onRetry={complete} />
          </div>
        )}
        {!error && (
          <EmptyState
            icon={<Package className="size-7 text-mint-dark" />}
            title="Bring your brand together."
            description={ready ? 'We’ll compile your final brand kit from every decision you’ve made, then check it for consistency.' : 'Create your visual direction first.'}
            action={
              <Button variant="primary" size="lg" onClick={complete} disabled={!ready}>
                Complete brand →
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return <KitView project={project} active={active} setActive={setActive} header={header} error={error} onRetry={complete} clearError={() => clearError('brand-kit')} recheck={recheck} rechecking={isPending('consistency')} onReview={(area) => navigate(`/workspace/${projectId}/${/visual/i.test(area) ? 'visual' : 'challenge'}`)} />;
}

function KitView({
  project,
  active,
  setActive,
  header,
  error,
  onRetry,
  clearError,
  recheck,
  rechecking,
  onReview,
}: {
  project: Project;
  active: string;
  setActive: (id: string) => void;
  header: ReactNode;
  error?: Error;
  onRetry: () => void;
  clearError: () => void;
  recheck: () => void;
  rechecking: boolean;
  onReview: (area: string) => void;
}) {
  const d = project.brandDNA;
  const kit = d.brandKit!;
  const v = d.visual;
  const colors = v?.colors ?? [];
  const palette = brandPalette(v);
  const concept = d.logo?.concept ?? 'monogram';
  const stale = kitStaleness(d);
  const primary = palette.primary;
  const headingFont = v?.typography.heading ?? 'Inter';
  const bodyFont = v?.typography.body ?? 'Inter';
  const complete = project.currentStage === 'complete';

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {header}
      {error && (
        <div className="mb-6">
          <ErrorState error={error} onRetry={onRetry} onContinue={clearError} />
        </div>
      )}

      {stale && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
          <p className="text-sm text-[#1e3a8a]">
            <span className="font-semibold">Out of date.</span> {stale} Rebuild to bring the kit back in sync.
          </p>
          <Button size="sm" onClick={onRetry} icon={<RefreshCw className="size-3.5" />}>
            Rebuild kit
          </Button>
        </div>
      )}

      {complete && (
        <div className="mb-6 flex animate-scale-in items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-white">
          <PartyPopper className="size-5 shrink-0 text-mint-light" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">Your brand is ready.</span> <span className="text-[#cbd5e1]">All five stages complete — download your kit or keep refining.</span>
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Brand kit sections" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-5 lg:grid-cols-1">
            {NAV.map((n) => (
              <li key={n.id} className={n.id === 'launch' ? 'col-span-2 sm:col-span-1' : ''}>
                <button
                  onClick={() => jump(n.id)}
                  aria-current={active === n.id ? 'true' : undefined}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all ${
                    active === n.id ? 'bg-white text-mint-dark shadow-soft ring-1 ring-[#99f6e4]' : 'text-body hover:bg-white/70 hover:text-ink'
                  }`}
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-14">
          {/* OVERVIEW */}
          <section id="overview" aria-label="Overview" className="scroll-mt-28 space-y-5">
            <BrandHero kit={kit} palette={palette} concept={concept} colors={colors.map((c) => c.hex)} />

            <Card className="p-5 sm:p-6">
              <p className="eyebrow mb-2">Brand summary</p>
              <p className="text-[15px] leading-relaxed text-ink">{kit.brandSummary}</p>
            </Card>

            {d.consistency ? (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                <BrandHealthCheck consistency={d.consistency} />
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                      <ShieldCheck className="size-4 text-mint-dark" aria-hidden /> Brand Consistency
                    </h3>
                    <Button size="sm" variant="ghost" onClick={recheck} loading={rechecking} icon={<RefreshCw className="size-3.5" />}>
                      Re-check
                    </Button>
                  </div>
                  <ConsistencyReport consistency={d.consistency} onReview={() => onReview(d.consistency!.checks.find((c) => c.status !== 'pass')?.area ?? '')} />
                </div>
              </div>
            ) : (
              <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-body">The consistency check hasn’t run for this kit yet.</p>
                <Button size="sm" variant="primary" onClick={recheck} loading={rechecking}>
                  Check consistency
                </Button>
              </Card>
            )}
          </section>

          {/* STRATEGY */}
          <BrandSection id="strategy" eyebrow="Brand strategy" title="Positioning & personality">
            {d.positioning && (
              <>
                <CopyBlock label="Positioning" text={kit.positioning} large />
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {(
                    [
                      ['Category', d.positioning.category],
                      ['Target audience', kit.audience],
                      ['Problem', d.positioning.problem],
                      ['Differentiator', d.positioning.differentiator],
                      ['Competitive angle', d.positioning.competitiveAngle],
                    ] as const
                  ).map(([label, value]) => (
                    <Card key={label} className="p-4">
                      <p className="eyebrow mb-1">{label}</p>
                      <p className="text-sm leading-relaxed text-ink">{value}</p>
                    </Card>
                  ))}
                  <div className="rounded-2xl bg-ink p-4 text-white">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="eyebrow !text-mint-light">Value proposition</p>
                      <CopyButton text={d.positioning.valueProposition} label="Copy value proposition" className="!text-[#cbd5e1] hover:!bg-white/10 hover:!text-white" />
                    </div>
                    <p className="text-[15px] font-semibold leading-snug">{d.positioning.valueProposition}</p>
                  </div>
                </div>
              </>
            )}
            {d.personality && (
              <div className="mt-6">
                <h3 className="mb-3 text-base font-semibold text-ink">Personality</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {d.personality.traits.map((t) => (
                    <BrandTrait key={t.name} name={t.name} reason={t.reason} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-[#f8fafc] p-4">
                  <span className="eyebrow mr-1">Traits to avoid</span>
                  {d.personality.traitsToAvoid.map((t) => (
                    <BrandTrait key={t} name={t} tone="muted" />
                  ))}
                </div>
                <WhyThis className="mt-2" question="Why this personality?" answer={d.personality.rationale} />
              </div>
            )}
          </BrandSection>

          {/* VISUAL */}
          {v && (
            <BrandSection id="visual" eyebrow="Visual identity" title="Colour, type & style">
              <ColorPalette colors={v.colors} />
              <div className="mt-6">
                <TypographyPreview heading={headingFont} body={bodyFont} brandName={kit.name} line={kit.launchHeadline} accent={primary} />
              </div>
              <div className="mt-6">
                <p className="eyebrow mb-2">Visual mood</p>
                <div className="flex flex-wrap gap-2">
                  {v.mood.map((m) => (
                    <Badge key={m} tone="mint" className="!px-3.5 !py-1.5 !text-[13px]">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['Imagery direction', 'imagery', v.imagery],
                    ['Shapes', 'shapes', v.shapes],
                    ['Composition', 'composition', v.composition],
                    ['Visual principles', 'principles', v.principles],
                  ] as const
                ).map(([title, variant, items]) => (
                  <Card key={title} className="flex gap-4 p-4">
                    <div className="w-24 shrink-0">
                      <AbstractArt variant={variant} colors={colors.map((c) => c.hex)} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-ink">{title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-body">{items.join(' · ')}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-[#fef2f2] p-4">
                <span className="eyebrow mr-1 !text-[#b91c1c]">Avoid</span>
                {v.avoid.map((a) => (
                  <span key={a} className="text-[13px] text-[#991b1b]">
                    {a} ·
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-body">{kit.visualSummary}</p>
            </BrandSection>
          )}

          {/* MESSAGING */}
          <BrandSection id="messaging" eyebrow="Messaging" title="What you say, and how">
            <div className="grid gap-3 md:grid-cols-2">
              <CopyBlock label="Tagline" text={kit.tagline} large />
              <CopyBlock label="One-line pitch" text={kit.oneLinePitch} />
              <div className="md:col-span-2">
                <CopyBlock label="Short description" text={kit.shortDescription} />
              </div>
              <Card className="p-5">
                <p className="eyebrow mb-2">Brand voice</p>
                <div className="flex flex-wrap gap-1.5">
                  {kit.voice.map((vc) => (
                    <Badge key={vc} tone="mint" className="!px-3 !py-1 !text-[13px]">
                      {vc}
                    </Badge>
                  ))}
                </div>
                {d.messaging?.tone && <p className="mt-3 text-sm leading-relaxed text-body">{d.messaging.tone}</p>}
              </Card>
              <Card className="p-5">
                <p className="eyebrow mb-2">Messaging principles</p>
                <ol className="space-y-1.5">
                  {d.messaging?.principles.map((pr, i) => (
                    <li key={pr} className="flex gap-2 text-sm leading-relaxed text-body">
                      <span className="font-bold text-mint">{i + 1}</span>
                      {pr}
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </BrandSection>

          {/* LAUNCH */}
          <BrandSection id="launch" eyebrow="Launch assets" title="Ready to ship">
            <LandingPreview kit={kit} palette={palette} concept={concept} />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <Sparkle className="size-3" /> Live preview built from your final Brand DNA.
            </p>

            <h3 className="mb-3 mt-8 text-base font-semibold text-ink">Launch mockups</h3>
            <LaunchMockups kit={kit} palette={palette} concept={concept} />

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <CopyBlock label="Landing page headline" text={kit.launchHeadline} large />
              <CopyBlock label="CTA" text={kit.cta} large />
              <div className="md:col-span-2">
                <CopyBlock label="Landing page description" text={kit.launchDescription} />
              </div>
              <div className="md:col-span-2">
                <CopyBlock label="Social launch post" text={kit.socialLaunchPost}>
                  <p className="whitespace-pre-line rounded-xl bg-[#f8fafc] p-4 text-[15px] leading-relaxed text-ink">{kit.socialLaunchPost}</p>
                </CopyBlock>
              </div>
            </div>
          </BrandSection>

          {/* MARKET MOAT & 2X2 MATRIX */}
          <section id="market-radar" aria-label="Market Moat" className="scroll-mt-28">
            <CompetitorMatrix dna={d} />
          </section>

          {/* AUDIENCE SIMULATOR */}
          <section id="audience-simulator" aria-label="Audience Simulator" className="scroll-mt-28">
            <AudienceSimulator dna={d} />
          </section>

          {/* SOCIAL LAUNCH STUDIO */}
          <section id="social-studio" aria-label="Social Studio" className="scroll-mt-28">
            <SocialLaunchStudio dna={d} />
          </section>

          {/* SHARK TANK / VC PITCH SIMULATOR */}
          <section id="shark-tank" aria-label="Shark Tank VC Simulator" className="scroll-mt-28">
            <SharkTankSimulator dna={d} />
          </section>

          {/* 3D MERCH & PACKAGING STUDIO */}
          <section id="merch-studio" aria-label="3D Merch Studio" className="scroll-mt-28">
            <MerchStudio dna={d} />
          </section>

          {/* VIRAL LAUNCH CAMPAIGN & HOOKS */}
          <section id="viral-campaign" aria-label="Viral Launch Campaign" className="scroll-mt-28">
            <ViralCampaignEngine dna={d} />
          </section>

          {/* AUDIO AD & PODCAST VOICEOVER STUDIO */}
          <section id="audio-voice" aria-label="Audio Commercial Studio" className="scroll-mt-28">
            <AudioVoiceStudio dna={d} />
          </section>

          {/* FINISH & PITCH DECK CTA */}
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-ink to-slate-950 px-6 py-12 text-center text-white shadow-lift border border-teal-500/20">
            <ConfettiBlast trigger={complete} />
            <div className="rounded-2xl bg-teal-500/20 p-3 text-teal-300">
              <Sparkles className="size-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Your complete brand ecosystem is ready to launch.</h3>
            <p className="text-sm text-slate-300 max-w-md">
              Present your story to investors, judges and customers with the interactive 10-slide deck, or take everything with you.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/pitch-deck/${project._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lift hover:bg-teal-400 transition-all hover:scale-105"
              >
                <Presentation className="size-4" /> Present Pitch Deck (Slides) →
              </Link>
              <DownloadMenu project={project} variant="mint" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
