import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis || 
  (process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL) 
    : new Redis(parseInt(process.env.REDIS_PORT || '6379', 10), process.env.REDIS_HOST || '127.0.0.1')
  );

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err) => {
  // Suppress connection errors during Vercel build where Redis isn't available
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return;
  }
  console.error('Redis connection error:', err.message);
});
