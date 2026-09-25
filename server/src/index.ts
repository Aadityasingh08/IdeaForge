import { env } from './config/env';
import { connectDatabase } from './config/db';
import { createApp } from './app';
import { logger } from './utils/logger';
import { AIRun } from './models/AIRun';

async function main() {
  try {
    await connectDatabase();
    const stale = await AIRun.updateMany({ status: 'running' }, { status: 'failed', error: 'Interrupted by a server restart.' });
    if (stale.modifiedCount) logger.warn(`Marked ${stale.modifiedCount} interrupted AI run(s) as failed`);
  } catch (err) {
    logger.warn(`MongoDB not connected yet (${err instanceof Error ? err.message : err}).`);
    logger.warn('Please provide a MongoDB connection string in server/.env or start local MongoDB.');
    logger.info('Server is running and will automatically connect when MongoDB is ready.');

    const retryTimer = setInterval(async () => {
      try {
        await connectDatabase();
        logger.info('MongoDB successfully connected in background!');
        clearInterval(retryTimer);
      } catch {
        // Silently retry
      }
    }, 5000);
  }

  const app = createApp();
  const server = app.listen(env.port, '0.0.0.0', () => logger.info(`IdeaForge API listening on http://0.0.0.0:${env.port}`));
  server.on('error', (err: NodeJS.ErrnoException) => {
    logger.error(err.code === 'EADDRINUSE' ? `Port ${env.port} is already in use — stop the other process or change PORT.` : err.message);
    process.exit(1);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err instanceof Error ? err.message : err);
  process.exit(1);
});
