import type { ZodType } from 'zod';
import type { BrandDNA } from '../../types/brandDNA';

export type AITask =
  | 'understand'
  | 'positioning'
  | 'personality'
  | 'naming'
  | 'messaging'
  | 'challenge'
  | 'alternatives'
  | 'visual'
  | 'visual-check'
  | 'brand-kit'
  | 'consistency';

/** Extra information a provider may use. The LLM provider ignores it; the fallback provider relies on it. */
export interface AIRequestOptions {
  task: AITask;
  dna: BrandDNA;
  extra?: Record<string, unknown>;
}

export interface AIProvider {
  readonly name: 'llm' | 'fallback';
  readonly model: string;
  generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodType<T>,
    options: AIRequestOptions,
  ): Promise<T>;
}

/** Output could be parsed but did not satisfy the schema — worth one repair attempt. */
export class AIOutputError extends Error {
  constructor(
    message: string,
    public raw: string,
    public issues: string[],
  ) {
    super(message);
  }
}

/** Provider-level failure (network, timeout, refusal, rate limit) after retries. */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public retryable = false,
  ) {
    super(message);
  }
}

export function validateOutput<T>(schema: ZodType<T>, raw: string): T {
  let json: unknown;
  try {
    json = JSON.parse(stripFences(raw));
  } catch {
    throw new AIOutputError('AI returned text that is not valid JSON.', raw, ['Response was not valid JSON.']);
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new AIOutputError('AI output failed schema validation.', raw, issues);
  }
  return result.data;
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}
