/**
 * Shared BullMQ queue instance for Vionto render jobs.
 *
 * Imported by the Next.js API routes (to add jobs) and by the
 * standalone worker process (to consume jobs).  The Worker itself lives in
 * `apps/vionto/worker.ts` so it is not instantiated inside the web server.
 */

import { Queue } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export const QUEUE_NAME = "vionto-render";

export const renderQueue = new Queue(QUEUE_NAME, { connection: redis });
