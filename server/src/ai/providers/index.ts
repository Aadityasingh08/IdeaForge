import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { AIProvider } from './AIProvider';
import { FallbackProvider } from './FallbackProvider';
import { LLMProvider } from './LLMProvider';

/** Provider is chosen on the server only — the client can never pick a model or provider. */
export function createProvider(): AIProvider {
  if (env.aiProvider === 'llm') {
    if (env.aiApiKey) {
      logger.info(`AI provider: LLM (${env.aiModel})`);
      return new LLMProvider(env.aiApiKey);
    }
    logger.warn('AI_PROVIDER=llm but AI_API_KEY is empty — falling back to demo mode.');
  }
  logger.info('AI provider: development fallback (demo mode)');
  return new FallbackProvider();
}
