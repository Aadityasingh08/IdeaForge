import type { ZodType } from 'zod';
import { AIProviderError, validateOutput, type AIProvider, type AIRequestOptions } from './AIProvider';
import { capitalize as cap, coinNames, parseIdea, withArticle, type ParsedIdea } from '../fallback/ideaParser';
import { hasFullIdea, type BrandDNA } from '../../types/brandDNA';
import type {
  AlternativesOutput,
  BrandKitOutput,
  ChallengeOutput,
  ChallengeTarget,
  ConsistencyOutput,
  MessagingOutput,
  NamingOutput,
  PersonalityOutput,
  PositioningOutput,
  UnderstandOutput,
  VisualCheckOutput,
  VisualOutput,
} from '../../schemas/ai.schemas';

/**
 * Development/demo fallback. It runs the exact same workflow as the real model:
 * deterministic output derived from the user's idea and the current BrandDNA,
 * serialised to JSON and validated with the same Zod schemas.
 */
export class FallbackProvider implements AIProvider {
  readonly name = 'fallback' as const;
  readonly model = 'ideaforge-fallback-v1';

  async generateStructured<T>(
    _system: string,
    _user: string,
    schema: ZodType<T>,
    { task, dna, extra }: AIRequestOptions,
  ): Promise<T> {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 900)); // feel like real work
    // Dev-only: AI_SIMULATE_FAILURE=challenge,visual makes those tasks fail, to demo Retry / Continue manually.
    if ((process.env.AI_SIMULATE_FAILURE ?? '').split(',').map((s) => s.trim()).includes(task)) {
      throw new AIProviderError(`Simulated failure for "${task}" (AI_SIMULATE_FAILURE).`);
    }
    const p = parseIdea(dna.idea.rawIdea);
    const out = GENERATORS[task](p, dna, extra ?? {});
    return validateOutput(schema, JSON.stringify(out));
  }
}

type Gen = (p: ParsedIdea, dna: BrandDNA, extra: Record<string, unknown>) => unknown;

const GENERIC_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bplatform\b/i, label: '“platform”' },
  { re: /\bmade simple\b/i, label: '“made simple”' },
  { re: /\bseamless(ly)?\b/i, label: '“seamless”' },
  { re: /\ball-in-one\b/i, label: '“all-in-one”' },
  { re: /\brevolutioni[sz]/i, label: '“revolutionise”' },
  { re: /\bempower/i, label: '“empower”' },
  { re: /\binnovative\b/i, label: '“innovative”' },
  { re: /\bnext[- ]gen/i, label: '“next-gen”' },
  { re: /\bconnect(s|ing)? .* with\b/i, label: '“connects X with Y”' },
  { re: /\bthe easiest way\b/i, label: '“the easiest way”' },
];

/** The whole job if it is short, else its first 3 words — never ending on a dangling connector. */
const shortPhrase = (s: string) => {
  const all = s.split(' ');
  const words = all.length <= 6 ? all : all.slice(0, 3);
  while (words.length > 1 && /^(for|to|with|of|and|or|the|a|an|in|on|at|by|their|your)$/i.test(words[words.length - 1])) words.pop();
  return words.join(' ');
};

const findGeneric = (s = '') => GENERIC_PATTERNS.filter((g) => g.re.test(s)).map((g) => g.label);

const understand: Gen = (p): UnderstandOutput => ({
  problem: `${cap(p.audience)} want to ${p.action}, but ${p.domain.tension}.`,
  targetAudience: {
    primary: cap(p.audience),
    secondary: p.domain.key === 'teams' ? 'Organisers and communities running hackathons' : `Communities and organisations that serve ${p.audience}`,
  },
  userNeed: `A fast, trustworthy way to ${p.action} that fits their real constraints.`,
  context: `The idea describes ${withArticle(p.productType)}. Timing, trust and effort are the main barriers the audience faces today.`,
  opportunity: `Own a focused promise in ${p.domain.category.toLowerCase()} instead of competing as yet another general-purpose ${p.productType}.`,
  keyInsights: [
    p.domain.insight,
    `${cap(p.audience)} already improvise workarounds — group chats, spreadsheets, word of mouth.`,
    'Trust signals (real profiles, proof of skill or results) will matter more than feature count.',
    'The first successful outcome is the moment that creates retention and word of mouth.',
  ],
  assumptions: [
    `${cap(p.audience)} feel this problem often enough to switch behaviour.`,
    `${cap(withArticle(p.productType))} is the right format rather than a feature inside an existing tool.`,
    'Users are willing to share some personal information to get better matches or results.',
  ],
  openQuestions: [
    'How will you reach the first 100 users?',
    'What does success look like for a user after the first week?',
    'Is this free for users, or who pays?',
  ],
});

const positioning: Gen = (p, dna): PositioningOutput => {
  const idea = hasFullIdea(dna.idea) ? dna.idea : null;
  const audience = idea?.targetAudience.primary ?? cap(p.audience);
  return {
    category: p.domain.category,
    audience,
    problem: idea?.problem ?? `${cap(p.audience)} struggle to ${p.action}.`,
    differentiator: `Built specifically for ${p.audience}, focusing on fit and outcomes rather than volume.`,
    // A realistic, category-led first pass — the Challenge stage is designed to sharpen it.
    valueProposition: `${cap(withArticle(p.productType))} that helps ${p.audience} ${p.action}.`,
    competitiveAngle: `General tools treat ${p.audience} as an afterthought; this is purpose-built around their situation.`,
    statement: `For ${p.audience} who want to ${p.action}, this is the ${p.domain.category.toLowerCase()} ${p.productType} that focuses on the right fit, not just more options.`,
    rationale: `Your idea centres on ${p.audience} and a specific job: “${p.action}”. Anchoring the category in ${p.domain.category.toLowerCase()} gives the brand a clear lane. The differentiator builds on a key insight from the analysis: ${p.domain.insight.charAt(0).toLowerCase() + p.domain.insight.slice(1)}`,
    valuePropositionRationale: `It names the audience and the job directly so the promise is understood instantly — a solid starting point to sharpen with a sharper outcome.`,
  };
};

const personality: Gen = (p): PersonalityOutput => ({
  traits: p.domain.traits.map((t) => ({
    name: t.name,
    reason: t.reason,
    audienceFit: `Resonates with ${p.audience} and supports the core behaviour: ${p.action}.`,
  })),
  traitsToAvoid: ['Overly corporate', 'Aggressive', 'Generic', 'Overly technical'],
  rationale: `The personality mirrors what ${p.audience} need in the moment they use the product: ${p.domain.traits
    .slice(0, 2)
    .map((t) => t.name.toLowerCase())
    .join(' and ')} energy that lowers friction and builds trust.`,
});

const naming: Gen = (p): NamingOutput => {
  const territories = p.domain.territories.length
    ? p.domain.territories
    : [
        { name: 'Descriptive', concept: 'Names that say what the product does.', examples: coinNames(p).slice(0, 3), risks: ['Descriptive names are hard to trademark.'] },
        { name: 'Momentum', concept: 'Names about progress and forward motion.', examples: ['Kickstart', 'Onward', 'Leap'], risks: ['Energy words can feel generic.'] },
        { name: 'Belonging', concept: 'Names about the community around the product.', examples: ['Kin', 'Common', 'Harbor'], risks: ['May under-communicate function.'] },
      ];
  return {
    territories: territories.map((t) => ({
      ...t,
      rationale: `${t.concept.replace(/\.$/, '')} fits a brand for ${p.audience} because it reflects the outcome they care about.`,
    })),
  };
};

const messaging: Gen = (p, dna): MessagingOutput => {
  const traits = dna.personality?.traits.map((t) => t.name) ?? p.domain.traits.map((t) => t.name);
  return {
    // Intentionally a common first-draft pattern; the Challenge stage evaluates it.
    tagline: `${cap(shortPhrase(p.action))}, made simple.`,
    oneLinePitch: `A smarter way for ${p.audience} to ${p.action}.`,
    shortDescription: `${dna.positioning?.valueProposition ?? `${cap(withArticle(p.productType))} for ${p.audience}.`} It focuses on the right fit rather than more options, so ${p.audience} spend less time searching and more time doing.`,
    voice: ['Clear', 'Confident', 'Encouraging', 'Human'],
    tone: `${traits.slice(0, 2).join(' and ')} — direct and warm, never salesy.`,
    principles: [
      'Lead with the outcome, not the feature.',
      `Speak like a helpful peer to ${p.audience}.`,
      'Be specific: show real examples instead of adjectives.',
      'Keep sentences short and scannable.',
    ],
    rationale: `The voice reflects the ${traits.slice(0, 3).join(', ').toLowerCase()} personality and the audience’s need for clarity when they ${p.action}.`,
  };
};

const challenge: Gen = (p, dna): ChallengeOutput => {
  const issues: ChallengeOutput['issues'] = [];
  const vp = dna.positioning?.valueProposition ?? '';
  const tagline = dna.messaging?.tagline ?? '';
  const audience = dna.positioning?.audience ?? '';

  const vpGeneric = findGeneric(vp);
  if (vpGeneric.length || /^an?\s/i.test(vp)) {
    issues.push({
      type: 'weak_differentiation',
      severity: 'high',
      title: 'Positioning describes the category, not the difference',
      description:
        'Your value proposition explains what the product is, but not why someone would choose it over existing options. It reads like a category description.',
      evidence: `Value proposition: “${vp}”${vpGeneric.length ? ` — uses ${vpGeneric.join(', ')}` : ''}`,
      recommendation: 'Lead with the specific outcome the audience gets, framed around the insight that makes this product different.',
      target: 'positioning.valueProposition',
      suggestedValue: p.domain.sharpValueProp(p),
    });
  }

  const tagGeneric = findGeneric(tagline);
  if (tagGeneric.length) {
    issues.push({
      type: 'cliched_language',
      severity: 'medium',
      title: 'Tagline relies on a familiar startup phrase',
      description: 'The tagline uses wording that many products use, which makes it forgettable and hard to own.',
      evidence: `Tagline: “${tagline}” — uses ${tagGeneric.join(', ')}`,
      recommendation: 'Replace the stock phrase with the concrete tension your audience feels.',
      target: 'messaging.tagline',
      suggestedValue: p.domain.sharpTagline,
    });
  }

  if (/\b(everyone|anyone|people|users|early adopters)\b/i.test(audience)) {
    issues.push({
      type: 'audience_too_broad',
      severity: 'medium',
      title: 'Audience is too broad to design for',
      description: 'A broad audience makes every later decision (voice, visuals, channels) a compromise.',
      evidence: `Audience: “${audience}”`,
      recommendation: 'Name the first group who feels this problem most sharply.',
      target: 'positioning.audience',
      suggestedValue: `${cap(p.audience)} who ${p.action} at least once a month`,
    });
  }

  const traits = dna.personality?.traits.map((t) => t.name.toLowerCase()) ?? [];
  const avoid = dna.personality?.traitsToAvoid.map((t) => t.toLowerCase()) ?? [];
  const clash = traits.find((t) => avoid.some((a) => a.includes(t)));
  if (clash) {
    issues.push({
      type: 'personality_mismatch',
      severity: 'medium',
      title: 'A trait contradicts the traits to avoid',
      description: 'The personality includes a trait that is also listed as something to avoid.',
      evidence: `Trait “${clash}” also appears in traits to avoid.`,
      recommendation: 'Remove or reframe the conflicting trait.',
      target: 'general',
      suggestedValue: '',
    });
  }

  if (!dna.naming?.selectedName && dna.naming?.territories.length) {
    const first = dna.naming.territories[0];
    issues.push({
      type: 'naming_weakness',
      severity: 'low',
      title: 'No name has been chosen yet',
      description: 'Without a selected name, the brand kit and visual identity cannot feel fully ownable.',
      evidence: `${dna.naming.territories.length} naming territories exist but none is selected.`,
      recommendation: `Choose a direction. “${first.examples[0]}” from the ${first.name} territory fits the positioning best.`,
      target: 'naming.selectedName',
      suggestedValue: first.examples[0],
    });
  }

  const sharp = p.domain.sharpValueProp(p);
  return {
    overallAssessment: issues.length
      ? `The strategy has a solid foundation, but ${issues.length === 1 ? 'one decision needs' : `${issues.length} decisions need`} sharpening before it becomes a distinctive brand.`
      : 'The current strategy is coherent with only minor improvements needed.',
    issues,
    recommendedDirection:
      issues.length && vp !== sharp
        ? {
            statement: sharp,
            target: 'positioning.valueProposition',
            whyItWorks: [
              'Shifts from describing the product to promising an outcome.',
              `Speaks to what ${p.audience} actually care about.`,
              'Is specific enough to own and hard for competitors to copy.',
            ],
            improvements: ['More distinctive', 'Clearer outcome', 'Stronger emotional pull'],
          }
        : null,
  };
};

const alternatives: Gen = (p, dna, extra): AlternativesOutput => {
  const target = (extra.target as ChallengeTarget) ?? 'positioning.valueProposition';
  const short = target === 'messaging.tagline' || target === 'naming.selectedName';
  if (target === 'naming.selectedName') {
    const names = [
      ...(dna.naming?.territories.flatMap((t) => t.examples) ?? []),
      ...coinNames(p),
    ];
    return {
      alternatives: [
        { statement: names[0] ?? 'Forge', rationale: 'Short, ownable and easy to say.', difference: 'Leans on the connection territory.' },
        { statement: names[3] ?? 'Spark', rationale: 'Evokes momentum and energy.', difference: 'Emotional rather than functional.' },
        { statement: names[6] ?? coinNames(p)[1], rationale: 'Describes the function directly.', difference: 'Functional clarity over personality.' },
      ],
    };
  }
  return {
    alternatives: [
      {
        statement: short ? p.domain.sharpTagline : p.domain.sharpValueProp(p),
        rationale: 'Leads with the concrete outcome the audience wants.',
        difference: 'Outcome-led: focuses on the result, not the product.',
      },
      {
        statement: short ? `Built for ${p.audience}.` : `The ${p.productType} built for ${p.audience} who refuse to settle for “good enough”.`,
        rationale: 'Makes the audience feel seen and creates identity-based belonging.',
        difference: 'Identity-led: focuses on who it is for.',
      },
      {
        statement: short ? 'Stop guessing. Start building.' : `Stop guessing. ${cap(p.action)} with confidence.`,
        rationale: 'Names the frustration of the status quo and positions the product against it.',
        difference: 'Contrast-led: defines the brand against the old way.',
      },
    ],
  };
};

const visual: Gen = (p, dna): VisualOutput => {
  const traits = dna.personality?.traits.map((t) => t.name) ?? p.domain.traits.map((t) => t.name);
  return {
    colors: p.domain.palette,
    typography: {
      heading: p.domain.fonts.heading,
      body: p.domain.fonts.body,
      rationale: `${p.domain.fonts.heading} gives headlines a ${traits[0]?.toLowerCase() ?? 'confident'}, contemporary edge, while ${p.domain.fonts.body} keeps longer copy calm and readable.`,
    },
    mood: p.domain.mood,
    imagery: p.domain.imagery,
    shapes: ['Rounded rectangles (16–24px radius)', 'Interlocking modular shapes', 'Soft glowing gradients'],
    composition: ['Generous whitespace', 'One clear focal point per layout', 'Left-aligned, grid-based typography'],
    principles: [
      'Clarity before decoration.',
      `Colour signals ${traits[0]?.toLowerCase() ?? 'energy'}; neutrals carry the content.`,
      'Show real people and real outcomes.',
    ],
    avoid: ['Generic stock handshakes', 'Dark, aggressive “hacker” aesthetics', 'Too many competing accent colours'],
    rationale: `The palette pairs a trustworthy primary with an energetic accent to reflect the ${traits
      .slice(0, 3)
      .join(', ')
      .toLowerCase()} personality, while imagery keeps ${p.audience} at the centre of the story.`,
  };
};

const visualCheck: Gen = (_p, dna): VisualCheckOutput => {
  const avoid = dna.personality?.traitsToAvoid.map((t) => t.toLowerCase()) ?? [];
  const mood = dna.visual?.mood.map((m) => m.toLowerCase()) ?? [];
  const clashes = mood.filter((m) => avoid.some((a) => a.includes(m)));
  return {
    consistent: clashes.length === 0,
    issues: clashes.map((m) => `Visual mood “${m}” conflicts with a personality trait to avoid.`),
  };
};

const brandName = (p: ParsedIdea, dna: BrandDNA) =>
  dna.naming?.selectedName || dna.naming?.territories[0]?.examples[0] || coinNames(p)[0];

const brandKit: Gen = (p, dna): BrandKitOutput => {
  const name = brandName(p, dna);
  const vp = dna.positioning?.valueProposition ?? p.domain.sharpValueProp(p);
  const tagline = dna.messaging?.tagline ?? p.domain.sharpTagline;
  const pitch = dna.messaging?.oneLinePitch ?? `A smarter way for ${p.audience} to ${p.action}.`;
  const traits = dna.personality?.traits.map((t) => t.name) ?? [];
  return {
    name,
    tagline,
    oneLinePitch: pitch,
    brandSummary: `${name} is a ${dna.positioning?.category.toLowerCase() ?? p.productType} brand for ${p.audience}. ${vp} It shows up as ${traits
      .slice(0, 3)
      .join(', ')
      .toLowerCase()} — always leading with the outcome.`,
    positioning: dna.positioning?.statement ?? vp,
    audience: dna.positioning?.audience ?? cap(p.audience),
    personality: traits,
    voice: dna.messaging?.voice ?? ['Clear', 'Confident'],
    visualSummary: `${dna.visual?.typography.heading ?? 'Modern'} headlines, a ${dna.visual?.colors[0]?.name.toLowerCase() ?? 'teal'}-led palette and ${
      dna.visual?.mood.slice(0, 2).join(' and ').toLowerCase() ?? 'energetic'
    } imagery.`,
    launchHeadline: vp,
    launchDescription: `${pitch} ${name} helps ${p.audience} ${p.action} — focused on the right fit, not endless options.`,
    shortDescription: dna.messaging?.shortDescription ?? pitch,
    cta: p.domain.cta,
    socialLaunchPost: `Introducing ${name} ✦\n\n${vp}\n\nWe built ${name} for ${p.audience} who are tired of guessing. ${pitch}\n\n${p.domain.cta} → link in bio`,
  };
};

const consistency: Gen = (p, dna): ConsistencyOutput => {
  const kit = dna.brandKit;
  const launchGeneric = findGeneric(`${kit?.launchHeadline ?? ''} ${kit?.launchDescription ?? ''}`);
  const taglineGeneric = findGeneric(dna.messaging?.tagline);
  const vpGeneric = findGeneric(dna.positioning?.valueProposition);
  const named = !!dna.naming?.selectedName;
  const visualOk = dna.visualCheck?.consistent !== false;

  const checks: ConsistencyOutput['checks'] = [
    named
      ? { area: 'Name ↔ Positioning', status: 'pass', explanation: `“${dna.naming?.selectedName}” comes from a territory built on the positioning.`, recommendation: '' }
      : { area: 'Name ↔ Positioning', status: 'warning', explanation: 'No name was explicitly selected, so a default was used.', recommendation: 'Pick a name in Strategy → Naming.' },
    { area: 'Positioning ↔ Personality', status: 'pass', explanation: 'Personality traits support the core audience behaviour.', recommendation: '' },
    { area: 'Personality ↔ Voice', status: 'pass', explanation: 'Voice attributes are a natural expression of the personality.', recommendation: '' },
    taglineGeneric.length
      ? { area: 'Positioning ↔ Messaging', status: 'warning', explanation: `The tagline uses ${taglineGeneric.join(', ')}, which is weaker than the positioning.`, recommendation: 'Sharpen the tagline in the Challenge stage.' }
      : { area: 'Positioning ↔ Messaging', status: 'pass', explanation: 'Tagline and pitch reinforce the same promise.', recommendation: '' },
    visualOk
      ? { area: 'Visual ↔ Personality', status: 'pass', explanation: 'Palette and typography reflect the personality traits.', recommendation: '' }
      : { area: 'Visual ↔ Personality', status: 'warning', explanation: 'Visual mood conflicts with a trait to avoid.', recommendation: 'Regenerate the visual direction.' },
    launchGeneric.length || vpGeneric.length
      ? { area: 'Launch Copy ↔ Positioning', status: 'warning', explanation: `Launch copy contains generic wording (${[...launchGeneric, ...vpGeneric].join(', ')}).`, recommendation: 'Accept the sharper value proposition from the Challenge stage.' }
      : { area: 'Launch Copy ↔ Positioning', status: 'pass', explanation: 'Launch headline carries the positioning directly.', recommendation: '' },
  ];

  const health: ConsistencyOutput['health'] = [
    { label: 'Clear positioning', status: vpGeneric.length ? 'warning' : 'pass', note: vpGeneric.length ? 'Value proposition still reads as a category description.' : '' },
    { label: 'Defined audience', status: /early adopters|everyone/i.test(dna.positioning?.audience ?? '') ? 'warning' : 'pass', note: '' },
    { label: 'Consistent personality', status: 'pass', note: '' },
    { label: 'Distinctive messaging', status: taglineGeneric.length ? 'warning' : 'pass', note: taglineGeneric.length ? `Generic phrase detected in tagline: ${taglineGeneric.join(', ')}` : '' },
    { label: 'Visual alignment', status: visualOk ? 'pass' : 'warning', note: '' },
  ];

  const warnings = checks.filter((c) => c.status !== 'pass');
  return {
    consistent: warnings.length === 0,
    checks,
    health,
    recommendations: warnings.map((w) => w.recommendation).filter(Boolean),
  };
};

const GENERATORS: Record<AIRequestOptions['task'], Gen> = {
  understand,
  positioning,
  personality,
  naming,
  messaging,
  challenge,
  alternatives,
  visual,
  'visual-check': visualCheck,
  'brand-kit': brandKit,
  consistency,
};
