export const jobEventEmitter = new EventTarget();

export interface JobEventDetail {
  id: string;
  url: string;
  body: Record<string, unknown> | null;
}

export function emitJobAdded(jobId: string, url: string, body: Record<string, unknown> | null) {
  const event = new CustomEvent<JobEventDetail>('job_added', {
    detail: { id: jobId, url, body },
  });
  jobEventEmitter.dispatchEvent(event);
}
