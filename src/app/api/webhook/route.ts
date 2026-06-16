import { NextResponse } from 'next/server';
import { webhookQueue } from '@/queue/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.targetUrl) {
      return NextResponse.json({ error: 'targetUrl is required' }, { status: 400 });
    }

    const job = await webhookQueue.add('deliver-webhook', {
      url: body.targetUrl,
      body: body.payload || {},
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
