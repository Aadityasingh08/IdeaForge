import 'dotenv/config';

const list = (value: string | undefined, fallback: string) =>
  (value || fallback)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const effort = (process.env.AI_EFFORT || 'medium').toLowerCase();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ideaforge',
  aiProvider: (process.env.AI_PROVIDER || 'fallback').toLowerCase(),
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'claude-opus-5',
  aiEffort: (['low', 'medium', 'high', 'xhigh', 'max'].includes(effort) ? effort : 'medium') as
    | 'low'
    | 'medium'
    | 'high'
    | 'xhigh'
    | 'max',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 120_000,
  clientUrls: list(process.env.CLIENT_URL, 'http://localhost:5173'),
};

export const isProduction = env.nodeEnv === 'production';
