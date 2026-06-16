import { NextResponse } from 'next/server';
import { webhookQueue } from '@/queue/config';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.targetUrl) {
      return NextResponse.json({ error: 'targetUrl is required' }, { status: 400 });
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
