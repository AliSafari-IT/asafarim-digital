/**
 * Shared BullMQ queue instance for Vionto render jobs.
 *
 * Imported by the Next.js API routes (to add jobs) and by the
 * standalone worker process (to consume jobs).  The Worker itself lives in
 * `apps/vionto/worker.ts` so it is not instantiated inside the web server.
 */

import { Queue } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL environment variable is required for Vionto. Please set it to redis://localhost:6380 or your Redis instance URL.");
}

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export const QUEUE_NAME = "vionto-render";

export const renderQueue = new Queue(QUEUE_NAME, { connection: redis });
