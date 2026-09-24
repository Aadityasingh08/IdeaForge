import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useWorkspace } from '../state/ProjectContext';
import { brandPalette, fontStack, type BrandPalette } from '../lib/palette';
import { isLight, loadGoogleFont } from '../lib/format';
import { BrandLogo, LogoMark } from '../components/brand/logos';
import { LandingPreview, LaunchMockups } from '../components/brand/showcase';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/states';
import { Sparkle } from '../components/ui/Logo';

function Page({ children, n, title, palette, dark = false }: { children: ReactNode; n?: number; title?: string; palette: BrandPalette; dark?: boolean }) {
  return (
    <section
      className="book-page relative mx-auto flex w-full max-w-[210mm] flex-col overflow-hidden bg-white shadow-lift print:shadow-none"
      style={dark ? { backgroundColor: palette.dark, color: '#fff' } : undefined}
    >
      <div className="flex flex-1 flex-col p-8 sm:p-14">
        {title && (
          <header className="mb-10 flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: fontStack(palette.heading), color: dark ? '#fff' : palette.dark }}>
              {title}
            </h2>
            {n !== undefined && <span className="text-xs font-semibold tracking-widest opacity-50">{String(n).padStart(2, '0')}</span>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

const Label = ({ children }: { children: ReactNode }) => <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{children}</p>;

/** Print-ready brand book. “Save as PDF” in the browser's print dialog produces the PDF file. */
export default function BrandBook() {
  const { projectId = '' } = useParams();
  const [params] = useSearchParams();
  const { project, loadError } = useWorkspace(projectId);
  const printed = useRef(false);

  const dna = project?.brandDNA;
  const palette = brandPalette(dna?.visual);

  useEffect(() => {
    if (!dna?.brandKit) return;
    document.title = `${dna.brandKit.name} — Brand Book`;
    loadGoogleFont(palette.heading);
    loadGoogleFont(palette.body);
    if (params.get('print') === '1' && !printed.current) {
      printed.current = true;
      // Wait for brand fonts so the PDF uses them.
      document.fonts.ready.then(() => setTimeout(() => window.print(), 600));
    }
  }, [dna, palette.heading, palette.body, params]);

  if (!project || !dna) {
    return loadError ? (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState title="We couldn’t open this brand book." description="It may belong to another browser or have been deleted." action={<ButtonLink to="/projects">Back to your ideas</ButtonLink>} />
      </div>
    ) : (
      <div className="grid min-h-screen place-items-center">
        <Sparkle className="size-10" animated />
      </div>
    );
  }

  const kit = dna.brandKit;
  if (!kit) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState title="Complete your brand kit first." description="The brand book is compiled from your finished brand." action={<ButtonLink to={`/workspace/${projectId}/brand-kit`}>Go to Brand Kit</ButtonLink>} />
      </div>
    );
  }

  const concept = dna.logo?.concept ?? 'monogram';
  const v = dna.visual;
  const p = dna.positioning;
  let n = 1;

  return (
    <div className="min-h-screen bg-[#eef3f5] print:bg-white">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .book-page { width: 210mm; min-height: 297mm; max-width: none; page-break-after: always; break-after: page; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media screen { .book-page { min-height: min(297mm, 140vw); } }
      `}</style>

      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur print:hidden sm:px-6">
        <Link to={`/workspace/${projectId}/brand-kit`} className="inline-flex items-center gap-2 text-sm font-semibold text-body hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Back to Brand Kit
        </Link>
        <Button variant="primary" size="sm" onClick={() => window.print()} icon={<Printer className="size-3.5" />}>
          Save as PDF
        </Button>
      </div>
      <p className="px-4 pt-4 text-center text-xs text-muted print:hidden">In the print dialog choose “Save as PDF”. Turn on “Background graphics” if your browser asks.</p>

      <main className="space-y-8 px-3 py-6 sm:px-6 print:space-y-0 print:p-0">
        {/* Cover */}
        <Page palette={palette} dark>
          <div className="flex flex-1 flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Brand book</span>
            <div>
              <LogoMark concept={concept} name={kit.name} palette={palette} size={96} />
              <h1 className="mt-8 break-words text-6xl font-bold tracking-tight" style={{ fontFamily: fontStack(palette.heading) }}>
                {kit.name}
              </h1>
              <p className="mt-4 max-w-md text-2xl font-medium leading-snug opacity-90">{kit.tagline}</p>
            </div>
            <div className="flex items-end justify-between text-xs opacity-60">
              <span>{new Date(kit.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              <span>Made with IdeaForge</span>
            </div>
          </div>
        </Page>

        <Page palette={palette} title="Our story" n={n++}>
          <p className="text-2xl font-medium leading-snug text-ink" style={{ fontFamily: fontStack(palette.heading) }}>
            {kit.brandSummary}
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <Label>The problem</Label>
              <p className="text-sm leading-relaxed text-body">{p?.problem ?? dna.idea.problem}</p>
            </div>
            <div>
              <Label>Who it’s for</Label>
              <p className="text-sm leading-relaxed text-body">{kit.audience}</p>
            </div>
            <div className="sm:col-span-2">
              <Label>One-line pitch</Label>
              <p className="text-lg font-semibold text-ink">{kit.oneLinePitch}</p>
            </div>
          </div>
        </Page>

        {p && (
          <Page palette={palette} title="Positioning" n={n++}>
            <div className="rounded-2xl p-6" style={{ backgroundColor: `${palette.secondary}1f` }}>
              <Label>Positioning statement</Label>
              <p className="text-xl font-semibold leading-snug text-ink">{p.statement}</p>
            </div>
            <div className="mt-8 rounded-2xl p-6 text-white" style={{ backgroundColor: palette.dark }}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] opacity-60">Value proposition</p>
              <p className="text-2xl font-bold leading-snug" style={{ fontFamily: fontStack(palette.heading) }}>
                {p.valueProposition}
              </p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                ['Category', p.category],
                ['Differentiator', p.differentiator],
                ['Competitive angle', p.competitiveAngle],
              ].map(([k, val]) => (
                <div key={k}>
                  <Label>{k}</Label>
                  <p className="text-sm leading-relaxed text-body">{val}</p>
                </div>
              ))}
            </div>
          </Page>
        )}

        {dna.personality && (
          <Page palette={palette} title="Personality & voice" n={n++}>
            <div className="grid gap-4 sm:grid-cols-2">
              {dna.personality.traits.map((t) => (
                <div key={t.name} className="rounded-2xl border border-line p-5">
                  <p className="text-lg font-bold" style={{ color: palette.primary, fontFamily: fontStack(palette.heading) }}>
                    {t.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-body">{t.reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <Label>We are not</Label>
                <p className="text-sm text-body">{dna.personality.traitsToAvoid.join(' · ')}</p>
              </div>
              <div>
                <Label>Voice</Label>
                <p className="text-sm font-semibold text-ink">{kit.voice.join(' · ')}</p>
                {dna.messaging?.tone && <p className="mt-1 text-sm text-body">{dna.messaging.tone}</p>}
              </div>
            </div>
          </Page>
        )}

        <Page palette={palette} title="Logo" n={n++}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid min-h-44 place-items-center rounded-2xl border border-line bg-white p-8">
              <BrandLogo concept={concept} name={kit.name} palette={palette} size={52} />
            </div>
            <div className="grid min-h-44 place-items-center rounded-2xl p-8" style={{ backgroundColor: palette.dark }}>
              <BrandLogo concept={concept} name={kit.name} palette={palette} size={52} onDark />
            </div>
            <div className="grid min-h-36 place-items-center rounded-2xl p-6" style={{ backgroundColor: palette.light }}>
              <LogoMark concept={concept} name={kit.name} palette={palette} size={72} />
            </div>
            <div className="grid min-h-36 place-items-center rounded-2xl p-6" style={{ backgroundColor: palette.primary }}>
              <LogoMark concept={concept === 'monogram' ? 'wordmark' : concept} name={kit.name} palette={{ ...palette, dark: palette.dark }} size={72} />
            </div>
          </div>
          <div className="mt-8 grid gap-6 text-sm leading-relaxed text-body sm:grid-cols-2">
            <div>
              <Label>Clear space</Label>
              Keep space equal to the height of the mark on every side. Never place the logo on busy imagery.
            </div>
            <div>
              <Label>Don’t</Label>
              Stretch, recolour outside the palette, add shadows or rotate the logo.
            </div>
          </div>
        </Page>

        {v && (
          <Page palette={palette} title="Colour" n={n++}>
            <div className="grid gap-3">
              {v.colors.map((c, i) => (
                <div key={c.hex + i} className="flex overflow-hidden rounded-2xl border border-line">
                  <div className="grid w-2/5 place-items-center p-6 font-mono text-sm font-semibold" style={{ backgroundColor: c.hex, color: isLight(c.hex) ? '#0F172A' : '#fff', minHeight: i === 0 ? 120 : 76 }}>
                    {c.hex}
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-5">
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-sm text-body">{c.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </Page>
        )}

        {v && (
          <Page palette={palette} title="Typography" n={n++}>
            <div className="rounded-2xl border border-line p-8">
              <Label>Headings · {v.typography.heading}</Label>
              <p className="text-6xl font-bold leading-none text-ink" style={{ fontFamily: fontStack(v.typography.heading) }}>
                Aa Bb Cc
              </p>
              <p className="mt-6 text-3xl font-bold leading-tight text-ink" style={{ fontFamily: fontStack(v.typography.heading) }}>
                {kit.launchHeadline}
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-line p-8">
              <Label>Body · {v.typography.body}</Label>
              <p className="text-base leading-relaxed text-body" style={{ fontFamily: fontStack(v.typography.body) }}>
                {kit.launchDescription} {kit.shortDescription}
              </p>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-body">{v.typography.rationale}</p>
          </Page>
        )}

        {v && (
          <Page palette={palette} title="Visual language" n={n++}>
            <div className="mb-8 flex flex-wrap gap-2">
              {v.mood.map((m) => (
                <span key={m} className="rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: `${palette.primary}1f`, color: palette.dark }}>
                  {m}
                </span>
              ))}
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {(
                [
                  ['Imagery', v.imagery],
                  ['Shapes', v.shapes],
                  ['Composition', v.composition],
                  ['Principles', v.principles],
                ] as const
              ).map(([k, items]) => (
                <div key={k}>
                  <Label>{k}</Label>
                  <ul className="space-y-1.5 text-sm leading-relaxed text-body">
                    {items.map((i) => (
                      <li key={i}>— {i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-[#fef2f2] p-5">
              <Label>Avoid</Label>
              <p className="text-sm text-[#991b1b]">{v.avoid.join(' · ')}</p>
            </div>
          </Page>
        )}

        <Page palette={palette} title="Messaging" n={n++}>
          <Label>Tagline</Label>
          <p className="text-3xl font-bold leading-tight text-ink" style={{ fontFamily: fontStack(palette.heading) }}>
            {kit.tagline}
          </p>
          <div className="mt-10 space-y-6">
            <div>
              <Label>Short description</Label>
              <p className="text-base leading-relaxed text-body">{kit.shortDescription}</p>
            </div>
            {dna.messaging && (
              <div>
                <Label>Messaging principles</Label>
                <ol className="space-y-2">
                  {dna.messaging.principles.map((pr, i) => (
                    <li key={pr} className="flex gap-3 text-sm text-body">
                      <span className="font-bold" style={{ color: palette.primary }}>
                        {i + 1}
                      </span>
                      {pr}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div>
              <Label>Launch post</Label>
              <p className="whitespace-pre-line rounded-2xl bg-[#f8fafc] p-5 text-sm leading-relaxed text-ink">{kit.socialLaunchPost}</p>
            </div>
          </div>
        </Page>

        <Page palette={palette} title="In the wild" n={n++}>
          <LandingPreview kit={kit} palette={palette} concept={concept} />
          <div className="mt-6">
            <LaunchMockups kit={kit} palette={palette} concept={concept} />
          </div>
        </Page>
      </main>
    </div>
  );
}
