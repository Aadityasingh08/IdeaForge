import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { SharedBrand } from '../lib/types';
import { brandPalette } from '../lib/palette';
import { Logo, Sparkle } from '../components/ui/Logo';
import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/states';
import { Card } from '../components/ui/primitives';
import { BrandHero, LandingPreview, LaunchMockups } from '../components/brand/showcase';
import { BrandTrait, ColorPalette, TypographyPreview } from '../components/brand/identity';

/** Public, read-only brand page at /b/:projectId — only available when the owner shares it. */
export default function SharedBrandPage() {
  const { projectId = '' } = useParams();
  const [brand, setBrand] = useState<SharedBrand | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api.shared(projectId).then(
      (b) => {
        setBrand(b);
        document.title = `${b.brandDNA.brandKit?.name ?? b.name} — Brand`;
      },
      () => setMissing(true),
    );
  }, [projectId]);

  const header = (
    <header className="border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <ButtonLink to="/" size="sm" variant="primary" iconRight={<ArrowRight className="size-3.5" />}>
          Build your own
        </ButtonLink>
      </div>
    </header>
  );

  if (missing) {
    return (
      <div className="min-h-screen">
        {header}
        <div className="mx-auto max-w-xl px-4 py-24">
          <EmptyState title="This brand isn’t public." description="The owner may have made it private, or the link is incorrect." />
        </div>
      </div>
    );
  }
  if (!brand?.brandDNA.brandKit) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Sparkle className="size-10" animated />
      </div>
    );
  }

  const d = brand.brandDNA;
  const kit = d.brandKit!;
  const palette = brandPalette(d.visual);
  const concept = d.logo?.concept ?? 'monogram';

  return (
    <div className="min-h-screen">
      {header}
      <main className="mx-auto max-w-5xl space-y-14 px-4 py-10 sm:px-6 sm:py-14">
        <BrandHero kit={kit} palette={palette} concept={concept} colors={d.visual?.colors.map((c) => c.hex) ?? []} copyable={false} />

        <section aria-labelledby="story" className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 id="story" className="eyebrow mb-2">
              Brand story
            </h2>
            <p className="text-[15px] leading-relaxed text-ink">{kit.brandSummary}</p>
          </Card>
          {d.positioning && (
            <div className="rounded-2xl bg-ink p-6 text-white">
              <p className="eyebrow mb-2 !text-mint-light">Value proposition</p>
              <p className="text-xl font-semibold leading-snug">{d.positioning.valueProposition}</p>
            </div>
          )}
        </section>

        {d.personality && (
          <section aria-labelledby="personality">
            <h2 id="personality" className="mb-4 text-2xl font-bold tracking-tight text-ink">
              Personality
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {d.personality.traits.map((t) => (
                <BrandTrait key={t.name} name={t.name} reason={t.reason} />
              ))}
            </div>
          </section>
        )}

        {d.visual && (
          <section aria-labelledby="identity" className="space-y-6">
            <h2 id="identity" className="text-2xl font-bold tracking-tight text-ink">
              Visual identity
            </h2>
            <ColorPalette colors={d.visual.colors} />
            <TypographyPreview heading={palette.heading} body={palette.body} brandName={kit.name} line={kit.launchHeadline} accent={palette.primary} />
          </section>
        )}

        <section aria-labelledby="launch" className="space-y-6">
          <h2 id="launch" className="text-2xl font-bold tracking-tight text-ink">
            Launch
          </h2>
          <LandingPreview kit={kit} palette={palette} concept={concept} />
          <LaunchMockups kit={kit} palette={palette} concept={concept} />
        </section>

        <footer className="flex flex-col items-center gap-2 border-t border-line pt-8 text-center text-sm text-muted">
          <Sparkle className="size-5" />
          Brand built with IdeaForge — turn your idea into a brand.
        </footer>
      </main>
    </div>
  );
}
