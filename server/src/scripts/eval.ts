/**
 * Prompt-quality evaluation. Runs the full AI pipeline (no database) on a set of
 * sample ideas with whichever provider is configured, and scores the Challenge engine:
 *
 *   grounded   — every issue's evidence quotes text that really exists in BrandDNA
 *   actionable — every field-level issue comes with a concrete suggested value
 *   converges  — after applying the suggestions, a re-review finds fewer issues
 *   distinct   — the 3 alternatives are genuinely different statements
 *
 * Usage:  npm run eval            (demo provider)
 *         AI_PROVIDER=llm AI_API_KEY=... npm run eval   (real model — costs money)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import type { ZodType } from 'zod';
import { createProvider } from '../ai/providers';
import type { AITask } from '../ai/providers/AIProvider';
import { understandPrompt } from '../ai/prompts/understand.prompt';
import { messagingPrompt, namingPrompt, personalityPrompt, positioningPrompt } from '../ai/prompts/strategy.prompts';
import { alternativesPrompt, challengePrompt } from '../ai/prompts/challenge.prompts';
import {
  AlternativesSchema,
  ChallengeSchema,
  MessagingSchema,
  NamingSchema,
  PersonalitySchema,
  PositioningSchema,
  UnderstandSchema,
  type ChallengeOutput,
} from '../schemas/ai.schemas';
import { emptyBrandDNA, type BrandDNA, type ChallengeItem } from '../types/brandDNA';
import { applyChallengeValue, getPath } from '../services/brandDNA.service';

const IDEAS = [
  'I want to build a platform that helps college students find teammates for hackathons.',
  'An app that helps busy parents plan a week of healthy dinners in five minutes',
  'A tool for freelancers to track invoices and get paid faster',
  'A newsletter that helps indie creators grow their first 1,000 subscribers',
  'A community where plant lovers swap cuttings with neighbours',
];

const provider = createProvider();

async function call<T>(task: AITask, system: string, user: string, schema: ZodType<T>, dna: BrandDNA, extra?: Record<string, unknown>) {
  return provider.generateStructured(system, user, schema, { task, dna, extra });
}

const quoted = (evidence: string) => [...evidence.matchAll(/[“"]([^”"]{8,})[”"]/g)].map((m) => m[1].trim());

function scoreChallenge(dna: BrandDNA, out: ChallengeOutput) {
  const haystack = JSON.stringify(dna).toLowerCase();
  const grounded = out.issues.filter((i) => {
    const quotes = quoted(i.evidence);
    return quotes.length === 0 ? true : quotes.every((q) => haystack.includes(q.toLowerCase().slice(0, 40)));
  }).length;
  const actionable = out.issues.filter((i) => i.target === 'general' || i.suggestedValue.trim().length > 0).length;
  return { grounded, actionable, total: out.issues.length };
}

async function evaluate(idea: string) {
  const dna = emptyBrandDNA(idea);
  dna.idea = { rawIdea: idea, ...(await call('understand', understandPrompt.system, understandPrompt.user(idea), UnderstandSchema, dna)) };
  dna.positioning = await call('positioning', positioningPrompt.system, positioningPrompt.user(dna), PositioningSchema, dna);
  dna.personality = await call('personality', personalityPrompt.system, personalityPrompt.user(dna), PersonalitySchema, dna);
  dna.naming = await call('naming', namingPrompt.system, namingPrompt.user(dna), NamingSchema, dna);
  dna.messaging = await call('messaging', messagingPrompt.system, messagingPrompt.user(dna), MessagingSchema, dna);

  const first = await call('challenge', challengePrompt.system, challengePrompt.user(dna), ChallengeSchema, dna);
  const firstScore = scoreChallenge(dna, first);

  // Alternatives for the first field-level issue.
  const target = first.issues.find((i) => i.target !== 'general');
  let distinct: boolean | null = null;
  if (target) {
    const item = { ...target, id: 'eval', resolved: false } as ChallengeItem;
    const alts = await call('alternatives', alternativesPrompt.system, alternativesPrompt.user(dna, item, String(getPath(dna, item.target) ?? '')), AlternativesSchema, dna, { target: item.target });
    distinct = new Set(alts.alternatives.map((a) => a.statement.toLowerCase())).size === 3;
  }

  // Accept every suggestion, then ask the reviewer again.
  for (const i of first.issues) if (i.target !== 'general' && i.suggestedValue) applyChallengeValue(dna, i.target, i.suggestedValue);
  dna.challenges = first.issues.map((i) => ({ ...i, id: i.title, resolved: true, resolution: 'accepted' as const }));
  const second = await call('challenge', challengePrompt.system, challengePrompt.user(dna), ChallengeSchema, dna);

  return {
    idea,
    issuesBefore: first.issues.length,
    issuesAfter: second.issues.length,
    grounded: `${firstScore.grounded}/${firstScore.total}`,
    actionable: `${firstScore.actionable}/${firstScore.total}`,
    converges: second.issues.length < first.issues.length || second.issues.length === 0,
    distinctAlternatives: distinct,
    issues: first.issues.map((i) => `[${i.severity}] ${i.title} → ${i.suggestedValue || '(advisory)'}`),
  };
}

async function main() {
  console.log(`\nIdeaForge prompt eval — provider: ${provider.name} (${provider.model})\n`);
  const results = [];
  for (const idea of IDEAS) {
    try {
      const r = await evaluate(idea);
      results.push(r);
      console.log(`✦ ${idea}`);
      console.log(`  issues ${r.issuesBefore} → ${r.issuesAfter} · grounded ${r.grounded} · actionable ${r.actionable} · converges ${r.converges ? 'yes' : 'NO'} · distinct alts ${r.distinctAlternatives ?? 'n/a'}`);
      r.issues.forEach((i) => console.log(`    ${i}`));
    } catch (err) {
      results.push({ idea, error: (err as Error).message });
      console.log(`✗ ${idea}\n  ${(err as Error).message}`);
    }
  }
  const ok = results.filter((r) => 'converges' in r && r.converges).length;
  console.log(`\nConverged on ${ok}/${IDEAS.length} ideas.`);
  mkdirSync('eval-results', { recursive: true });
  const file = `eval-results/eval-${provider.name}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(results, null, 2));
  console.log(`Full report: ${file}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
