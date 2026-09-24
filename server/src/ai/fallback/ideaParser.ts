/**
 * Lightweight, deterministic idea parsing for the development fallback provider.
 * It extracts audience, action and domain from the raw idea so demo output is
 * grounded in what the user actually typed.
 */

export interface Domain {
  key: string;
  match: RegExp;
  category: string;
  tension: string;
  insight: string;
  sharpValueProp: (p: ParsedIdea) => string;
  sharpTagline: string;
  cta: string;
  territories: { name: string; concept: string; examples: string[]; risks: string[] }[];
  traits: { name: string; reason: string }[];
  palette: { name: string; hex: string; usage: string }[];
  fonts: { heading: string; body: string };
  mood: string[];
  imagery: string[];
}

export interface ParsedIdea {
  raw: string;
  productType: string;
  audience: string;
  action: string;
  keywords: string[];
  domain: Domain;
}

const STOP = new Set(
  'that this with from have want build create make launch helps help their them they what where when which your into about platform app application tool service website people users would could should will just like more most very also some other only such than then these those being been were does doing each few many much ones over same find easily better'.split(
    ' ',
  ),
);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const capitalize = cap;
/** 'a platform' / 'an app' */
export const withArticle = (word: string) => `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`;

const DOMAINS: Domain[] = [
  {
    key: 'teams',
    match: /team|hackathon|co-?founder|collaborat|squad|project partner/gi,
    category: 'Skill-based team formation',
    tension: 'most teams form around who you already know, not the skills the project actually needs',
    insight: 'The best teams are complementary, not just friendly — skill gaps decide outcomes.',
    sharpValueProp: () => 'Find the missing skill your next winning team needs.',
    sharpTagline: 'Find the missing skill your team needs.',
    cta: 'Build your team',
    territories: [
      { name: 'Connection', concept: 'Names focused on collaboration and finding the right people.', examples: ['TeamUp', 'Linkly', 'Sync'], risks: ['“Link” and “Sync” names are crowded in productivity software.'] },
      { name: 'Momentum', concept: 'Names focused on progress and building together under pressure.', examples: ['Forge', 'Spark', 'Kickoff'], risks: ['Energy words can feel generic without a clear skill story.'] },
      { name: 'Skill', concept: 'Names centred on complementary capabilities.', examples: ['SkillMatch', 'Gap', 'Pair'], risks: ['Functional names can feel utilitarian and hard to trademark.'] },
    ],
    traits: [
      { name: 'Confident', reason: 'Students entering competitions want to feel they can win, not just participate.' },
      { name: 'Collaborative', reason: 'The core behaviour is teamwork, so the brand should model it.' },
      { name: 'Energetic', reason: 'Hackathons are fast, intense and exciting — the brand should match that pace.' },
      { name: 'Supportive', reason: 'Many users are first-timers who need encouragement to reach out to strangers.' },
    ],
    palette: [
      { name: 'Signal Teal', hex: '#0EA5A4', usage: 'Primary actions and brand moments' },
      { name: 'Build Blue', hex: '#2563EB', usage: 'Secondary accents, links and highlights' },
      { name: 'Spark Coral', hex: '#FB7185', usage: 'Energy accents, badges and celebrations' },
      { name: 'Fresh Mint', hex: '#A7F3D0', usage: 'Soft backgrounds and success states' },
      { name: 'Midnight', hex: '#0F172A', usage: 'Text and high-contrast surfaces' },
    ],
    fonts: { heading: 'Space Grotesk', body: 'Inter' },
    mood: ['Energetic', 'Collaborative', 'Modern', 'Human', 'Optimistic'],
    imagery: ['Real student teams mid-build, laptops and whiteboards', 'Skill “puzzle pieces” clicking together', 'Abstract network nodes forming a team'],
  },
  {
    key: 'fitness',
    match: /fitness|workout|gym|exercise|training|running|yoga|\bhealth\b|wellness/gi,
    category: 'Personal fitness coaching',
    tension: 'motivation fades when progress is invisible and plans ignore real life',
    insight: 'Consistency beats intensity — people quit when the plan does not fit their week.',
    sharpValueProp: () => 'Workouts that fit the week you actually have.',
    sharpTagline: 'Train for the life you actually live.',
    cta: 'Start your first week',
    territories: [
      { name: 'Rhythm', concept: 'Names about consistency and sustainable habit.', examples: ['Cadence', 'Pulse', 'Tempo'], risks: ['Music-adjacent names are common in fitness.'] },
      { name: 'Strength', concept: 'Names about quiet, compounding progress.', examples: ['Stride', 'Grit', 'Ascent'], risks: ['Can drift into aggressive “beast mode” territory.'] },
      { name: 'Everyday', concept: 'Names that make fitness feel accessible.', examples: ['Daily', 'Moveable', 'Fitwell'], risks: ['Soft names may lack memorability.'] },
    ],
    traits: [
      { name: 'Encouraging', reason: 'Users need momentum after missed days, not guilt.' },
      { name: 'Grounded', reason: 'Credibility comes from realistic plans, not hype.' },
      { name: 'Energetic', reason: 'Fitness should feel uplifting and active.' },
      { name: 'Personal', reason: 'Plans adapt to each person’s schedule.' },
    ],
    palette: [
      { name: 'Vital Green', hex: '#16A34A', usage: 'Primary actions and progress' },
      { name: 'Sunrise', hex: '#F97316', usage: 'Energy accents and streaks' },
      { name: 'Calm Sky', hex: '#38BDF8', usage: 'Secondary accents and charts' },
      { name: 'Bone', hex: '#F5F5F4', usage: 'Backgrounds' },
      { name: 'Graphite', hex: '#1C1917', usage: 'Text' },
    ],
    fonts: { heading: 'Outfit', body: 'Inter' },
    mood: ['Energetic', 'Optimistic', 'Grounded', 'Human'],
    imagery: ['Everyday people training in real spaces', 'Motion blur and natural light', 'Simple progress lines'],
  },
  {
    key: 'food',
    match: /food|recipe|cook|meal|dinner|lunch|breakfast|restaurant|kitchen|grocer|diet|nutrition|\beat\b/gi,
    category: 'Everyday cooking and meal planning',
    tension: 'deciding what to cook is harder than cooking itself',
    insight: 'The real friction is the daily decision, not the recipe.',
    sharpValueProp: () => 'Dinner decided in the time it takes to open the fridge.',
    sharpTagline: 'Dinner, decided.',
    cta: 'Plan tonight’s meal',
    territories: [
      { name: 'Table', concept: 'Names about sharing and the moment of eating together.', examples: ['Tably', 'Supper', 'Gather'], risks: ['“Gather” is widely used.'] },
      { name: 'Pantry', concept: 'Names grounded in what you already have.', examples: ['Pantry', 'Shelf', 'Stock'], risks: ['Can sound like inventory software.'] },
      { name: 'Flavour', concept: 'Names about delight and taste.', examples: ['Savor', 'Zest', 'Umami'], risks: ['Very crowded in food brands.'] },
    ],
    traits: [
      { name: 'Warm', reason: 'Food is emotional and social.' },
      { name: 'Practical', reason: 'Users want fewer decisions, not more content.' },
      { name: 'Playful', reason: 'Cooking should feel fun rather than like a chore.' },
    ],
    palette: [
      { name: 'Tomato', hex: '#EF4444', usage: 'Primary actions' },
      { name: 'Basil', hex: '#15803D', usage: 'Secondary accents' },
      { name: 'Butter', hex: '#FDE68A', usage: 'Highlights' },
      { name: 'Cream', hex: '#FFFBEB', usage: 'Backgrounds' },
      { name: 'Espresso', hex: '#292524', usage: 'Text' },
    ],
    fonts: { heading: 'Fraunces', body: 'DM Sans' },
    mood: ['Warm', 'Appetising', 'Playful', 'Homely'],
    imagery: ['Overhead shots of real home cooking', 'Hand-drawn ingredient doodles', 'Warm natural light'],
  },
  {
    key: 'money',
    match: /money|financ|budget|invest|saving|expense|invoice|bank|\bpa(?:y|id)\b|debt|crypto/gi,
    category: 'Personal finance guidance',
    tension: 'money tools show numbers but rarely tell people what to do next',
    insight: 'People want confidence about their next decision, not more dashboards.',
    sharpValueProp: () => 'Know where your money stands — and exactly what to do next.',
    sharpTagline: 'Money decisions, made with confidence.',
    cta: 'See your plan',
    territories: [
      { name: 'Clarity', concept: 'Names about seeing clearly.', examples: ['Clearly', 'Lens', 'Plainsight'], risks: ['“Clear” is overused in fintech.'] },
      { name: 'Growth', concept: 'Names about compounding progress.', examples: ['Sprout', 'Acre', 'Compound'], risks: ['Plant metaphors are common.'] },
      { name: 'Guide', concept: 'Names about a trusted companion.', examples: ['Compass', 'North', 'Steward'], risks: ['Compass names are crowded.'] },
    ],
    traits: [
      { name: 'Trustworthy', reason: 'Money requires credibility above all.' },
      { name: 'Calm', reason: 'Users often feel anxious about finances.' },
      { name: 'Clear', reason: 'Jargon erodes trust.' },
    ],
    palette: [
      { name: 'Deep Teal', hex: '#0F766E', usage: 'Primary' },
      { name: 'Gold Leaf', hex: '#D97706', usage: 'Accents and milestones' },
      { name: 'Mist', hex: '#E0F2FE', usage: 'Surfaces' },
      { name: 'Paper', hex: '#FAFAF9', usage: 'Backgrounds' },
      { name: 'Ink', hex: '#0F172A', usage: 'Text' },
    ],
    fonts: { heading: 'Manrope', body: 'Inter' },
    mood: ['Calm', 'Trustworthy', 'Clear', 'Optimistic'],
    imagery: ['Simple, confident data visuals', 'Calm everyday moments', 'Geometric growth motifs'],
  },
  {
    key: 'learning',
    match: /learn|study|course|tutor|school|exam|teach|education|language/gi,
    category: 'Guided learning',
    tension: 'learners drown in content but lack a clear next step',
    insight: 'Progress feels real when the next step is obvious.',
    sharpValueProp: () => 'Always know the next thing to learn — and why.',
    sharpTagline: 'Your next step, always clear.',
    cta: 'Start learning',
    territories: [
      { name: 'Path', concept: 'Names about guided progression.', examples: ['Pathway', 'Trail', 'Stepwise'], risks: ['Path names are common in edtech.'] },
      { name: 'Spark', concept: 'Names about curiosity and the “aha” moment.', examples: ['Lumen', 'Aha', 'Kindle'], risks: ['Kindle is taken.'] },
      { name: 'Mastery', concept: 'Names about craft and depth.', examples: ['Deepen', 'Craft', 'Fluent'], risks: ['Can feel intimidating to beginners.'] },
    ],
    traits: [
      { name: 'Encouraging', reason: 'Learners need confidence to keep going.' },
      { name: 'Curious', reason: 'Learning is driven by curiosity.' },
      { name: 'Clear', reason: 'The core promise is an obvious next step.' },
    ],
    palette: [
      { name: 'Scholar Indigo', hex: '#4F46E5', usage: 'Primary' },
      { name: 'Highlighter', hex: '#FACC15', usage: 'Accents' },
      { name: 'Sage', hex: '#86EFAC', usage: 'Progress' },
      { name: 'Paper', hex: '#F8FAFC', usage: 'Backgrounds' },
      { name: 'Ink', hex: '#1E293B', usage: 'Text' },
    ],
    fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
    mood: ['Curious', 'Encouraging', 'Clear', 'Bright'],
    imagery: ['Hand-drawn notes and highlights', 'Learners in focused moments', 'Progress paths'],
  },
  {
    key: 'creators',
    match: /creator|content|newsletter|podcast|youtube|influenc|subscriber|artist|music|writer/gi,
    category: 'Creator growth tools',
    tension: 'creators spend more time on logistics than on the work that grows their audience',
    insight: 'Creators want leverage, not more tools to manage.',
    sharpValueProp: () => 'Spend your time creating — we’ll handle what grows it.',
    sharpTagline: 'Make the work. Grow the audience.',
    cta: 'Grow your audience',
    territories: [
      { name: 'Signal', concept: 'Names about being heard.', examples: ['Amplify', 'Echo', 'Beacon'], risks: ['Amplify-type names are crowded.'] },
      { name: 'Studio', concept: 'Names about the craft space.', examples: ['Atelier', 'Studiocraft', 'Workshop'], risks: ['May feel too “maker” focused.'] },
      { name: 'Orbit', concept: 'Names about community around a creator.', examples: ['Orbit', 'Circle', 'Tribe'], risks: ['Circle and Tribe are taken in the space.'] },
    ],
    traits: [
      { name: 'Bold', reason: 'Creators want to stand out.' },
      { name: 'Supportive', reason: 'Creating is lonely; the brand should be an ally.' },
      { name: 'Expressive', reason: 'Mirrors the creative work of the audience.' },
    ],
    palette: [
      { name: 'Electric Violet', hex: '#7C3AED', usage: 'Primary' },
      { name: 'Hot Pink', hex: '#EC4899', usage: 'Accents' },
      { name: 'Sky', hex: '#38BDF8', usage: 'Secondary' },
      { name: 'Canvas', hex: '#FAFAFA', usage: 'Backgrounds' },
      { name: 'Night', hex: '#18181B', usage: 'Text' },
    ],
    fonts: { heading: 'Syne', body: 'Inter' },
    mood: ['Bold', 'Expressive', 'Vibrant', 'Human'],
    imagery: ['Creators at work in their spaces', 'Bold cut-out collage', 'Waveforms and signal motifs'],
  },
];

const DEFAULT_DOMAIN: Domain = {
  key: 'general',
  match: /.*/,
  category: 'Focused digital product',
  tension: 'existing options are generic and do not fit this audience’s specific situation',
  insight: 'Focus wins — the more specific the promise, the easier it is to choose.',
  sharpValueProp: (p) => `${cap(p.action)} — without the guesswork.`,
  sharpTagline: 'Made for the way you actually work.',
  cta: 'Get early access',
  territories: [],
  traits: [
    { name: 'Clear', reason: 'A new product must be understood in seconds.' },
    { name: 'Confident', reason: 'Users need to trust a new product quickly.' },
    { name: 'Approachable', reason: 'Lowers the barrier for first-time users.' },
    { name: 'Modern', reason: 'Signals a fresh take on an old problem.' },
  ],
  palette: [
    { name: 'Primary Teal', hex: '#0D9488', usage: 'Primary actions' },
    { name: 'Horizon Blue', hex: '#3B82F6', usage: 'Secondary accents' },
    { name: 'Glow', hex: '#FBBF24', usage: 'Highlights' },
    { name: 'Cloud', hex: '#F8FAFC', usage: 'Backgrounds' },
    { name: 'Slate', hex: '#0F172A', usage: 'Text' },
  ],
  fonts: { heading: 'Manrope', body: 'Inter' },
  mood: ['Modern', 'Clear', 'Optimistic', 'Human'],
  imagery: ['Real people in real moments of use', 'Clean abstract geometry', 'Soft gradients and light'],
};

const VERBS =
  'find|build|learn|get|discover|track|manage|share|connect|create|make|save|plan|organi[sz]e|improve|grow|book|sell|buy|meet|practi[cs]e|prepare|understand|reduce|avoid|stay|keep|start|launch|earn|swap|trade|cook|eat|write|read|split|compare|choose|hire|rent|join|explore|monitor|automate|turn|access|document';

export function parseIdea(raw: string): ParsedIdea {
  const clean = raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/, '');

  const productType =
    clean.match(/\b(marketplace|platform|app|tool|community|newsletter|service|website|course|podcast|store|extension|bot|saas)\b/i)?.[1]?.toLowerCase() ??
    'platform';

  const verbRe = new RegExp(`\\b(${VERBS})\\b`, 'i');
  let audience = '';
  let action = '';

  const helps = clean.match(new RegExp(`\\bhelps?\\s+(.+?)\\s+(?:to\\s+)?((?:${VERBS})\\b.*)$`, 'i'));
  const forWho = clean.match(/\bfor\s+([a-z][a-z\s-]{2,60}?)(?:\s+(?:to|who|that|so)\b|[,.]|$)/i);
  const lets = clean.match(new RegExp(`\\b(?:lets|allows|enables)\\s+(.+?)\\s+(?:to\\s+)?((?:${VERBS})\\b.*)$`, 'i'));

  if (helps) {
    audience = helps[1];
    action = helps[2];
  } else if (lets) {
    audience = lets[1];
    action = lets[2];
  } else {
    if (forWho) audience = forWho[1];
    const v = clean.match(new RegExp(`\\b((?:${VERBS})\\b.*)$`, 'i'));
    action = v ? v[1] : clean.replace(/^(i\s+want\s+to\s+(build|create|make|launch|start)\s+)?(an?\s+)?/i, '');
  }

  audience = audience.replace(/^(the|all)\s+/i, '').trim() || 'early adopters';
  action = action.replace(verbRe, (m) => m.toLowerCase()).trim();
  if (action.length > 90) action = action.slice(0, 90).replace(/\s+\S*$/, '');

  const keywords = Array.from(
    new Set(
      clean
        .toLowerCase()
        .replace(/[^a-z\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w)),
    ),
  ).slice(0, 6);

  // Score every domain by keyword hits so mixed ideas ("healthy dinners") land in the dominant one.
  const scored = DOMAINS.map((d) => ({ d, hits: clean.match(d.match)?.length ?? 0 })).filter((x) => x.hits > 0);
  scored.sort((a, b) => b.hits - a.hits);
  const domain = scored[0]?.d ?? DEFAULT_DOMAIN;
  return { raw: clean, productType, audience, action, keywords, domain };
}

/** Deterministic pseudo-random pick so the same idea always yields the same result. */
export function seeded(raw: string) {
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) h = Math.imul(h ^ raw.charCodeAt(i), 16777619);
  return (n: number) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    return Math.abs(h) % n;
  };
}

export function coinNames(p: ParsedIdea): string[] {
  const root = (p.keywords.find((k) => !/student|people|user|college/.test(k)) ?? p.keywords[0] ?? 'idea').replace(/s$/, '');
  const short = root.slice(0, Math.min(5, root.length));
  return [cap(root) + 'ly', cap(short) + 'io', cap(root) + 'Hub', 'Get' + cap(short), cap(short) + 'wise'];
}
