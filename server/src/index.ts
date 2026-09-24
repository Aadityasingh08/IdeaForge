import { env } from './config/env';
import { connectDatabase } from './config/db';
import { createApp } from './app';
import { logger } from './utils/logger';
import { AIRun } from './models/AIRun';

async function main() {
  await connectDatabase();
  // Runs interrupted by a restart can never finish — record them honestly as failed.
  const stale = await AIRun.updateMany({ status: 'running' }, { status: 'failed', error: 'Interrupted by a server restart.' });
  if (stale.modifiedCount) logger.warn(`Marked ${stale.modifiedCount} interrupted AI run(s) as failed`);
  const app = createApp();
  const server = app.listen(env.port, () => logger.info(`IdeaForge API listening on http://localhost:${env.port}`));
  server.on('error', (err: NodeJS.ErrnoException) => {
    logger.error(err.code === 'EADDRINUSE' ? `Port ${env.port} is already in use — stop the other process or change PORT.` : err.message);
    process.exit(1);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err instanceof Error ? err.message : err);
  process.exit(1);
});
