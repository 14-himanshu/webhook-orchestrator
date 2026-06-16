import { NextResponse } from 'next/server';
import { webhookQueue } from '@/queue/config';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // 1. Rate Limiting: Max 100 requests per minute per IP
    const currentMinute = new Date().getMinutes();
    const rateLimitKey = `rate-limit:${ip}:${currentMinute}`;
    const currentRequests = await redis.incr(rateLimitKey);
    
    if (currentRequests === 1) {
      await redis.expire(rateLimitKey, 60);
    }
    
    if (currentRequests > 100) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const body = await request.json();
    
    if (!body.targetUrl) {
      return NextResponse.json({ error: 'targetUrl is required' }, { status: 400 });
    }

    // 2. Idempotency Check
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const redisIdempotencyKey = `idempotency:${idempotencyKey}`;
      // SETNX: Sets the key if it doesn't exist. Returns 1 if set, 0 if it already existed.
      const isNewRequest = await redis.setnx(redisIdempotencyKey, '1');
      if (isNewRequest) {
        // Expire the idempotency key after 24 hours to clean up memory
        await redis.expire(redisIdempotencyKey, 60 * 60 * 24);
      } else {
        // Key already exists! This means we have already processed this exact webhook payload.
        // Return success instantly without queuing a duplicate job.
        return NextResponse.json({ success: true, message: 'Duplicate request ignored (Idempotent)' });
      }
    }

    const payloadString = JSON.stringify(body.payload || {});
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadString).digest('hex');

    const job = await webhookQueue.add('deliver-webhook', {
      url: body.targetUrl,
      body: body.payload || {},
      signature,
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
