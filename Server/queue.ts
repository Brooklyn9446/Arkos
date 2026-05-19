import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

connection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') console.warn('[Queue] Waiting for Redis connection...');
});

export const scanQueue = new Queue('scanQueue', { connection });

export const analyzeQueue = new Queue('analyzeQueue', { connection });

scanQueue.on('error', (err) => {
  console.warn('[BullMQ Queue] Error:', err.message);
});

analyzeQueue.on('error', (err) => {
  console.warn('[BullMQ AnalyzeQueue] Error:', err.message);
});
