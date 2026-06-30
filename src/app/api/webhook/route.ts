import { NextResponse } from 'next/server';
import { ingestWebhook } from '@/lib/ingestWebhook';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'x-tenant-id header is required for multi-tenant mapping' },
        { status: 401 },
      );
    }

    const result = await ingestWebhook(
      rawBody,
      request.headers.get('x-signature'),
      request.headers.get('x-idempotency-key'),
      tenantId,
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
