import { randomUUID } from 'node:crypto';
import type { ZodType } from 'zod';
import { AIRun } from '../models/AIRun';
import type { ProjectDoc } from '../models/Project';
import { hasFullIdea, type BrandDNA, type ChallengeItem, type Stage } from '../types/brandDNA';
import {
  AlternativesSchema,
  BrandKitSchema,
  ChallengeSchema,
  ConsistencySchema,
  MessagingSchema,
  NamingSchema,
  PersonalitySchema,
  PositioningSchema,
  UnderstandSchema,
  VisualCheckSchema,
  VisualSchema,
  type ChallengeTarget,
} from '../schemas/ai.schemas';
import { AIOutputError, AIProviderError, type AIProvider, type AITask } from './providers/AIProvider';
import { understandPrompt } from './prompts/understand.prompt';
import { messagingPrompt, namingPrompt, personalityPrompt, positioningPrompt } from './prompts/strategy.prompts';
import { alternativesPrompt, challengePrompt } from './prompts/challenge.prompts';
import { visualCheckPrompt, visualPrompt } from './prompts/visual.prompts';
import { brandKitPrompt, consistencyPrompt } from './prompts/brandKit.prompts';
import { ApiError } from '../utils/http';
import { logger } from '../utils/logger';
import { getProjectDoc, serialize, validateIdea, draftName } from '../services/project.service';
import { addUnique, advanceStage, applyChallengeValue, getPath, releaseSection } from '../services/brandDNA.service';

export type StrategySection = 'positioning' | 'personality' | 'naming' | 'messaging';

interface Prompt {
  system: string;
  user: string;
}

const FRIENDLY: Record<string, string> = {
  understand: 'Something went wrong while analyzing your idea.',
  strategy: 'Something went wrong while building your strategy.',
  challenge: 'Something went wrong while challenging your brand.',
  visual: 'Something went wrong while creating your visual direction.',
  'brand-kit': 'Something went wrong while preparing your brand kit.',
};

/**
 * AIOrchestrator — runs each stage as its own AI responsibility.
 * For every call it: provides only the relevant BrandDNA, validates the output
 * with Zod, retries once (repair prompt for malformed output, plain retry for
 * transient failures), records an AIRun, and only then updates BrandDNA.
 */
export class AIOrchestrator {
  constructor(private provider: AIProvider) {}

  get mode() {
    return this.provider.name === 'llm' ? 'connected' : 'demo';
  }

  // ------------------------------------------------------------------ core runner
  private async run<T>(
    doc: ProjectDoc,
    stage: Stage,
    task: AITask,
    prompt: Prompt,
    schema: ZodType<T>,
    extra?: Record<string, unknown>,
  ): Promise<T> {
    const started = Date.now();
    const run = await AIRun.create({
      projectId: doc._id,
      stage,
      task,
      input: { userPrompt: prompt.user, extra },
      model: this.provider.model,
      provider: this.provider.name,
      status: 'running',
    });

    const options = { task, dna: doc.brandDNA, extra };
    let attempts = 1;
    try {
      let output: T;
      try {
        output = await this.provider.generateStructured(prompt.system, prompt.user, schema, options);
      } catch (err) {
        const retry = err instanceof AIOutputError || (err instanceof AIProviderError && err.retryable);
        if (!retry) throw err;
        attempts = 2;
        if (err instanceof AIOutputError) {
          logger.warn(`AI ${task}: invalid output, attempting repair`, err.issues);
          const repair = `${prompt.user}

Your previous response could not be used because it did not match the required JSON schema.
Problems:
${err.issues.map((i) => `- ${i}`).join('\n')}

Previous response:
${err.raw.slice(0, 4000)}

Return a corrected response that fixes every problem.`;
          output = await this.provider.generateStructured(prompt.system, repair, schema, options);
        } else {
          logger.warn(`AI ${task}: transient failure, retrying once — ${(err as Error).message}`);
          output = await this.provider.generateStructured(prompt.system, prompt.user, schema, options);
        }
      }

      run.status = 'success';
      run.output = output;
      run.attempts = attempts;
      run.duration = Date.now() - started;
      await run.save();
      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown AI error';
      logger.error(`AI ${task} failed after ${attempts} attempt(s): ${message}`);
      run.status = 'failed';
      run.error = message;
      run.attempts = attempts;
      run.duration = Date.now() - started;
      await run.save().catch(() => undefined);
      const code = err instanceof AIOutputError ? 'AI_INVALID_OUTPUT' : 'AI_FAILED';
      throw new ApiError(502, code, FRIENDLY[stage] ?? 'AI couldn’t complete this step.');
    }
  }

  private async save(doc: ProjectDoc, stage?: Stage) {
    if (stage) doc.currentStage = advanceStage(doc.currentStage, stage);
    doc.markModified('brandDNA');
    await doc.save();
  }

  private requireIdea(dna: BrandDNA) {
    if (!hasFullIdea(dna.idea)) {
      throw new ApiError(409, 'PRECONDITION_FAILED', 'Run the Understand stage first.');
    }
  }

  private requireStrategy(dna: BrandDNA) {
    if (!dna.positioning || !dna.messaging) {
      throw new ApiError(409, 'PRECONDITION_FAILED', 'Build your strategy before this step.');
    }
  }

  // ------------------------------------------------------------------ Stage 1
  async understandIdea(projectId: string, rawIdea?: string) {
    const doc = await getProjectDoc(projectId);
    if (rawIdea && rawIdea.trim() !== doc.rawIdea) {
      validateIdea(rawIdea);
      doc.rawIdea = rawIdea.trim();
      if (!doc.brandDNA.naming?.selectedName) doc.name = draftName(rawIdea);
    }
    const idea = doc.rawIdea;
    // The AI sees only the raw idea — understanding happens before any branding.
    const output = await this.run(doc, 'understand', 'understand', { system: understandPrompt.system, user: understandPrompt.user(idea) }, UnderstandSchema);
    doc.brandDNA.idea = { rawIdea: idea, ...output };
    releaseSection(doc.brandDNA, 'idea');
    await this.save(doc, 'understand');
    return serialize(doc);
  }

  // ------------------------------------------------------------------ Stage 2
  async buildStrategy(projectId: string, section?: StrategySection) {
    const doc = await getProjectDoc(projectId);
    this.requireIdea(doc.brandDNA);

    if (section) {
      // Regenerate only the requested section; everything else stays untouched.
      releaseSection(doc.brandDNA, section);
      await this.runStrategySection(doc, section, true);
      await this.save(doc, 'strategy');
      return serialize(doc);
    }

    // Full strategy: positioning first, then personality + naming, then messaging.
    // Only missing sections are generated and each is saved as it completes, so a
    // retry after a partial failure never discards work that already exists.
    const order: StrategySection[] = ['positioning', 'personality', 'naming', 'messaging'];
    for (const s of order) {
      if (doc.brandDNA[s]) continue;
      await this.runStrategySection(doc, s);
      await this.save(doc);
    }
    await this.save(doc, 'strategy');
    return serialize(doc);
  }

  private async runStrategySection(doc: ProjectDoc, section: StrategySection, regenerate = false) {
    const dna = doc.brandDNA;
    const note = regenerate
      ? `\n\nThe user asked to REGENERATE the ${section}. Offer a fresh, meaningfully different take that still fits the stored context.`
      : '';

    switch (section) {
      case 'positioning': {
        const out = await this.run(doc, 'strategy', 'positioning', { system: positioningPrompt.system, user: positioningPrompt.user(dna) + note }, PositioningSchema);
        dna.positioning = out;
        break;
      }
      case 'personality': {
        const out = await this.run(doc, 'strategy', 'personality', { system: personalityPrompt.system, user: personalityPrompt.user(dna) + note }, PersonalitySchema);
        dna.personality = out;
        break;
      }
      case 'naming': {
        const out = await this.run(doc, 'strategy', 'naming', { system: namingPrompt.system, user: namingPrompt.user(dna) + note }, NamingSchema);
        dna.naming = { ...out, selectedName: dna.naming?.selectedName, selectedTerritory: undefined };
        break;
      }
      case 'messaging': {
        const out = await this.run(doc, 'strategy', 'messaging', { system: messagingPrompt.system, user: messagingPrompt.user(dna) + note }, MessagingSchema);
        dna.messaging = out;
        break;
      }
    }
  }

  // ------------------------------------------------------------------ Stage 3
  async challengeBrand(projectId: string) {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    this.requireStrategy(dna);

    const out = await this.run(doc, 'challenge', 'challenge', { system: challengePrompt.system, user: challengePrompt.user(dna) }, ChallengeSchema);

    // Keep resolved history; replace open issues with the fresh review.
    const history = dna.challenges.filter((c) => c.resolved);
    const fresh: ChallengeItem[] = out.issues.map((i) => ({
      ...i,
      id: randomUUID(),
      suggestedValue: i.target === 'general' ? '' : i.suggestedValue,
      resolved: false,
    }));
    dna.challenges = [...fresh, ...history];
    dna.challengeSummary = {
      overallAssessment: out.overallAssessment,
      recommendedDirection: out.recommendedDirection,
      ranAt: new Date().toISOString(),
    };
    await this.save(doc, 'challenge');
    return serialize(doc);
  }

  async applyImprovement(projectId: string, rec: { challengeId?: string; source: 'issue' | 'direction' | 'alternative'; target: ChallengeTarget; value: string }) {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    const item = rec.challengeId ? dna.challenges.find((c) => c.id === rec.challengeId) : undefined;
    if (rec.challengeId && !item) throw new ApiError(404, 'NOT_FOUND', 'Challenge not found.');
    if (rec.target !== 'general' && !rec.value.trim()) throw new ApiError(400, 'VALIDATION_ERROR', 'A replacement value is required.');

    const before = rec.target === 'general' ? null : (getPath(dna, rec.target) as string | undefined) ?? '';
    // Only the affected decision changes — nothing is regenerated.
    applyChallengeValue(dna, rec.target, rec.value.trim());
    if (rec.target === 'naming.selectedName') doc.name = rec.value.trim();
    if (rec.target !== 'general') dna.decisions.accepted = addUnique(dna.decisions.accepted, rec.target);

    const now = new Date().toISOString();
    const resolution = rec.source === 'alternative' ? 'alternative' : 'accepted';
    const resolve = (c: ChallengeItem) => {
      c.resolved = true;
      c.resolution = resolution;
      c.originalValue = before ?? undefined;
      c.appliedValue = rec.value.trim();
      c.resolvedAt = now;
    };
    if (item) resolve(item);
    // Any other open issue on the same field is resolved by the same change.
    if (rec.target !== 'general') dna.challenges.filter((c) => !c.resolved && c.target === rec.target).forEach(resolve);
    const dir = dna.challengeSummary?.recommendedDirection;
    if (dir && (rec.source === 'direction' || dir.target === rec.target)) {
      dir.resolution = resolution;
      dir.appliedValue = rec.value.trim();
    }

    await AIRun.create({
      projectId: doc._id,
      stage: 'challenge',
      task: 'apply-improvement',
      input: { challengeId: rec.challengeId, source: rec.source, target: rec.target, from: before },
      output: { to: rec.value.trim() },
      model: 'user-decision',
      provider: 'user',
      status: 'success',
      duration: 0,
    });
    await this.save(doc);
    return serialize(doc);
  }

  async keepOriginal(projectId: string, challengeId: string | 'direction') {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    if (challengeId === 'direction') {
      if (!dna.challengeSummary?.recommendedDirection) throw new ApiError(404, 'NOT_FOUND', 'Recommendation not found.');
      dna.challengeSummary.recommendedDirection.resolution = 'kept_original';
    } else {
      const item = dna.challenges.find((c) => c.id === challengeId);
      if (!item) throw new ApiError(404, 'NOT_FOUND', 'Challenge not found.');
      item.resolved = true;
      item.resolution = 'kept_original';
      item.resolvedAt = new Date().toISOString();
      if (item.target !== 'general') {
        item.originalValue = String(getPath(dna, item.target) ?? '');
        dna.decisions.accepted = addUnique(dna.decisions.accepted, item.target);
      }
    }
    await AIRun.create({
      projectId: doc._id,
      stage: 'challenge',
      task: 'keep-original',
      input: { challengeId },
      output: { resolution: 'kept_original' },
      model: 'user-decision',
      provider: 'user',
      status: 'success',
      duration: 0,
    });
    await this.save(doc);
    return serialize(doc);
  }

  async generateAlternatives(projectId: string, challengeId: string | 'direction') {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    let item: ChallengeItem | undefined;
    if (challengeId === 'direction') {
      const dir = dna.challengeSummary?.recommendedDirection;
      if (!dir) throw new ApiError(404, 'NOT_FOUND', 'Recommendation not found.');
      item = {
        id: 'direction',
        type: 'weak_differentiation',
        severity: 'medium',
        title: 'Recommended direction',
        description: dir.whyItWorks.join(' '),
        evidence: String(getPath(dna, dir.target) ?? ''),
        recommendation: dir.statement,
        target: dir.target,
        suggestedValue: dir.statement,
        resolved: false,
      };
    } else {
      item = dna.challenges.find((c) => c.id === challengeId);
      if (!item) throw new ApiError(404, 'NOT_FOUND', 'Challenge not found.');
    }
    if (item.target === 'general') throw new ApiError(400, 'VALIDATION_ERROR', 'This issue has no single field to rewrite.');

    const current = String(getPath(dna, item.target) ?? '');
    const out = await this.run(
      doc,
      'challenge',
      'alternatives',
      { system: alternativesPrompt.system, user: alternativesPrompt.user(dna, item, current) },
      AlternativesSchema,
      { target: item.target },
    );
    if (challengeId !== 'direction') item.alternatives = out.alternatives;
    await this.save(doc);
    return { project: serialize(doc), alternatives: out.alternatives, target: item.target };
  }

  // ------------------------------------------------------------------ Stage 4
  async generateVisualIdentity(projectId: string) {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    this.requireStrategy(dna);
    if (!dna.personality) throw new ApiError(409, 'PRECONDITION_FAILED', 'Define a brand personality first.');

    const visual = await this.run(doc, 'visual', 'visual', { system: visualPrompt.system, user: visualPrompt.user(dna) }, VisualSchema);
    dna.visual = { ...visual, colors: visual.colors.map((c) => ({ ...c, hex: c.hex.toUpperCase() })) };

    // Lightweight consistency check before the visual direction is considered final.
    try {
      const check = await this.run(doc, 'visual', 'visual-check', { system: visualCheckPrompt.system, user: visualCheckPrompt.user(dna) }, VisualCheckSchema);
      dna.visualCheck = { ...check, ranAt: new Date().toISOString() };
    } catch {
      dna.visualCheck = undefined; // the visual itself is still valid and saved
    }
    await this.save(doc, 'visual');
    return serialize(doc);
  }

  // ------------------------------------------------------------------ Stage 5
  async generateBrandKit(projectId: string) {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    this.requireStrategy(dna);
    if (!dna.visual) throw new ApiError(409, 'PRECONDITION_FAILED', 'Create your visual direction first.');

    const kit = await this.run(doc, 'brand-kit', 'brand-kit', { system: brandKitPrompt.system, user: brandKitPrompt.user(dna) }, BrandKitSchema);
    dna.brandKit = { ...kit, generatedAt: new Date().toISOString() };
    dna.finalBrand = { name: kit.name, tagline: kit.tagline, summary: kit.brandSummary };
    doc.name = kit.name;
    await this.save(doc, 'complete');
    return serialize(doc);
  }

  async checkConsistency(projectId: string) {
    const doc = await getProjectDoc(projectId);
    const dna = doc.brandDNA;
    this.requireStrategy(dna);
    const out = await this.run(doc, 'brand-kit', 'consistency', { system: consistencyPrompt.system, user: consistencyPrompt.user(dna) }, ConsistencySchema);
    dna.consistency = { ...out, ranAt: new Date().toISOString() };
    await this.save(doc);
    return serialize(doc);
  }
}
