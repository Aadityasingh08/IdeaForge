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
  // Requests per minute per IP: all API calls, and the (paid) AI endpoints.
  apiRateLimit: Number(process.env.API_RATE_LIMIT) || 300,
  aiRateLimit: Number(process.env.AI_RATE_LIMIT) || 30,
  // Sign-up / log-in / reset attempts per 15 minutes per IP.
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
};

export const isProduction = env.nodeEnv === 'production';

/** CLIENT_URL entries may use one leading wildcard label, e.g. https://*.trycloudflare.com */
export function isAllowedOrigin(origin: string): boolean {
  return env.clientUrls.some((allowed) => {
    if (!allowed.includes('*')) return allowed === origin;
    const [scheme, host] = allowed.split('://*');
    return origin.startsWith(scheme + '://') && origin.endsWith(host) && !origin.slice(scheme.length + 3, -host.length).includes('/');
  });
}

const sameSite = (process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax')).toLowerCase();

/** Session cookie settings. Production defaults suit a frontend and API on different domains. */
export const authConfig = {
  cookieName: 'if_session',
  sessionDays: Number(process.env.SESSION_DAYS) || 1,
  rememberDays: Number(process.env.REMEMBER_DAYS) || 30,
  sameSite: (['lax', 'strict', 'none'].includes(sameSite) ? sameSite : 'lax') as 'lax' | 'strict' | 'none',
  secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction,
  appUrl: env.clientUrls[0],
};
