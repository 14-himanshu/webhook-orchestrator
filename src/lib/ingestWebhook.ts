import { webhookQueue } from '@/queue/config';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';

const DEFAULT_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

const webhookSchema = z.object({
  targetUrl: z.string().url('targetUrl must be a valid URL'),
  payload: z.any().optional().default({}),
});

export type IngestResult =
  | { success: true; jobId: string }
  | { success: false; error: string; status: number };

/**
 * Core webhook ingestion logic — shared by /api/webhook (external) and
 * /api/simulator (internal). Avoids self-referential fetch() on Vercel
 * which causes serverless function deadlocks.
 */
export async function ingestWebhook(
  rawBody: string,
  incomingSignature: string | null,
  idempotencyKey: string | null,
  tenantId: string,
): Promise<IngestResult> {
  // 1. Fetch per-tenant settings
  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });
  const activeSecret = settings?.webhookSecret || DEFAULT_WEBHOOK_SECRET;
  const activeMaxRetries = settings?.maxRetries || 3;

  // 2. HMAC Signature Verification
  if (!incomingSignature) {
    return { success: false, error: 'x-signature header is required', status: 401 };
  }
  const expectedSignature = crypto
    .createHmac('sha256', activeSecret)
    .update(rawBody)
    .digest('hex');
  if (incomingSignature !== expectedSignature) {
    return { success: false, error: 'Invalid signature', status: 401 };
  }

  // 3. Parse & Validate JSON
  let rawBodyJson;
  try {
    rawBodyJson = JSON.parse(rawBody);
  } catch {
    return { success: false, error: 'Invalid JSON payload', status: 400 };
  }
  const validationResult = webhookSchema.safeParse(rawBodyJson);
  if (!validationResult.success) {
    return { success: false, error: 'Validation failed', status: 400 };
  }
  const body = validationResult.data;

  // 4. Rate Limiting (100 req/sec per tenant to prevent Redis/Queue overflow)
  const currentSecond = Math.floor(Date.now() / 1000);
  const rateLimitKey = `ingest-rate-limit:${tenantId}:${currentSecond}`;
  const pipeline = redis.multi();
  pipeline.incr(rateLimitKey);
  pipeline.expire(rateLimitKey, 60);
  const results = await pipeline.exec();
  const currentRequests = results?.[0]?.[1] as number;
  if (currentRequests > 100) {
    return { success: false, error: 'Too Many Requests for this Target URL', status: 429 };
  }

  // 5. Idempotency Check
  if (!idempotencyKey) {
    return { success: false, error: 'x-idempotency-key header is required', status: 400 };
  }
  const redisIdempotencyKey = `idempotency:${idempotencyKey}`;
  const isNewRequest = await redis.set(redisIdempotencyKey, '1', 'EX', 86400, 'NX');
  if (!isNewRequest) {
    // Duplicate — return success without re-queuing
    return { success: true, jobId: 'duplicate-ignored' };
  }

  // 6. Generate outgoing signature & enqueue
  const payloadString = JSON.stringify(body.payload || {});
  const outgoingSignature = crypto
    .createHmac('sha256', activeSecret)
    .update(payloadString)
    .digest('hex');

  const job = await webhookQueue.add(
    'deliver-webhook',
    {
      url: body.targetUrl,
      body: body.payload || {},
      signature: outgoingSignature,
      userId: tenantId, // Keeping the job payload key as userId for backward compatibility in worker if needed, or rename to tenantId. Wait, let's rename to tenantId!
      tenantId,
    },
    {
      attempts: activeMaxRetries,
      backoff: { type: 'exponential', delay: 1000 },
    },
  );

  await prisma.event.create({
    data: {
      jobId: job.id!,
      targetUrl: body.targetUrl,
      payload: body.payload || {},
      status: 'processing',
      tenantId,
    }
  });

  return { success: true, jobId: job.id! };
}
