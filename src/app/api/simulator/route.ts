import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { ingestWebhook } from '@/lib/ingestWebhook';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = orgId || userId;

    const rawBody = await request.text();

    // Generate the required HMAC signature — same as an external client would
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    // Call the ingestion logic directly — no HTTP round-trip needed.
    // A self-referential fetch() causes a serverless deadlock on Vercel.
    const result = await ingestWebhook(
      rawBody,
      signature,
      crypto.randomUUID(), // fresh idempotency key per request
      tenantId,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, jobId: result.jobId });
  } catch (error) {
    console.error('Simulator Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to proxy simulated webhook' }, { status: 500 });
  }
}

