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

    // 2. Strict Idempotency Check
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

    // 3. Security: HMAC Signature Verification
    const signatureHeader = request.headers.get('x-signature');
    if (!signatureHeader) {
      return NextResponse.json({ error: 'x-signature header is required' }, { status: 401 });
    }

    // We must read the raw text for signature verification so we don't break the hash
    const rawBody = await request.text();
    const expectedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');

    if (signatureHeader !== expectedSignature) {
      // Invalid signature, possible malicious actor
      // Delete the idempotency key so a valid request can try again
      await redis.del(redisIdempotencyKey);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Now safely parse the JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    
    if (!body.targetUrl) {
      return NextResponse.json({ error: 'targetUrl is required' }, { status: 400 });
    }

    // Generate outgoing signature for the target server to verify
    const payloadString = JSON.stringify(body.payload || {});
    const outgoingSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadString).digest('hex');

    // 4. Queue the Job
    const job = await webhookQueue.add('deliver-webhook', {
      url: body.targetUrl,
      body: body.payload || {},
      signature: outgoingSignature,
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error('Failed to process webhook ingestion:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
