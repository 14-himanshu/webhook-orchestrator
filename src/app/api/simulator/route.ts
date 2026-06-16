import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@clerk/nextjs/server';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await request.text();
    
    // Generate the required signature for the Ingestion API
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
    
    // Forward the request to our own ingestion API to simulate an external client
    // We use the dynamic origin so this works both locally and on Vercel
    const origin = new URL(request.url).origin;
    const res = await fetch(`${origin}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-idempotency-key': crypto.randomUUID(),
        'x-user-id': userId,
        // Forward the IP address for rate limiting
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '127.0.0.1'
      },
      body: rawBody
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Simulator Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to proxy simulated webhook' }, { status: 500 });
  }
}
