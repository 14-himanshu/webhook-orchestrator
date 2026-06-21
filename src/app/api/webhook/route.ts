import { NextResponse } from 'next/server';
import { ingestWebhook } from '@/lib/ingestWebhook';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'x-user-id header is required for multi-tenant mapping' },
        { status: 401 },
      );
    }

    const result = await ingestWebhook(
      rawBody,
      request.headers.get('x-signature'),
      request.headers.get('x-idempotency-key'),
      userId,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, jobId: result.jobId });
  } catch (error) {
    console.error('Failed to process webhook ingestion:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
