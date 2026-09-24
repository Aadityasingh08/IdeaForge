import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { isLight, loadGoogleFont } from '../../lib/format';
import { copyText } from '../ui/CopyButton';
import { useToast } from '../ui/Toast';
import { Sparkle } from '../ui/Logo';

export function BrandTrait({ name, reason, tone = 'mint' }: { name: string; reason?: string; tone?: 'mint' | 'muted' }) {
  if (tone === 'muted') {
    return (
      <span className="inline-flex items-center rounded-full border border-line bg-[#f8fafc] px-3 py-1 text-[13px] font-medium text-muted line-through decoration-[#cbd5e1]">
        {name}
      </span>
    );
  }
  return (
    <div className="card flex h-full flex-col p-4 transition-shadow hover:shadow-lift">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-mint-50 to-[#ecfeff] px-3 py-1 text-sm font-semibold text-mint-dark ring-1 ring-inset ring-[#99f6e4]">
        <Sparkle className="size-3" />
        {name}
      </span>
      {reason && <p className="mt-3 text-sm leading-relaxed text-body">{reason}</p>}
    </div>
  );
}

/** A colour swatch; clicking copies the HEX value with a "Copied" state. */
export function ColorSwatch({ name, hex, usage, large = false }: { name: string; hex: string; usage?: string; large?: boolean }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const light = isLight(hex);

  const copy = async () => {
    if (await copyText(hex)) {
      setCopied(true);
      toast(`${hex} copied`);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${name} ${hex}`}
      className="group card overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div
        className={`relative flex items-end p-3 ${large ? 'h-32' : 'h-24'} ${light ? 'text-ink' : 'text-white'}`}
        style={{ backgroundColor: hex, boxShadow: light ? 'inset 0 0 0 1px rgb(15 23 42 / 0.06)' : undefined }}
      >
        <span
          className={`absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-opacity ${
            copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          } ${light ? 'bg-ink/80 text-white' : 'bg-white/90 text-ink'}`}
        >
          {copied ? (
            <>
              <Check className="size-3" aria-hidden /> Copied
            </>
          ) : (
            'Copy'
          )}
        </span>
        <span className="font-mono text-xs font-semibold tracking-wide">{hex}</span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-ink">{name}</p>
        {usage && <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{usage}</p>}
      </div>
    </button>
  );
}

export function ColorPalette({ colors }: { colors: { name: string; hex: string; usage: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {colors.map((c, i) => (
        <ColorSwatch key={`${c.hex}-${i}`} {...c} large={i === 0} />
      ))}
    </div>
  );
}

/** Live typography preview using the actual recommended Google Fonts. */
export function TypographyPreview({
  heading,
  body,
  brandName,
  line,
  accent = '#0F766E',
}: {
  heading: string;
  body: string;
  brandName: string;
  line: string;
  accent?: string;
}) {
  useEffect(() => {
    loadGoogleFont(heading);
    loadGoogleFont(body);
  }, [heading, body]);
  const hf = `'${heading}', ui-sans-serif, system-ui, sans-serif`;
  const bf = `'${body}', ui-sans-serif, system-ui, sans-serif`;

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="card flex flex-col justify-between gap-6 p-5">
        <div className="flex items-baseline gap-4">
          <span className="text-6xl font-bold leading-none text-ink" style={{ fontFamily: hf }}>
            Aa
          </span>
          <span className="text-4xl leading-none text-body" style={{ fontFamily: bf }}>
            Aa
          </span>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3 border-b border-line pb-2">
            <dt className="text-muted">Heading</dt>
            <dd className="font-semibold text-ink">{heading}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Body</dt>
            <dd className="font-semibold text-ink">{body}</dd>
          </div>
        </dl>
      </div>
      <div className="card overflow-hidden p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: bf, color: accent }}>
          {brandName}
        </p>
        <p className="mt-3 break-words text-[28px] font-bold leading-[1.1] tracking-tight text-ink sm:text-[34px]" style={{ fontFamily: hf }}>
          {line}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-body" style={{ fontFamily: bf }}>
          The quick brown fox jumps over the lazy dog. Clear, readable body copy carries the details while headlines carry the
          personality.
        </p>
      </div>
    </div>
  );
}

/** Small abstract CSS/SVG illustrations for visual direction cards — no external images. */
export function AbstractArt({ variant, colors }: { variant: 'imagery' | 'shapes' | 'composition' | 'principles' | 'avoid' | 'mood'; colors: string[] }) {
  const [a = '#14B8A6', b = '#22D3EE', c = '#A7F3D0'] = colors;
  const common = 'h-20 w-full rounded-xl';
  switch (variant) {
    case 'imagery':
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <rect width="200" height="80" fill={c} opacity=".35" />
          <circle cx="150" cy="22" r="12" fill={b} opacity=".8" />
          <path d="M0 80 L55 35 L95 62 L130 40 L200 80 Z" fill={a} opacity=".85" />
          <path d="M40 80 L90 50 L140 80 Z" fill={b} opacity=".6" />
        </svg>
      );
    case 'shapes':
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <rect width="200" height="80" fill="#F8FAFC" />
          <rect x="24" y="18" width="46" height="46" rx="12" fill={a} />
          <circle cx="104" cy="41" r="23" fill={b} opacity=".85" />
          <rect x="140" y="22" width="40" height="40" rx="20" fill={c} />
        </svg>
      );
    case 'composition':
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <rect width="200" height="80" fill="#F8FAFC" />
          <rect x="20" y="16" width="70" height="8" rx="4" fill={a} />
          <rect x="20" y="32" width="100" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="20" y="43" width="84" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="20" y="56" width="36" height="12" rx="6" fill="#0F172A" />
          <rect x="136" y="14" width="46" height="54" rx="10" fill={b} opacity=".7" />
        </svg>
      );
    case 'principles':
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <rect width="200" height="80" fill="#F8FAFC" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${30 + i * 55} 40)`}>
              <circle r="16" fill={[a, b, c][i]} opacity=".85" />
              <path d="M-6 0 L-1.5 4.5 L6.5 -4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </svg>
      );
    case 'avoid':
      return (
        <svg viewBox="0 0 200 80" className={common} aria-hidden>
          <rect width="200" height="80" fill="#FEF2F2" />
          <rect x="30" y="20" width="40" height="40" fill="#334155" transform="rotate(12 50 40)" />
          <circle cx="110" cy="40" r="18" fill="#F87171" opacity=".6" />
          <path d="M150 22 L178 58 M178 22 L150 58" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <div className={common} style={{ background: `linear-gradient(135deg, ${c}, ${b} 55%, ${a})` }} aria-hidden />
      );
  }
}
