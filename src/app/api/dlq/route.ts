import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = orgId || userId;

    const { searchParams } = new URL(request.url);
    const dlqId = searchParams.get('id');

    if (!dlqId) {
      return NextResponse.json({ error: 'dlqId is required' }, { status: 400 });
    }

    const dlqRecord = await prisma.event.findUnique({
      where: { id: dlqId },
    });

    if (!dlqRecord) {
      return NextResponse.json({ error: 'DLQ record not found' }, { status: 404 });
    }

    if (dlqRecord.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.event.delete({ where: { id: dlqId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DLQ Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
