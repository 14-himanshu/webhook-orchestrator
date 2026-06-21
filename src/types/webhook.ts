// Shared TypeScript types for DLQ and WebhookLog records
// Used across ActionRequiredQueue, DeadLetterRow, and the history page

import type { Prisma } from '@prisma/client';

export interface DLQItem {
  id: string;
  jobId: string;
  targetUrl: string;
  payload: Prisma.JsonValue;
  failedAt: Date | string;
  errorReason: string;
  userId: string;
}

export interface WebhookLogItem {
  id: string;
  jobId: string;
  targetUrl: string;
  payload: Prisma.JsonValue;
  deliveredAt: Date | string;
  userId: string;
}
