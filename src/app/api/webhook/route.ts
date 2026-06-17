import { NextResponse } from 'next/server';
import { z } from 'zod';
import { webhookQueue } from '@/queue/config';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    // 1. Read raw body for HMAC signature
    const rawBody = await request.text();
    
    // 2. Security: HMAC Signature Verification
    const signatureHeader = request.headers.get('x-signature');
    if (!signatureHeader) {
      return NextResponse.json({ error: 'x-signature header is required' }, { status: 401 });
    }

    // Require x-user-id so webhooks are mapped to a specific tenant
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'x-user-id header is required for multi-tenant mapping' }, { status: 401 });
    }

    // 1.5 Fetch User Settings
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const activeSecret = settings?.webhookSecret || WEBHOOK_SECRET;
    const activeMaxRetries = settings?.maxRetries || 3;

    const expectedSignature = crypto.createHmac('sha256', activeSecret).update(rawBody).digest('hex');

    if (signatureHeader !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }



    // 3. Parse and Validate JSON Payload using Zod
    const webhookSchema = z.object({
      targetUrl: z.string().url("targetUrl must be a valid URL"),
      payload: z.any().optional().default({}),
    });

    let rawBodyJson;
    try {
      rawBodyJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validationResult = webhookSchema.safeParse(rawBodyJson);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const body = validationResult.data;

    // 4. Smarter Rate Limiting: Rate limit by Target URL, not IP address
    // This prevents massive legitimate providers from being blocked during traffic spikes
    const currentMinute = new Date().getMinutes();
    const rateLimitKey = `rate-limit:targetUrl:${body.targetUrl}:${currentMinute}`;
    // Atomic rate limit check using pipeline
    const pipeline = redis.multi();
    pipeline.incr(rateLimitKey);
    pipeline.expire(rateLimitKey, 60);
    const results = await pipeline.exec();
    
    // Multi exec returns an array of [error, result] for each command
    // The first result is from incr, we want its value
    const currentRequests = results?.[0]?.[1] as number;
    
    // Allow up to 100 requests per minute per specific target URL
    if (currentRequests > 100) {
      return NextResponse.json({ error: 'Too Many Requests for this Target URL' }, { status: 429 });
    }

    // 5. Strict Idempotency Check
    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'x-idempotency-key header is required' }, { status: 400 });
    }

    const redisIdempotencyKey = `idempotency:${idempotencyKey}`;
    // Atomic lock: SET key value NX (only if it does not exist) EX (expire in seconds)
    const isNewRequest = await redis.set(redisIdempotencyKey, '1', 'EX', 86400, 'NX');
    
    if (!isNewRequest) {
      // Key already exists! This means we have already processed this exact webhook payload.
      // Return success instantly without queuing a duplicate job.
      return NextResponse.json({ success: true, message: 'Duplicate request ignored (Idempotent)' });
    }

    // Generate outgoing signature for the target server to verify
    const payloadString = JSON.stringify(body.payload || {});
    const outgoingSignature = crypto.createHmac('sha256', activeSecret).update(payloadString).digest('hex');

    // 4. Queue the Job
    const job = await webhookQueue.add('deliver-webhook', {
      url: body.targetUrl,
      body: body.payload || {},
      signature: outgoingSignature,
      userId: userId,
    }, {
      attempts: activeMaxRetries,
      backoff: { type: 'exponential', delay: 1000 }
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error('Failed to process webhook ingestion:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
