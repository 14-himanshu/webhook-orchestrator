import { Worker, Job } from 'bullmq';
import { sendCriticalAlert } from './utils/alerting';
import Redis from 'ioredis';
import * as http from 'http';
import prisma from './lib/prisma';

// Connection settings for Redis. In production, these should come from environment variables.
const redisUrl = process.env.REDIS_URL;
// Upstash uses rediss:// (TLS). ioredis needs the tls option enabled for it.
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

// DUMMY HTTP SERVER: This is a clever trick to allow deploying this worker
// as a FREE "Web Service" on platforms like Render or Heroku.
// They require the process to bind to a PORT to stay alive.
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Worker is running and healthy!\n');
}).listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

interface WebhookJobData {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  signature?: string;
  userId?: string;
}

console.log('Starting BullMQ worker for incoming-webhooks queue...');

const worker = new Worker<WebhookJobData>(
  'incoming-webhooks',
  async (job: Job<WebhookJobData>) => {
    const { url, body, signature } = job.data;
    
    console.log(`[Job ${job.id} | Attempt ${job.attemptsMade + 1}] Processing webhook delivery to ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (signature) {
      headers['x-webhook-signature'] = signature;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    // Use native fetch API to send a POST request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    // Check the response status
    if (!response.ok) {
      // Throwing an error is how BullMQ knows to trigger the exponential backoff retries
      // that are configured on the queue/job level.
      throw new Error(`Target server responded with status: ${response.status} ${response.statusText}`);
    }

    // If the request succeeds, log the success
    console.log(`[Job ${job.id} | Attempt ${job.attemptsMade + 1}] Successfully delivered webhook to ${url}. Status: ${response.status}`);
    return { status: response.status };
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: connection as any,
    // Rate limiter: Max 10 jobs per second globally across all workers
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

// Event: When a job succeeds
worker.on('completed', async (job: Job) => {
  console.log(`[Job ${job.id}] has successfully completed.`);
  
  if (!job.id) return;
  
  try {
    await prisma.webhookLog.create({
      data: {
        jobId: job.id,
        targetUrl: job.data.url,
        payload: job.data.body || {},
        userId: job.data.userId || "anonymous",
      },
    });
    console.log(`[Job ${job.id}] logged success to database.`);
  } catch (error) {
    console.error(`[Job ${job.id}] failed to log success to database:`, error);
  }
});

// Event: When a job fails
worker.on('failed', async (job: Job | undefined, err: Error) => {
  if (!job) {
    console.error('A job failed but no job context was provided.', err);
    return;
  }
  
  // Check if the job has exhausted all of its configured attempts
  const maxAttempts = job.opts.attempts || 1;
  
  if (job.attemptsMade >= maxAttempts) {
    // Permanent failure
    console.error(`[Job ${job.id} | Attempt ${job.attemptsMade}] permanently failed after exhausting all attempts. Error: ${err.message}`);
    
    if (!job.id) return;
    
    try {
      await prisma.deadLetterQueue.create({
        data: {
          jobId: job.id,
          targetUrl: job.data.url,
          payload: job.data.body || {},
          errorReason: err.message,
          userId: job.data.userId || "anonymous",
        },
      });
      console.log(`[Job ${job.id}] logged permanent failure to DeadLetterQueue.`);

      // Send proactive critical alert
      await sendCriticalAlert({
        jobId: job.id,
        targetUrl: job.data.url,
        errorReason: err.message,
        userId: job.data.userId,
      });

      // Clear the job from Redis to prevent memory leaks ONLY AFTER it's safely in Postgres
      await job.remove();
      console.log(`[Job ${job.id}] safely removed from Redis.`)
    } catch (dbError) {
      console.error(`[Job ${job.id}] failed to log permanent failure to database:`, dbError);
    }
  } else {
    // Temporary failure (will be retried)
    console.warn(`[Job ${job.id} | Attempt ${job.attemptsMade}] failed temporarily and will be retried via exponential backoff. Error: ${err.message}`);
  }
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Shutting down worker gracefully...');
  await worker.close();
  await prisma.$disconnect();
  
  if (connection instanceof Redis) {
    connection.quit();
  }
  
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
