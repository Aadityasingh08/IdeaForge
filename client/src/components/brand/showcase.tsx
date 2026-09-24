import type { BrandKit, LogoConcept } from '../../lib/types';
import { fontStack, type BrandPalette } from '../../lib/palette';
import { BrandLogo, LogoMark } from './logos';
import { CopyButton } from '../ui/CopyButton';

const domain = (name: string) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'brand'}.com`;
const handle = (name: string) => `@${name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'brand'}`;

/** Large brand overview: logo, name, tagline and pitch — built from the final BrandDNA. */
export function BrandHero({
  kit,
  palette,
  concept,
  colors,
  copyable = true,
}: {
  kit: BrandKit;
  palette: BrandPalette;
  concept: LogoConcept;
  colors: string[];
  copyable?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-white px-6 py-10 text-center shadow-lift sm:px-10 sm:py-14">
      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(ellipse at top, ${palette.secondary}33, transparent 60%)` }} aria-hidden />
      <div className="relative flex flex-col items-center">
        <LogoMark concept={concept} name={kit.name} palette={palette} size={88} />
        <h2 className="mt-6 break-words text-4xl font-bold tracking-tight text-ink sm:text-5xl" style={{ fontFamily: fontStack(palette.heading) }}>
          {kit.name}
        </h2>
        <div className="mt-4 flex items-center gap-1">
          <p className="max-w-xl text-xl font-semibold leading-snug sm:text-2xl" style={{ color: palette.dark }}>
            {kit.tagline}
          </p>
          {copyable && <CopyButton text={kit.tagline} label="Copy tagline" />}
        </div>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-body">{kit.oneLinePitch}</p>
        <div className="mt-6 flex gap-1.5" aria-label="Brand palette">
          {colors.map((c, i) => (
            <span key={`${c}-${i}`} className="size-5 rounded-full ring-2 ring-white" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Browser-framed landing page hero rendered in the brand's colours and fonts. */
export function LandingPreview({ kit, palette, concept }: { kit: BrandKit; palette: BrandPalette; concept: LogoConcept }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
      <div className="flex items-center gap-1.5 border-b border-line bg-[#f8fafc] px-4 py-2.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-[#fca5a5]" />
        <span className="size-2.5 rounded-full bg-[#fcd34d]" />
        <span className="size-2.5 rounded-full bg-[#86efac]" />
        <span className="ml-3 truncate text-xs text-muted">{domain(kit.name)}</span>
      </div>
      <div className="flex items-center justify-between border-b border-line/60 px-6 py-3">
        <BrandLogo concept={concept} name={kit.name} palette={palette} size={24} />
        <span className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: palette.primary, color: palette.onPrimary }}>
          {kit.cta}
        </span>
      </div>
      <div className="relative px-6 py-12 text-center sm:px-12 sm:py-16" style={{ background: `linear-gradient(160deg, ${palette.secondary}1a, #ffffff 55%)` }}>
        <h3 className="mx-auto max-w-xl break-words text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl" style={{ fontFamily: fontStack(palette.heading) }}>
          {kit.launchHeadline}
        </h3>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-body" style={{ fontFamily: fontStack(palette.body) }}>
          {kit.launchDescription}
        </p>
        <span className="mt-7 inline-flex rounded-xl px-6 py-3 text-sm font-semibold shadow-soft" style={{ backgroundColor: palette.primary, color: palette.onPrimary }}>
          {kit.cta}
        </span>
      </div>
    </div>
  );
}

/** Square social post announcing the launch. */
export function InstagramPost({ kit, palette, concept }: { kit: BrandKit; palette: BrandPalette; concept: LogoConcept }) {
  return (
    <figure className="card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <LogoMark concept={concept} name={kit.name} palette={palette} size={26} />
        <span className="text-[13px] font-semibold text-ink">{handle(kit.name).slice(1)}</span>
      </div>
      <div
        className="relative flex aspect-square flex-col justify-between overflow-hidden p-6"
        style={{ background: `linear-gradient(145deg, ${palette.primary}, ${palette.secondary})`, color: palette.onPrimary }}
      >
        <svg viewBox="0 0 100 100" className="absolute -right-8 -top-8 size-40 opacity-20" aria-hidden>
          <path d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42 Z" fill="#fff" />
        </svg>
        <span className="relative text-xs font-bold uppercase tracking-[0.2em] opacity-80">Now live</span>
        <p className="relative break-words text-2xl font-bold leading-tight sm:text-[26px]" style={{ fontFamily: fontStack(palette.heading) }}>
          {kit.tagline}
        </p>
        <span className="relative text-sm font-semibold opacity-90">{domain(kit.name)}</span>
      </div>
      <figcaption className="px-3 py-2.5 text-[12px] leading-snug text-body">
        <span className="font-semibold text-ink">{handle(kit.name).slice(1)}</span> {kit.oneLinePitch}
      </figcaption>
    </figure>
  );
}

/** Front and back of a business card. */
export function BusinessCard({ kit, palette, concept }: { kit: BrandKit; palette: BrandPalette; concept: LogoConcept }) {
  return (
    <figure className="space-y-3" aria-label="Business card">
      <div className="grid aspect-[1.75] place-items-center rounded-2xl shadow-lift" style={{ backgroundColor: palette.dark }}>
        <BrandLogo concept={concept} name={kit.name} palette={palette} size={34} onDark />
      </div>
      <div className="flex aspect-[1.75] flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div>
          <p className="text-sm font-bold text-ink" style={{ fontFamily: fontStack(palette.heading) }}>
            Your Name
          </p>
          <p className="text-[11px] text-muted">Founder, {kit.name}</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="text-[11px] leading-relaxed text-body" style={{ fontFamily: fontStack(palette.body) }}>
            <p>hello@{domain(kit.name)}</p>
            <p>{domain(kit.name)}</p>
          </div>
          <span className="h-1.5 w-10 rounded-full" style={{ backgroundColor: palette.secondary }} aria-hidden />
        </div>
      </div>
    </figure>
  );
}

/** App icon on a phone home-screen tile. */
export function AppIcon({ kit, palette, concept }: { kit: BrandKit; palette: BrandPalette; concept: LogoConcept }) {
  return (
    <figure className="card flex flex-col items-center justify-center gap-6 p-6" style={{ background: `linear-gradient(180deg, ${palette.light}, #ffffff)` }}>
      <div className="grid grid-cols-3 gap-4" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) =>
          i === 4 ? (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="overflow-hidden rounded-[22%] shadow-lift">
                <LogoMark concept={concept === 'wordmark' || concept === 'orbit' ? 'monogram' : concept} name={kit.name} palette={palette} size={60} />
              </div>
              <span className="max-w-16 truncate text-[10px] font-medium text-ink">{kit.name}</span>
            </div>
          ) : (
            <div key={i} className="flex flex-col items-center gap-1.5 opacity-40">
              <div className="size-[60px] rounded-[22%] bg-[#e2e8f0]" />
              <span className="h-1.5 w-8 rounded-full bg-[#e2e8f0]" />
            </div>
          ),
        )}
      </div>
      <figcaption className="text-xs text-muted">App icon</figcaption>
    </figure>
  );
}

export function LaunchMockups({ kit, palette, concept }: { kit: BrandKit; palette: BrandPalette; concept: LogoConcept }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 [&>*]:mx-auto [&>*]:w-full [&>*]:max-w-sm">
      <InstagramPost kit={kit} palette={palette} concept={concept} />
      <BusinessCard kit={kit} palette={palette} concept={concept} />
      <AppIcon kit={kit} palette={palette} concept={concept} />
    </div>
  );
}
