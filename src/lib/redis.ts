import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

const redisUrl = process.env.REDIS_URL;
// Upstash uses rediss:// (TLS). ioredis needs tls option enabled for it.
const isTls = redisUrl?.startsWith('rediss://');

export const redis =
  globalForRedis.redis ||
  (redisUrl
    ? new Redis(redisUrl, {
        family: 0,
        enableOfflineQueue: false,
        keepAlive: 10000,
        ...(isTls ? { tls: {} } : {}),
      })
    : new Redis(parseInt(process.env.REDIS_PORT || '6379', 10), process.env.REDIS_HOST || '127.0.0.1', {
        enableOfflineQueue: false,
        keepAlive: 10000,
      }));

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err) => {
  // Always log Redis errors — silent failures cause buttons to hang with no feedback
  console.error('[Redis] Connection error:', err.message);
});
