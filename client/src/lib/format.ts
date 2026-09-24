export function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString();
}

export const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Relative luminance to pick readable text on a colour swatch. */
export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const isLight = (hex: string) => luminance(hex) > 0.45;

const loadedFonts = new Set<string>(['Inter']);

/** Loads a Google Font on demand for typography previews. Fails silently to a system fallback. */
export function loadGoogleFont(family: string) {
  if (!family || loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

export const TARGET_LABEL: Record<string, string> = {
  'positioning.category': 'Category',
  'positioning.audience': 'Target audience',
  'positioning.differentiator': 'Differentiator',
  'positioning.valueProposition': 'Value proposition',
  'positioning.competitiveAngle': 'Competitive angle',
  'positioning.statement': 'Positioning statement',
  'messaging.tagline': 'Tagline',
  'messaging.oneLinePitch': 'One-line pitch',
  'messaging.shortDescription': 'Short description',
  'naming.selectedName': 'Brand name',
  general: 'Overall strategy',
};

export const ISSUE_LABEL: Record<string, string> = {
  generic_language: 'Generic language',
  weak_differentiation: 'Weak differentiation',
  audience_too_broad: 'Audience too broad',
  unclear_value_proposition: 'Unclear value proposition',
  contradictory_positioning: 'Contradictory positioning',
  personality_mismatch: 'Personality mismatch',
  naming_weakness: 'Naming weakness',
  messaging_inconsistency: 'Messaging inconsistency',
  cliched_language: 'Clichéd language',
  visual_conflict: 'Visual conflict',
};

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}
