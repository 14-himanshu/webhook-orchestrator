import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) 
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    };

if (connection instanceof Redis) {
  connection.on('error', (err) => {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') return;
    console.error('Redis Queue connection error:', err.message);
  });
}

export const webhookQueue = new Queue('incoming-webhooks', {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});
