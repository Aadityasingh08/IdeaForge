import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ZodType } from 'zod';
import { AIOutputError, AIProviderError, validateOutput, type AIProvider } from '../src/ai/providers/AIProvider';
import { emptyBrandDNA } from '../src/types/brandDNA';

// The orchestrator's retry/repair logic is tested without MongoDB: models and services are mocked.
const runs: Record<string, unknown>[] = [];
vi.mock('../src/models/AIRun', () => ({
  AIRun: {
    create: vi.fn(async (data: Record<string, unknown>) => {
      const run = { ...data, save: vi.fn(async () => undefined) };
      runs.push(run);
      return run;
    }),
  },
}));
vi.mock('../src/services/version.service', () => ({ checkpoint: vi.fn(async () => undefined) }));

const doc = {
  _id: 'p1',
  name: 'Test',
  rawIdea: 'An app that helps students find teammates for hackathons',
  currentStage: 'understand',
  brandDNA: emptyBrandDNA('An app that helps students find teammates for hackathons'),
  markModified: vi.fn(),
  save: vi.fn(async () => undefined),
};
vi.mock('../src/services/project.service', () => ({
  getProjectDoc: vi.fn(async () => doc),
  serialize: vi.fn((d: unknown) => d),
  validateIdea: vi.fn(),
  draftName: vi.fn(() => 'Test'),
}));

const { AIOrchestrator } = await import('../src/ai/AIOrchestrator');

const understanding = {
  problem: 'Students struggle to find complementary teammates.',
  targetAudience: { primary: 'College students', secondary: '' },
  userNeed: 'A fast way to find teammates.',
  context: '',
  opportunity: 'Own skill-based matching.',
  keyInsights: ['Skill gaps decide outcomes.'],
  assumptions: [],
  openQuestions: [],
};

/** A provider that returns scripted responses, validated exactly like the real one. */
function scripted(responses: (string | Error)[]): AIProvider & { prompts: string[] } {
  const prompts: string[] = [];
  return {
    name: 'llm',
    model: 'test-model',
    prompts,
    async generateStructured<T>(_s: string, user: string, schema: ZodType<T>) {
      prompts.push(user);
      const next = responses.shift();
      if (next instanceof Error) throw next;
      return validateOutput(schema, next ?? '');
    },
  };
}

beforeEach(() => {
  runs.length = 0;
  doc.brandDNA = emptyBrandDNA(doc.rawIdea);
});

describe('AIOrchestrator', () => {
  it('saves valid output into BrandDNA and logs a successful run', async () => {
    const ai = new AIOrchestrator(scripted([JSON.stringify(understanding)]));
    await ai.understandIdea('p1');
    expect(doc.brandDNA.idea).toMatchObject({ problem: understanding.problem });
    expect(runs[0]).toMatchObject({ task: 'understand', status: 'success', attempts: 1 });
  });

  it('repairs malformed output once, telling the model what was wrong', async () => {
    const provider = scripted(['{"problem": ""}', JSON.stringify(understanding)]);
    await new AIOrchestrator(provider).understandIdea('p1');
    expect(provider.prompts).toHaveLength(2);
    expect(provider.prompts[1]).toMatch(/did not match the required JSON schema/);
    expect(runs[0]).toMatchObject({ status: 'success', attempts: 2 });
  });

  it('retries a transient failure once', async () => {
    const provider = scripted([new AIProviderError('timeout', true), JSON.stringify(understanding)]);
    await new AIOrchestrator(provider).understandIdea('p1');
    expect(runs[0]).toMatchObject({ status: 'success', attempts: 2 });
  });

  it('fails with a friendly 502 and never stores malformed output', async () => {
    const provider = scripted(['not json', 'still not json']);
    await expect(new AIOrchestrator(provider).understandIdea('p1')).rejects.toMatchObject({
      status: 502,
      message: 'Something went wrong while analyzing your idea.',
    });
    expect(doc.brandDNA.idea).not.toHaveProperty('problem');
    expect(runs[0]).toMatchObject({ status: 'failed', attempts: 2 });
  });

  it('does not retry non-retryable provider errors', async () => {
    const provider = scripted([new AIProviderError('bad key', false), JSON.stringify(understanding)]);
    await expect(new AIOrchestrator(provider).understandIdea('p1')).rejects.toMatchObject({ status: 502 });
    expect(provider.prompts).toHaveLength(1);
  });

  it('surfaces schema errors as AI_INVALID_OUTPUT', async () => {
    const err = new AIOutputError('bad', '{}', ['problem: required']);
    const provider = scripted([err, err]);
    await expect(new AIOrchestrator(provider).understandIdea('p1')).rejects.toMatchObject({ code: 'AI_INVALID_OUTPUT' });
  });
});
