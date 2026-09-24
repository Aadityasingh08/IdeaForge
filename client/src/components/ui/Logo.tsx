import { useId } from 'react';
import { Link } from 'react-router-dom';

const C = [12, 12];
const PTS = {
  T: [12, 0.5],
  R: [23.5, 12],
  B: [12, 23.5],
  L: [0.5, 12],
  TR: [14.4, 9.6],
  BR: [14.4, 14.4],
  BL: [9.6, 14.4],
  TL: [9.6, 9.6],
};
const tri = (a: number[], b: number[]) => `M${a.join(',')} L${b.join(',')} L${C.join(',')} Z`;

/** The IdeaForge faceted four-point sparkle. Used for the logo, AI states, loaders and insights. */
export function Sparkle({ className = 'size-6', animated = false, mono = false }: { className?: string; animated?: boolean; mono?: boolean }) {
  const id = useId().replace(/:/g, '');
  const light = mono ? 'currentColor' : `url(#l${id})`;
  const dark = mono ? 'currentColor' : `url(#d${id})`;
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${animated ? 'animate-sparkle' : ''}`} aria-hidden="true">
      {!mono && (
        <defs>
          <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A5F3FC" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id={`d${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14B8A6" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>
        </defs>
      )}
      <path d={tri(PTS.T, PTS.TR)} fill={light} />
      <path d={tri(PTS.TR, PTS.R)} fill={dark} />
      <path d={tri(PTS.R, PTS.BR)} fill={light} opacity={mono ? 0.7 : 1} />
      <path d={tri(PTS.BR, PTS.B)} fill={dark} />
      <path d={tri(PTS.B, PTS.BL)} fill={light} opacity={mono ? 0.7 : 1} />
      <path d={tri(PTS.BL, PTS.L)} fill={dark} />
      <path d={tri(PTS.L, PTS.TL)} fill={light} opacity={mono ? 0.7 : 1} />
      <path d={tri(PTS.TL, PTS.T)} fill={dark} />
    </svg>
  );
}

export function Logo({ to = '/', compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 rounded-lg" aria-label="IdeaForge home">
      <span className="grid size-8 place-items-center rounded-[10px] bg-ink shadow-soft transition-transform duration-300 group-hover:rotate-45">
        <Sparkle className="size-[18px]" />
      </span>
      {!compact && <span className="text-[17px] font-bold tracking-tight text-ink">IdeaForge</span>}
    </Link>
  );
}
