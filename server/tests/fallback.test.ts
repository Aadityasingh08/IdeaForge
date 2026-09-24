import { describe, expect, it } from 'vitest';
import { parseIdea } from '../src/ai/fallback/ideaParser';
import { FallbackProvider } from '../src/ai/providers/FallbackProvider';
import { AlternativesSchema, ChallengeSchema, MessagingSchema, NamingSchema, PersonalitySchema, PositioningSchema, UnderstandSchema } from '../src/schemas/ai.schemas';
import { emptyBrandDNA, type BrandDNA } from '../src/types/brandDNA';

const HACKATHON = 'I want to build a platform that helps college students find teammates for hackathons.';
const provider = new FallbackProvider();

async function buildStrategy(idea: string): Promise<BrandDNA> {
  const dna = emptyBrandDNA(idea);
  const opts = (task: Parameters<typeof provider.generateStructured>[3]['task']) => ({ task, dna });
  dna.idea = { rawIdea: idea, ...(await provider.generateStructured('', '', UnderstandSchema, opts('understand'))) };
  dna.positioning = await provider.generateStructured('', '', PositioningSchema, opts('positioning'));
  dna.personality = await provider.generateStructured('', '', PersonalitySchema, opts('personality'));
  dna.naming = await provider.generateStructured('', '', NamingSchema, opts('naming'));
  dna.messaging = await provider.generateStructured('', '', MessagingSchema, opts('messaging'));
  return dna;
}

describe('idea parser', () => {
  it.each([
    [HACKATHON, 'teams', 'college students', 'find teammates for hackathons'],
    ['An app that helps busy parents plan a week of healthy dinners in five minutes', 'food', 'busy parents', 'plan a week of healthy dinners in five minutes'],
    ['A tool for freelancers to track invoices and get paid faster', 'money', 'freelancers', 'track invoices and get paid faster'],
    ['A gym app that helps beginners build a workout habit', 'fitness', 'beginners', 'build a workout habit'],
  ])('parses “%s”', (idea, domain, audience, action) => {
    const p = parseIdea(idea);
    expect(p.domain.key).toBe(domain);
    expect(p.audience).toBe(audience);
    expect(p.action).toBe(action);
  });

  it('does not treat “create” or “great” as food words', () => {
    expect(parseIdea('I want to create a great app for dog owners to meet nearby').domain.key).toBe('general');
  });
});

describe('fallback challenge engine', () => {
  it('flags a category-style value proposition with evidence and a concrete fix', async () => {
    const dna = await buildStrategy(HACKATHON);
    const out = await provider.generateStructured('', '', ChallengeSchema, { task: 'challenge', dna });
    const vp = out.issues.find((i) => i.target === 'positioning.valueProposition');
    expect(vp?.severity).toBe('high');
    expect(vp?.evidence).toContain(dna.positioning!.valueProposition);
    expect(vp?.suggestedValue).toBe('Find the missing skill your next winning team needs.');
  });

  it('reports no issues once the weaknesses are fixed — it does not manufacture criticism', async () => {
    const dna = await buildStrategy(HACKATHON);
    dna.positioning!.valueProposition = 'Find the missing skill your next winning team needs.';
    dna.messaging!.tagline = 'Find the missing skill your team needs.';
    dna.naming!.selectedName = 'TeamUp';
    const out = await provider.generateStructured('', '', ChallengeSchema, { task: 'challenge', dna });
    expect(out.issues).toEqual([]);
    expect(out.recommendedDirection).toBeNull();
    expect(out.overallAssessment).toMatch(/coherent/);
  });

  it('generates exactly three distinct alternatives', async () => {
    const dna = await buildStrategy(HACKATHON);
    const out = await provider.generateStructured('', '', AlternativesSchema, { task: 'alternatives', dna, extra: { target: 'messaging.tagline' } });
    expect(out.alternatives).toHaveLength(3);
    expect(new Set(out.alternatives.map((a) => a.statement)).size).toBe(3);
  });

  it('produces grammatical first drafts (no “a app”, no dangling connectors)', async () => {
    const dna = await buildStrategy('An app that helps busy parents plan a week of healthy dinners in five minutes');
    expect(dna.positioning!.valueProposition.startsWith('An app')).toBe(true);
    expect(dna.messaging!.tagline).not.toMatch(/\b(for|of|to|and),/);
  });
});
