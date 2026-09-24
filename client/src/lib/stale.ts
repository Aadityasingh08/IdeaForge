import type { BrandDNA, TrackedSection } from './types';

const LABEL: Record<TrackedSection, string> = {
  idea: 'idea',
  positioning: 'positioning',
  personality: 'personality',
  naming: 'name',
  messaging: 'messaging',
  visual: 'visual identity',
  logo: 'logo',
};

/** Sections that changed after `since` — i.e. downstream work built before those changes. */
function changedAfter(dna: BrandDNA, since: string | undefined, sections: TrackedSection[]): string[] {
  if (!since) return [];
  const t = new Date(since).getTime();
  const updated = dna.meta?.updatedAt ?? {};
  // Small tolerance: a stage's own save lands a few ms after its timestamp.
  return sections.filter((s) => updated[s] && new Date(updated[s]!).getTime() > t + 1500).map((s) => LABEL[s]);
}

const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0]);

/** Visual identity is out of date when the strategy it was derived from changed afterwards. */
export function visualStaleness(dna: BrandDNA): string | null {
  const changed = changedAfter(dna, dna.meta?.updatedAt.visual, ['positioning', 'personality']);
  return changed.length ? `Your ${list(changed)} changed after this visual direction was created.` : null;
}

/** The brand kit is out of date when anything it was compiled from changed afterwards. */
export function kitStaleness(dna: BrandDNA): string | null {
  const changed = changedAfter(dna, dna.brandKit?.generatedAt, ['positioning', 'personality', 'naming', 'messaging', 'visual']);
  return changed.length ? `Your ${list(changed)} changed after this kit was built.` : null;
}
