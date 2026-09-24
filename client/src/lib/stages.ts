import type { BrandDNA, Stage } from './types';

export type StageKey = Exclude<Stage, 'complete'>;

export const STAGES: { key: StageKey; num: string; label: string; path: string; story: string }[] = [
  { key: 'understand', num: '01', label: 'Understand', path: 'understand', story: 'Let’s understand it.' },
  { key: 'strategy', num: '02', label: 'Strategy', path: 'strategy', story: 'Let’s find the strategic opportunity.' },
  { key: 'challenge', num: '03', label: 'Challenge', path: 'challenge', story: 'Wait — this decision may be generic.' },
  { key: 'visual', num: '04', label: 'Visual', path: 'visual', story: 'Now let’s make the visual identity.' },
  { key: 'brand-kit', num: '05', label: 'Brand Kit', path: 'brand-kit', story: 'Your complete brand is ready.' },
];

export const STAGE_LABEL: Record<Stage, string> = {
  understand: 'Understand',
  strategy: 'Strategy',
  challenge: 'Challenge',
  visual: 'Visual',
  'brand-kit': 'Brand Kit',
  complete: 'Complete',
};

/** A stage is complete when it has usable data — derived from BrandDNA, never guessed. */
export function isStageComplete(dna: BrandDNA, stage: StageKey): boolean {
  switch (stage) {
    case 'understand':
      return !!dna.idea.problem;
    case 'strategy':
      return !!(dna.positioning && dna.personality && dna.naming && dna.messaging);
    case 'challenge':
      return !!dna.challengeSummary;
    case 'visual':
      return !!dna.visual;
    case 'brand-kit':
      return !!dna.brandKit;
  }
}

export function stageStatuses(dna: BrandDNA) {
  const done = STAGES.map((s) => isStageComplete(dna, s.key));
  const firstOpen = done.findIndex((d) => !d);
  return STAGES.map((s, i) => ({
    ...s,
    complete: done[i],
    // Users can move to any completed stage or the next one — never blocked unnecessarily.
    available: done[i] || firstOpen === -1 || i <= firstOpen,
  }));
}

export const completedCount = (dna: BrandDNA) => STAGES.filter((s) => isStageComplete(dna, s.key)).length;

/** Loading copy for each AI operation — never a bare "Loading…". */
export const LOADING_MESSAGES: Record<string, string[]> = {
  understand: ['Reading between the lines…', 'Finding the core problem…', 'Identifying your audience…', 'Looking for opportunities…'],
  strategy: ['Building your strategic foundation…', 'Finding your differentiation…', 'Shaping your positioning…', 'Defining your personality…', 'Exploring naming territories…', 'Writing your messaging…'],
  positioning: ['Revisiting your positioning…', 'Finding your differentiation…', 'Shaping your positioning…'],
  personality: ['Reading your audience…', 'Defining your personality…'],
  naming: ['Exploring naming territories…', 'Testing names against your strategy…'],
  messaging: ['Finding your voice…', 'Writing your messaging…'],
  challenge: ['Stress-testing your brand…', 'Looking for generic thinking…', 'Checking audience fit…', 'Finding inconsistencies…'],
  alternatives: ['Exploring different angles…', 'Making sure each option is distinct…'],
  visual: ['Translating strategy into visuals…', 'Finding your visual language…', 'Building your identity…', 'Checking visual consistency…'],
  'brand-kit': ['Bringing everything together…', 'Checking brand consistency…', 'Preparing your brand kit…'],
  consistency: ['Checking brand consistency…', 'Comparing voice, visuals and positioning…'],
};
