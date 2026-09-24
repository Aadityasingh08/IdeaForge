import { z, type ZodType } from 'zod';
import type { BrandDNA, Stage, TrackedSection } from '../types/brandDNA';
import { LOGO_CONCEPTS } from '../types/brandDNA';
import { STAGES } from '../types/brandDNA';
import type { ChallengeTarget } from '../schemas/ai.schemas';

/** Blank sections so "Continue manually" works even when AI never produced a section. */
const BLANK: Record<string, () => unknown> = {
  idea: () => ({ rawIdea: '', problem: '', targetAudience: { primary: '', secondary: '' }, userNeed: '', context: '', opportunity: '', keyInsights: [], assumptions: [], openQuestions: [] }),
  positioning: () => ({ category: '', audience: '', problem: '', differentiator: '', valueProposition: '', competitiveAngle: '', statement: '', rationale: '', valuePropositionRationale: '' }),
  personality: () => ({ traits: [], traitsToAvoid: [], rationale: '' }),
  naming: () => ({ territories: [] }),
  messaging: () => ({ tagline: '', oneLinePitch: '', shortDescription: '', voice: [], tone: '', principles: [], rationale: '' }),
};

const str = z.string().trim().max(1000);
const strList = z.array(z.string().trim().min(1).max(300)).max(12);
const traits = z
  .array(z.object({ name: z.string().trim().min(1).max(40), reason: z.string().max(400), audienceFit: z.string().max(400) }))
  .max(6);

/** Fields a human may edit directly. Anything else is rejected with 400. */
export const EDITABLE_FIELDS: Record<string, ZodType> = {
  'idea.problem': str,
  'idea.userNeed': str,
  'idea.context': str,
  'idea.opportunity': str,
  'idea.targetAudience.primary': str,
  'idea.targetAudience.secondary': str,
  'idea.keyInsights': strList,
  'idea.assumptions': strList,
  'idea.openQuestions': strList,
  'positioning.category': str,
  'positioning.audience': str,
  'positioning.problem': str,
  'positioning.differentiator': str,
  'positioning.valueProposition': str,
  'positioning.competitiveAngle': str,
  'positioning.statement': str,
  'personality.traits': traits,
  'personality.traitsToAvoid': strList,
  'naming.selectedTerritory': str,
  'naming.selectedName': z.string().trim().min(1).max(60),
  'messaging.tagline': str,
  'messaging.oneLinePitch': str,
  'messaging.shortDescription': str,
  'messaging.tone': str,
  'messaging.voice': strList,
  'messaging.principles': strList,
  'logo.concept': z.enum(LOGO_CONCEPTS),
};

const TRACKED: TrackedSection[] = ['idea', 'positioning', 'personality', 'naming', 'messaging', 'visual', 'logo'];

/** Records that a section changed now (drives "out of date" warnings in the UI). */
export function touch(dna: BrandDNA, pathOrSection: string) {
  const section = pathOrSection.split('.')[0] as TrackedSection;
  if (!TRACKED.includes(section)) return;
  dna.meta ??= { updatedAt: {} };
  dna.meta.updatedAt[section] = new Date().toISOString();
}

/** Selections are decisions, not edits — they do not lock a field against regeneration. */
const SELECTION_FIELDS = new Set(['naming.selectedTerritory', 'naming.selectedName', 'logo.concept']);
export const isSelectionField = (path: string) => SELECTION_FIELDS.has(path);

export function getPath(dna: BrandDNA, path: string): unknown {
  return path.split('.').reduce<unknown>((obj, key) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined), dna);
}

export function setPath(dna: BrandDNA, path: string, value: unknown) {
  const [section, ...rest] = path.split('.');
  const root = dna as unknown as Record<string, unknown>;
  if (!root[section]) root[section] = BLANK[section]?.() ?? {};
  let cursor = root[section] as Record<string, unknown>;
  for (let i = 0; i < rest.length - 1; i++) {
    if (!cursor[rest[i]] || typeof cursor[rest[i]] !== 'object') cursor[rest[i]] = {};
    cursor = cursor[rest[i]] as Record<string, unknown>;
  }
  cursor[rest[rest.length - 1]] = value;
}

export function applyChallengeValue(dna: BrandDNA, target: ChallengeTarget, value: string) {
  if (target === 'general') return;
  setPath(dna, target, value);
}

export const addUnique = (list: string[], value: string) => (list.includes(value) ? list : [...list, value]);

/** Removes human locks on a section when the human explicitly asks to regenerate it. */
export function releaseSection(dna: BrandDNA, section: string) {
  dna.decisions.edited = dna.decisions.edited.filter((p) => !p.startsWith(`${section}.`));
  dna.decisions.accepted = dna.decisions.accepted.filter((p) => p !== section && !p.startsWith(`${section}.`));
}

/** Stages only move forward automatically; users can still revisit any stage. */
export function advanceStage(current: Stage, next: Stage): Stage {
  return STAGES.indexOf(next) > STAGES.indexOf(current) ? next : current;
}
