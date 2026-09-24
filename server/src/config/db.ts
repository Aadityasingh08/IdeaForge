import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
  logger.info('MongoDB connected');
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
