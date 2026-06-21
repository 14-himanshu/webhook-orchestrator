import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
// Upstash uses rediss:// (TLS). ioredis needs the tls option for it.
const isTls = redisUrl?.startsWith('rediss://');

const connection = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      family: 0,
      enableOfflineQueue: false,
      keepAlive: 10000,
      ...(isTls ? { tls: {} } : {}),
    })
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      keepAlive: 10000,
    };

if (connection instanceof Redis) {
  connection.on('error', (err) => {
    // Always log — silent failures here cause the queue to hang with no feedback
    console.error('[BullMQ Redis] Connection error:', err.message);
  });
}

export const webhookQueue = new Queue('incoming-webhooks', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
