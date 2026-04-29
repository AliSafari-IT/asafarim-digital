import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";

/**
 * Phase 2.2 — AI orchestrator job queue.
 *
 * Redis is required for BullMQ. In local dev without Redis, the enqueue
 * endpoint returns a graceful error prompting the user to configure REDIS_URL.
 * Production uses Upstash or ElastiCache (TLS supported via rediss://).
 */

const REDIS_URL = process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_REST_URL;

function createConnection() {
  if (!REDIS_URL) return null;
  // BullMQ uses ioredis; Upstash REST URL won't work directly, but standard
  // Redis TLS (rediss://) works fine. If you use Upstash, prefer the
  // direct Redis endpoint (not the REST API) for BullMQ compatibility.
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ requirement
    enableReadyCheck: false, // BullMQ requirement
  });
}

const connection = createConnection();

export const AI_QUEUE_NAME = "edumatch:ai" as const;

export type AiJobPayload = {
  inquiryId: string;
  studentId: string;
  /** If provided, restricts the job to a specific provider (for testing). */
  forceProvider?: "openai" | "anthropic";
};

export type AiJobResult = {
  success: boolean;
  inquiryId: string;
  responseId?: string;
  error?: string;
  provider?: "openai" | "anthropic";
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
};

export const aiQueue = connection
  ? new Queue<AiJobPayload, AiJobResult>(AI_QUEUE_NAME, { connection })
  : null;

export function isQueueAvailable(): boolean {
  return !!aiQueue;
}

export async function enqueueAiJob(payload: AiJobPayload): Promise<Job<AiJobPayload, AiJobResult>> {
  if (!aiQueue) {
    throw new AiQueueError("Redis is not configured. Set REDIS_URL to enable AI job queue.");
  }
  // dedupe: if a job for this inquiry is already pending, return it instead of creating a duplicate.
  const existing = await aiQueue.getJobs(["waiting", "delayed", "active"], 0, 100, true);
  const dup = existing.find((j) => j.data.inquiryId === payload.inquiryId);
  if (dup) return dup;

  return aiQueue.add("process-inquiry", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  });
}

export class AiQueueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiQueueError";
  }
}

/**
 * Worker factory — call this once in a worker process (not the Next.js dev server).
 * The worker imports the orchestrator to process jobs.
 */
export function createAiWorker(
  processor: (job: Job<AiJobPayload, AiJobResult, string>) => Promise<AiJobResult>,
): Worker<AiJobPayload, AiJobResult, string> | null {
  if (!connection) return null;
  return new Worker<AiJobPayload, AiJobResult, string>(AI_QUEUE_NAME, processor, { connection });
}
