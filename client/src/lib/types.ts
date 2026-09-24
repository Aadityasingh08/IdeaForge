// Mirrors server/src/types/brandDNA.ts — the single source of truth for a brand.

export type Stage = 'understand' | 'strategy' | 'challenge' | 'visual' | 'brand-kit' | 'complete';
export type Severity = 'low' | 'medium' | 'high';
export type CheckStatus = 'pass' | 'warning' | 'fail';

export type ChallengeTarget =
  | 'positioning.category'
  | 'positioning.audience'
  | 'positioning.differentiator'
  | 'positioning.valueProposition'
  | 'positioning.competitiveAngle'
  | 'positioning.statement'
  | 'messaging.tagline'
  | 'messaging.oneLinePitch'
  | 'messaging.shortDescription'
  | 'naming.selectedName'
  | 'general';

export interface IdeaSection {
  rawIdea: string;
  problem?: string;
  targetAudience?: { primary: string; secondary?: string };
  userNeed?: string;
  context?: string;
  opportunity?: string;
  keyInsights?: string[];
  assumptions?: string[];
  openQuestions?: string[];
}

export interface Positioning {
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

export interface Trait {
  name: string;
  reason: string;
  audienceFit: string;
}

export interface Personality {
  traits: Trait[];
  traitsToAvoid: string[];
  rationale: string;
}

export interface Territory {
  name: string;
  concept: string;
  rationale: string;
  examples: string[];
  risks: string[];
}

export interface Naming {
  territories: Territory[];
  selectedTerritory?: string;
  selectedName?: string;
}

export interface Messaging {
  tagline: string;
  oneLinePitch: string;
  shortDescription: string;
  voice: string[];
  tone: string;
  principles: string[];
  rationale: string;
}

export interface Visual {
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

export type Resolution = 'accepted' | 'kept_original' | 'alternative' | 'edited';

export interface Alternative {
  statement: string;
  rationale: string;
  difference: string;
}

export interface ChallengeItem {
  id: string;
  type: string;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  target: ChallengeTarget;
  suggestedValue: string;
  resolved: boolean;
  resolution?: Resolution;
  originalValue?: string;
  appliedValue?: string;
  alternatives?: Alternative[];
  resolvedAt?: string;
}

export interface RecommendedDirection {
  statement: string;
  target: ChallengeTarget;
  whyItWorks: string[];
  improvements: string[];
  resolution?: Resolution;
  appliedValue?: string;
}

export interface BrandKit {
  name: string;
  tagline: string;
  oneLinePitch: string;
  brandSummary: string;
  positioning: string;
  audience: string;
  personality: string[];
  voice: string[];
  visualSummary: string;
  launchHeadline: string;
  launchDescription: string;
  shortDescription: string;
  cta: string;
  socialLaunchPost: string;
  generatedAt: string;
}

export interface Consistency {
  consistent: boolean;
  checks: { area: string; status: CheckStatus; explanation: string; recommendation: string }[];
  health: { label: string; status: CheckStatus; note: string }[];
  recommendations: string[];
  ranAt: string;
}

export interface BrandDNA {
  idea: IdeaSection;
  positioning?: Positioning;
  personality?: Personality;
  naming?: Naming;
  messaging?: Messaging;
  visual?: Visual;
  visualCheck?: { consistent: boolean; issues: string[]; ranAt: string };
  challenges: ChallengeItem[];
  challengeSummary?: { overallAssessment: string; recommendedDirection: RecommendedDirection | null; ranAt: string };
  consistency?: Consistency;
  brandKit?: BrandKit;
  finalBrand?: { name: string; tagline: string; summary: string };
  decisions: { edited: string[]; accepted: string[] };
}

export interface Project {
  _id: string;
  name: string;
  rawIdea: string;
  currentStage: Stage;
  brandDNA: BrandDNA;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  _id: string;
  name: string;
  rawIdea: string;
  currentStage: Stage;
  tagline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIRunSummary {
  _id: string;
  stage: string;
  task: string;
  status: 'running' | 'success' | 'failed';
  duration?: number;
  provider: string;
  createdAt: string;
}

export type StrategySection = 'positioning' | 'personality' | 'naming' | 'messaging';
