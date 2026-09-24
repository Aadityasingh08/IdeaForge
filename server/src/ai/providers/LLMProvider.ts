import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { ZodType } from 'zod';
import { env } from '../../config/env';
import { AIProviderError, validateOutput, type AIProvider, type AIRequestOptions } from './AIProvider';

/**
 * Real model provider (Claude via the official Anthropic SDK).
 * - Structured output is constrained with the stage's Zod schema.
 * - SDK retries are disabled: the orchestrator retries once, for transient
 *   failures and for malformed output (with a repair prompt).
 * - The response is re-validated with Zod before it is returned.
 */
export class LLMProvider implements AIProvider {
  readonly name = 'llm' as const;
  readonly model = env.aiModel;
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, timeout: env.aiTimeoutMs, maxRetries: 0 });
  }

  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodType<T>,
    _options: AIRequestOptions,
  ): Promise<T> {
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        output_config: {
          effort: env.aiEffort,
          format: zodOutputFormat(schema as never),
        },
      });
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        throw new AIProviderError('The AI provider rejected the configured credentials.');
      }
      if (err instanceof Anthropic.RateLimitError) {
        throw new AIProviderError('The AI provider is rate limiting requests. Try again shortly.', true);
      }
      if (err instanceof Anthropic.APIConnectionTimeoutError) {
        throw new AIProviderError('The AI provider took too long to respond.', true);
      }
      if (err instanceof Anthropic.APIConnectionError) {
        throw new AIProviderError('Could not reach the AI provider.', true);
      }
      if (err instanceof Anthropic.APIError) {
        throw new AIProviderError(`AI provider error (${err.status ?? 'unknown'}).`, (err.status ?? 500) >= 500);
      }
      throw err;
    }

    if (response.stop_reason === 'refusal') {
      throw new AIProviderError('The AI declined to complete this step.');
    }
    if (response.stop_reason === 'max_tokens') {
      throw new AIProviderError('The AI response was cut off before it finished.', true);
    }

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return validateOutput(schema, raw);
  }
}
