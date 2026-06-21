// Shared TypeScript types for DLQ and WebhookLog records
// Used across ActionRequiredQueue, DeadLetterRow, and the history page

export interface DLQItem {
  id: string;
  jobId: string;
  targetUrl: string;
  payload: Record<string, unknown>;
  failedAt: Date | string;
  errorReason: string;
  userId: string;
}

export interface WebhookLogItem {
  id: string;
  jobId: string;
  targetUrl: string;
  payload: Record<string, unknown>;
  deliveredAt: Date | string;
  userId: string;
}
