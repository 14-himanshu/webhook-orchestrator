import { NextResponse } from 'next/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    
    // Generate the required signature for the Ingestion API
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
    
    // Forward the request to our own ingestion API to simulate an external client
    // We use localhost:3000 because this runs in the Next.js container itself
    const res = await fetch('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-idempotency-key': crypto.randomUUID(),
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
