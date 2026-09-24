import { z } from 'zod';

/**
 * Every AI stage returns JSON that must pass one of these schemas before it
 * is allowed anywhere near BrandDNA. Schemas intentionally avoid exotic
 * constraints so they translate cleanly to JSON Schema for structured output;
 * semantic checks (array sizes, hex colours) are enforced with refinements.
 */

const text = z.string().min(1);
const list = z.array(z.string());
const nonEmptyList = list.refine((a) => a.length > 0, 'must contain at least one item');

// ---------- Stage 1: Understand ----------
export const UnderstandSchema = z.object({
  problem: text,
  targetAudience: z.object({ primary: text, secondary: z.string() }),
  userNeed: text,
  context: z.string(),
  opportunity: text,
  keyInsights: nonEmptyList,
  assumptions: list,
  openQuestions: list,
});

// ---------- Stage 2: Strategy (four separate AI responsibilities) ----------
export const PositioningSchema = z.object({
  category: text,
  audience: text,
  problem: text,
  differentiator: text,
  valueProposition: text,
  competitiveAngle: text,
  statement: text,
  rationale: text,
  valuePropositionRationale: text,
});

export const PersonalitySchema = z.object({
  traits: z
    .array(z.object({ name: text, reason: text, audienceFit: text }))
    .refine((a) => a.length >= 3 && a.length <= 5, 'provide 3–5 traits'),
  traitsToAvoid: nonEmptyList,
  rationale: text,
});

export const NamingSchema = z.object({
  territories: z
    .array(
      z.object({
        name: text,
        concept: text,
        rationale: text,
        examples: nonEmptyList,
        risks: list,
      }),
    )
    .refine((a) => a.length >= 2 && a.length <= 4, 'provide 2–4 territories'),
});

export const MessagingSchema = z.object({
  tagline: text,
  oneLinePitch: text,
  shortDescription: text,
  voice: nonEmptyList,
  tone: text,
  principles: nonEmptyList,
  rationale: text,
});

// ---------- Stage 3: Challenge ----------
export const CHALLENGE_TYPES = [
  'generic_language',
  'weak_differentiation',
  'audience_too_broad',
  'unclear_value_proposition',
  'contradictory_positioning',
  'personality_mismatch',
  'naming_weakness',
  'messaging_inconsistency',
  'cliched_language',
  'visual_conflict',
] as const;

/** BrandDNA string fields a challenge recommendation is allowed to rewrite. */
export const CHALLENGE_TARGETS = [
  'positioning.category',
  'positioning.audience',
  'positioning.differentiator',
  'positioning.valueProposition',
  'positioning.competitiveAngle',
  'positioning.statement',
  'messaging.tagline',
  'messaging.oneLinePitch',
  'messaging.shortDescription',
  'naming.selectedName',
  'general',
] as const;
export type ChallengeTarget = (typeof CHALLENGE_TARGETS)[number];

export const ChallengeSchema = z.object({
  overallAssessment: text,
  issues: z.array(
    z.object({
      type: z.enum(CHALLENGE_TYPES),
      severity: z.enum(['low', 'medium', 'high']),
      title: text,
      description: text,
      evidence: text,
      recommendation: text,
      target: z.enum(CHALLENGE_TARGETS),
      suggestedValue: z.string(),
    }),
  ),
  recommendedDirection: z
    .object({
      statement: text,
      target: z.enum(CHALLENGE_TARGETS),
      whyItWorks: list,
      improvements: list,
    })
    .nullable(),
});

export const AlternativesSchema = z.object({
  alternatives: z
    .array(z.object({ statement: text, rationale: text, difference: text }))
    .refine((a) => a.length === 3, 'provide exactly 3 alternatives'),
});

// ---------- Stage 4: Visual identity ----------
const HEX = /^#[0-9a-fA-F]{6}$/;

export const VisualSchema = z.object({
  colors: z
    .array(
      z.object({
        name: text,
        hex: z.string().refine((h) => HEX.test(h), 'hex must look like #14B8A6'),
        usage: text,
      }),
    )
    .refine((a) => a.length >= 4 && a.length <= 6, 'provide 4–6 colours'),
  typography: z.object({ heading: text, body: text, rationale: text }),
  mood: nonEmptyList,
  imagery: nonEmptyList,
  shapes: nonEmptyList,
  composition: nonEmptyList,
  principles: nonEmptyList,
  avoid: nonEmptyList,
  rationale: text,
});

export const VisualCheckSchema = z.object({
  consistent: z.boolean(),
  issues: list,
});

// ---------- Stage 5: Brand kit + consistency guardian ----------
export const BrandKitSchema = z.object({
  name: text,
  tagline: text,
  oneLinePitch: text,
  brandSummary: text,
  positioning: text,
  audience: text,
  personality: nonEmptyList,
  voice: nonEmptyList,
  visualSummary: text,
  launchHeadline: text,
  launchDescription: text,
  shortDescription: text,
  cta: text,
  socialLaunchPost: text,
});

export const CONSISTENCY_AREAS = [
  'Name ↔ Positioning',
  'Positioning ↔ Personality',
  'Personality ↔ Voice',
  'Positioning ↔ Messaging',
  'Visual ↔ Personality',
  'Launch Copy ↔ Positioning',
] as const;

export const HEALTH_SIGNALS = [
  'Clear positioning',
  'Defined audience',
  'Consistent personality',
  'Distinctive messaging',
  'Visual alignment',
] as const;

const status = z.enum(['pass', 'warning', 'fail']);

export const ConsistencySchema = z.object({
  consistent: z.boolean(),
  checks: z.array(z.object({ area: text, status, explanation: text, recommendation: z.string() })).refine(
    (a) => a.length >= 3,
    'provide a check for every area',
  ),
  health: z.array(z.object({ label: text, status, note: z.string() })),
  recommendations: list,
});

export type UnderstandOutput = z.infer<typeof UnderstandSchema>;
export type PositioningOutput = z.infer<typeof PositioningSchema>;
export type PersonalityOutput = z.infer<typeof PersonalitySchema>;
export type NamingOutput = z.infer<typeof NamingSchema>;
export type MessagingOutput = z.infer<typeof MessagingSchema>;
export type ChallengeOutput = z.infer<typeof ChallengeSchema>;
export type AlternativesOutput = z.infer<typeof AlternativesSchema>;
export type VisualOutput = z.infer<typeof VisualSchema>;
export type VisualCheckOutput = z.infer<typeof VisualCheckSchema>;
export type BrandKitOutput = z.infer<typeof BrandKitSchema>;
export type ConsistencyOutput = z.infer<typeof ConsistencySchema>;
