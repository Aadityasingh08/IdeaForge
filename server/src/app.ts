import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { originCheck, sessionMiddleware } from './utils/auth';
import { isAllowedOrigin } from './config/env';
import { createRouter } from './routes';
import { errorHandler } from './utils/http';
import { AIOrchestrator } from './ai/AIOrchestrator';
import { createProvider } from './ai/providers';

export function createApp() {
  const app = express();
  const orchestrator = new AIOrchestrator(createProvider());

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || isAllowedOrigin(origin)),
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'X-IdeaForge-Owner'],
      credentials: true, // allow the session cookie
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use('/api', originCheck, sessionMiddleware);

  app.use('/api', createRouter(orchestrator));
  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
  });
  app.use(errorHandler);
  return app;
}
