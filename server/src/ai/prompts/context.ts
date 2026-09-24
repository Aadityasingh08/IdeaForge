import type { BrandDNA } from '../../types/brandDNA';

type Section = 'idea' | 'positioning' | 'personality' | 'naming' | 'messaging' | 'visual' | 'challenges' | 'brandKit';

/**
 * Builds the BrandDNA context block for a stage. Each stage only receives the
 * sections it needs, plus the list of human-edited fields that must be respected.
 */
export function brandContext(dna: BrandDNA, sections: Section[]): string {
  const ctx: Record<string, unknown> = {};
  for (const s of sections) {
    if (s === 'challenges') {
      ctx.challengeDecisions = dna.challenges.map((c) => ({
        issue: c.title,
        target: c.target,
        resolution: c.resolution ?? 'unresolved',
        appliedValue: c.appliedValue,
      }));
    } else if (s === 'naming' && dna.naming) {
      ctx.naming = {
        territories: dna.naming.territories.map((t) => ({ name: t.name, concept: t.concept, examples: t.examples })),
        selectedTerritory: dna.naming.selectedTerritory ?? null,
        selectedName: dna.naming.selectedName ?? null,
      };
    } else if (dna[s as keyof BrandDNA]) {
      ctx[s] = dna[s as keyof BrandDNA];
    }
  }

  const edited = dna.decisions.edited;
  const accepted = dna.decisions.accepted;
  const human =
    edited.length || accepted.length
      ? `\n\nHUMAN DECISIONS (source of truth — build on these, never contradict or silently rewrite them):\n- Manually edited: ${
          edited.join(', ') || 'none'
        }\n- Explicitly accepted: ${accepted.join(', ') || 'none'}`
      : '';

  return `BRAND DNA (stored context from previous stages):\n${JSON.stringify(ctx, null, 2)}${human}`;
}

export const JSON_ONLY = 'Return ONLY valid JSON that matches the requested schema. No markdown, no commentary.';
