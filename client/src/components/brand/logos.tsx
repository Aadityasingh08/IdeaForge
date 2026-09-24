import { useEffect, useId } from 'react';
import { Check } from 'lucide-react';
import type { LogoConcept } from '../../lib/types';
import { fontStack, type BrandPalette } from '../../lib/palette';
import { loadGoogleFont } from '../../lib/format';

export const LOGO_CONCEPTS: { key: LogoConcept; label: string; idea: string }[] = [
  { key: 'monogram', label: 'Monogram', idea: 'A bold initial in a soft tile — works as an app icon.' },
  { key: 'spark', label: 'Spark', idea: 'A faceted spark: the moment an idea clicks.' },
  { key: 'orbit', label: 'Orbit', idea: 'An initial held by a ring — community and connection.' },
  { key: 'wordmark', label: 'Wordmark', idea: 'The name itself, with a signature accent.' },
];

const initial = (name: string) => (name.trim().charAt(0) || 'I').toUpperCase();

/** The brand mark alone (no name) — used for icons, avatars and favicons. */
export function LogoMark({ concept, name, palette, size = 64 }: { concept: LogoConcept; name: string; palette: BrandPalette; size?: number }) {
  const id = useId().replace(/:/g, '');
  const grad = `g${id}`;
  const { primary, secondary, onPrimary } = palette;
  const font = fontStack(palette.heading);

  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={secondary} />
          <stop offset="1" stopColor={primary} />
        </linearGradient>
      </defs>
      {concept === 'monogram' && (
        <>
          <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${grad})`} />
          <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fontFamily={font} fontWeight="700" fontSize="32" fill={onPrimary}>
            {initial(name)}
          </text>
        </>
      )}
      {concept === 'spark' && (
        <>
          <path d="M32 3 L37.5 26.5 L61 32 L37.5 37.5 L32 61 L26.5 37.5 L3 32 L26.5 26.5 Z" fill={`url(#${grad})`} />
          <path d="M32 3 L37.5 26.5 L32 32 Z M61 32 L37.5 37.5 L32 32 Z M32 61 L26.5 37.5 L32 32 Z M3 32 L26.5 26.5 L32 32 Z" fill="#fff" fillOpacity=".32" />
        </>
      )}
      {concept === 'orbit' && (
        <>
          <circle cx="32" cy="32" r="27" fill="none" stroke={`url(#${grad})`} strokeWidth="5" />
          <circle cx="51" cy="13" r="6" fill={secondary} stroke="#fff" strokeWidth="2.5" />
          <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fontFamily={font} fontWeight="700" fontSize="26" fill={palette.dark}>
            {initial(name)}
          </text>
        </>
      )}
      {concept === 'wordmark' && (
        <>
          <rect x="2" y="2" width="60" height="60" rx="30" fill={palette.dark} />
          <text x="30" y="33" textAnchor="middle" dominantBaseline="central" fontFamily={font} fontWeight="700" fontSize="30" fill="#fff">
            {initial(name).toLowerCase()}
          </text>
          <circle cx="45" cy="42" r="4.5" fill={secondary} />
        </>
      )}
    </svg>
  );
}

/** Full lockup: mark + name (or the styled name alone for the wordmark concept). */
export function BrandLogo({
  concept,
  name,
  palette,
  size = 48,
  layout = 'horizontal',
  onDark = false,
}: {
  concept: LogoConcept;
  name: string;
  palette: BrandPalette;
  size?: number;
  layout?: 'horizontal' | 'stacked';
  onDark?: boolean;
}) {
  useEffect(() => loadGoogleFont(palette.heading), [palette.heading]);
  const color = onDark ? '#FFFFFF' : palette.dark;
  const font = fontStack(palette.heading);

  if (concept === 'wordmark') {
    return (
      <span className="inline-flex items-baseline font-bold tracking-tight" style={{ fontFamily: font, color, fontSize: size * 0.75, lineHeight: 1 }}>
        {name.toLowerCase()}
        <span className="rounded-full" style={{ width: size * 0.16, height: size * 0.16, backgroundColor: palette.secondary, marginLeft: size * 0.05 }} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${layout === 'stacked' ? 'flex-col gap-3' : 'gap-3'}`}>
      <LogoMark concept={concept} name={name} palette={palette} size={size} />
      <span className="font-bold tracking-tight" style={{ fontFamily: font, color, fontSize: size * 0.6, lineHeight: 1 }}>
        {name}
      </span>
    </span>
  );
}

/** Lets the user choose a logo concept; the choice is saved to BrandDNA. */
export function LogoPicker({
  name,
  palette,
  value,
  onChange,
  disabled,
}: {
  name: string;
  palette: BrandPalette;
  value: LogoConcept;
  onChange: (c: LogoConcept) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Logo concept">
      {LOGO_CONCEPTS.map((c) => {
        const active = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(c.key)}
            className={`card relative flex flex-col items-start gap-4 p-5 text-left transition-all hover:shadow-lift ${active ? 'border-mint shadow-glow' : ''}`}
          >
            {active && (
              <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-mint text-white">
                <Check className="size-3.5" aria-hidden />
              </span>
            )}
            <div className="grid h-20 w-full place-items-center rounded-xl" style={{ backgroundColor: `${palette.light}` }}>
              <BrandLogo concept={c.key} name={name} palette={palette} size={40} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{c.label}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-body">{c.idea}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
