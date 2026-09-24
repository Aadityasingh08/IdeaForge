import type {
  AlternativesOutput,
  BrandKitOutput,
  ChallengeTarget,
  ConsistencyOutput,
  VisualCheckOutput,
} from '../schemas/ai.schemas';

/**
 * BrandDNA — the single source of truth for a project's brand.
 * Every stage reads from it and writes only its own section.
 * Sections are optional because they are filled progressively.
 */

export type Stage = 'understand' | 'strategy' | 'challenge' | 'visual' | 'brand-kit' | 'complete';
export const STAGES: Stage[] = ['understand', 'strategy', 'challenge', 'visual', 'brand-kit', 'complete'];

export interface IdeaSection {
  rawIdea: string;
  problem: string;
  targetAudience: { primary: string; secondary?: string };
  userNeed: string;
  context?: string;
  opportunity: string;
  keyInsights: string[];
  assumptions: string[];
  openQuestions: string[];
}

export interface PositioningSection {
  category: string;
  audience: string;
  problem: string;
  differentiator: string;
  valueProposition: string;
  competitiveAngle: string;
  statement: string;
  rationale: string;
  valuePropositionRationale: string;
}

export interface PersonalitySection {
  traits: { name: string; reason: string; audienceFit: string }[];
  traitsToAvoid: string[];
  rationale: string;
}

export interface NamingSection {
  territories: { name: string; concept: string; rationale: string; examples: string[]; risks: string[] }[];
  selectedTerritory?: string;
  selectedName?: string;
}

export interface MessagingSection {
  tagline: string;
  oneLinePitch: string;
  shortDescription: string;
  voice: string[];
  tone: string;
  principles: string[];
  rationale: string;
}

export interface VisualSection {
  colors: { name: string; hex: string; usage: string }[];
  typography: { heading: string; body: string; rationale: string };
  mood: string[];
  imagery: string[];
  shapes: string[];
  composition: string[];
  principles: string[];
  avoid: string[];
  rationale: string;
}

export const LOGO_CONCEPTS = ['monogram', 'spark', 'orbit', 'wordmark'] as const;
export type LogoConcept = (typeof LOGO_CONCEPTS)[number];

export type TrackedSection = 'idea' | 'positioning' | 'personality' | 'naming' | 'messaging' | 'visual' | 'logo';

export type ChallengeResolution = 'accepted' | 'kept_original' | 'alternative' | 'edited';

export interface ChallengeItem {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  target: ChallengeTarget;
  suggestedValue: string;
  resolved: boolean;
  resolution?: ChallengeResolution;
  originalValue?: string;
  appliedValue?: string;
  alternatives?: AlternativesOutput['alternatives'];
  resolvedAt?: string;
}

export interface ChallengeSummary {
  overallAssessment: string;
  recommendedDirection: {
    statement: string;
    target: ChallengeTarget;
    whyItWorks: string[];
    improvements: string[];
    resolution?: ChallengeResolution;
    appliedValue?: string;
  } | null;
  ranAt: string;
}

export interface BrandDNA {
  idea: IdeaSection | { rawIdea: string };
  positioning?: PositioningSection;
  personality?: PersonalitySection;
  naming?: NamingSection;
  messaging?: MessagingSection;
  visual?: VisualSection;
  visualCheck?: VisualCheckOutput & { ranAt: string };
  challenges: ChallengeItem[];
  challengeSummary?: ChallengeSummary;
  consistency?: ConsistencyOutput & { ranAt: string };
  brandKit?: BrandKitOutput & { generatedAt: string };
  finalBrand?: { name: string; tagline: string; summary: string };
  logo?: { concept: LogoConcept };
  /** When each section last changed — lets the UI flag downstream work that is out of date. */
  meta?: { updatedAt: Partial<Record<TrackedSection, string>> };
  /** Human decisions — AI treats edited fields as fixed and must build on them. */
  decisions: {
    edited: string[];
    accepted: string[];
  };
}

export const emptyBrandDNA = (rawIdea: string): BrandDNA => ({
  idea: { rawIdea },
  challenges: [],
  decisions: { edited: [], accepted: [] },
});

export const hasFullIdea = (idea: BrandDNA['idea']): idea is IdeaSection => 'problem' in idea && !!idea.problem;
