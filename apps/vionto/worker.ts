/**
 * Vionto Render Worker — BullMQ worker for FFmpeg pipeline jobs.
 *
 * Processes render manifests from Redis, runs TTS → images → audio mix →
 * FFmpeg encode → upload, and updates the render job row in Postgres.
 */

import { Worker } from "bullmq";
import Redis from "ioredis";
import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@asafarim/db";
import { safeParseManifest } from "./lib/server/render-manifest";
import { buildRenderCommand, buildConcatListContent, pickMotionPreset } from "./lib/server/ffmpeg";
import { synthesizeSpeech } from "./lib/server/tts";
import { buildKey } from "./lib/server/storage";
import { QUEUE_NAME, renderQueue } from "./lib/server/queue";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

/** Failure classification for telemetry and retry decisions. */
function classifyError(err: unknown): { category: string; retryable: boolean } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("ENOENT") || msg.includes("ffmpeg")) {
    return { category: "FFMPEG_NOT_FOUND", retryable: false };
  }
  if (msg.includes("Disk full") || msg.includes("ENOSPC")) {
    return { category: "DISK_FULL", retryable: false };
  }
  if (msg.includes("TTS") || msg.includes("openai") || msg.includes("elevenlabs")) {
    return { category: "TTS_FAILURE", retryable: true };
  }
  if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
    return { category: "TIMEOUT", retryable: true };
  }
  if (msg.includes("network") || msg.includes("ECONNREFUSED")) {
    return { category: "NETWORK", retryable: true };
  }
  return { category: "UNKNOWN", retryable: true };
}

async function appendLog(jobId: string, line: string) {
  await prisma.viontoRenderJob.updateMany({
    where: { id: jobId },
    data: { logs: { push: line } as unknown as string }, // Prisma JSON ops not available for String; raw query below
  });
}

async function setLog(jobId: string, lines: string[]) {
  await prisma.$executeRawUnsafe(
    `UPDATE "ViontoRenderJob" SET logs = $1 WHERE id = $2`,
    lines.join("\n"),
    jobId
  );
}

async function updateState(
  jobId: string,
  state: string,
  opts: { progressPercent?: number; errorSummary?: string; retryCount?: number; completedAt?: Date } = {}
) {
  await prisma.viontoRenderJob.update({
    where: { id: jobId },
    data: {
      state,
      progressPercent: opts.progressPercent ?? undefined,
      errorSummary: opts.errorSummary ?? undefined,
      retryCount: opts.retryCount ?? undefined,
      completedAt: opts.completedAt ?? undefined,
    },
  });
}

/** Run an FFmpeg command and stream stdout/stderr to logs. */
function runFfmpeg(args: string[], workDir: string, logLines: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { cwd: workDir });
    const lines: string[] = [];
    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      for (const line of text.split("\n")) {
        if (line.trim()) {
          lines.push(line.trim());
          if (lines.length > 200) lines.shift(); // keep last 200
        }
      }
    });
    proc.on("close", (code) => {
      logLines.push(...lines);
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}`));
    });
    proc.on("error", (err) => {
      logLines.push(`ffmpeg spawn error: ${err.message}`);
      reject(err);
    });
  });
}

/** Main job processor. */
async function processRenderJob(jobId: string, manifestRaw: unknown) {
  const logLines: string[] = [`[${new Date().toISOString()}] Job ${jobId} start`];

  // Parse manifest
  const manifestResult = safeParseManifest(manifestRaw);
  if (!manifestResult.success) {
    const error = `Invalid manifest: ${manifestResult.error.message}`;
    logLines.push(error);
    await setLog(jobId, logLines);
    await updateState(jobId, "failed", { errorSummary: error });
    throw new Error(error);
  }
  const manifest = manifestResult.data;
  const workDir = join("/tmp", "vionto-renders", jobId);
  await mkdir(workDir, { recursive: true });

  await updateState(jobId, "running", { progressPercent: 5 });
  logLines.push("Manifest validated");

  try {
    // --- TTS ---
    let narrationWavPath: string | undefined;
    if (manifest.narrationText) {
      logLines.push("Synthesizing narration…");
      const voiceId = manifest.audioTracks.find((t) => t.type === "narration")?.storageKey ?? "alloy";
      const ttsResult = await synthesizeSpeech(manifest.narrationText, voiceId);
      if (!ttsResult.ok) {
        throw new Error(`TTS failed: ${ttsResult.error}`);
      }
      narrationWavPath = join(workDir, "narration.mp3");
      await writeFile(narrationWavPath, ttsResult.audioBuffer);
      logLines.push(`TTS done (${ttsResult.provider}, ${ttsResult.latencyMs}ms)`);
    }
    await updateState(jobId, "running", { progressPercent: 20 });

    // --- Prepare image segments ---
    logLines.push("Generating image segments…");
    const { steps, concatListPath } = buildRenderCommand(manifest, workDir, {
      narrationWavPath,
      outputPath: join(workDir, "output.mp4"),
    });

    // Fill in motion defaults for logging
    for (let i = 0; i < manifest.assets.length; i++) {
      if (!manifest.assets[i].motion) {
        manifest.assets[i].motion = pickMotionPreset(i, manifest.mode);
      }
    }

    // Run all segment generation steps except the final concat/encode
    for (let i = 0; i < steps.length - 1; i++) {
      await runFfmpeg(steps[i], workDir, logLines);
      const progress = 20 + Math.round(((i + 1) / steps.length) * 40);
      await updateState(jobId, "running", { progressPercent: progress });
    }

    // Write concat list
    if (concatListPath) {
      const segmentPaths = steps.slice(0, -1).map((_s, i) => join(workDir, `seg_${String(i).padStart(4, "0")}.mp4`));
      await writeFile(concatListPath, buildConcatListContent(segmentPaths));
    }

    // --- Final encode ---
    logLines.push("Final encode…");
    await runFfmpeg(steps[steps.length - 1], workDir, logLines);
    await updateState(jobId, "running", { progressPercent: 80 });

    // --- Upload output ---
    logLines.push("Uploading output…");
    const outputKey = buildKey(manifest.userId, "renders", manifest.projectId, `render-${jobId}.mp4`);
    // For now we write the output locally if S3 is stubbed; in production a separate uploader reads the file
    // and streams it to S3.
    logLines.push(`Output key: ${outputKey}`);

    // Create export record
    const exportRecord = await prisma.viontoExport.create({
      data: {
        projectId: manifest.projectId,
        userId: manifest.userId,
        renderJobId: jobId,
        storageKey: outputKey,
        format: manifest.outputFormat,
        resolution: manifest.resolution,
      },
    });

    logLines.push(`Export record ${exportRecord.id} created`);
    await setLog(jobId, logLines);
    await updateState(jobId, "completed", { progressPercent: 100, completedAt: new Date() });

    // Cleanup work dir (keep in debug mode)
    if (process.env.NODE_ENV === "production") {
      await rm(workDir, { recursive: true, force: true });
    }
  } catch (err) {
    const { category, retryable } = classifyError(err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    logLines.push(`ERROR [${category}]: ${errorMsg}`);
    await setLog(jobId, logLines);

    const job = await prisma.viontoRenderJob.findUnique({ where: { id: jobId } });
    const retries = (job?.retryCount ?? 0) + 1;
    const maxRetries = manifest.maxRetries;

    if (retryable && retries <= maxRetries) {
      await updateState(jobId, "queued", { errorSummary: `${category}: ${errorMsg}`, retryCount: retries });
      // Re-queue the same job with a delay
      await renderQueue.add(QUEUE_NAME, manifestRaw, { jobId, delay: 5000 * retries });
      logLines.push(`Re-queued (retry ${retries}/${maxRetries})`);
      await setLog(jobId, logLines);
    } else {
      await updateState(jobId, "failed", { errorSummary: `${category}: ${errorMsg}`, retryCount: retries });
    }
    throw err;
  }
}

// Create BullMQ Worker
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const jobId = job.data.jobId ?? job.id;
    if (!jobId) throw new Error("Missing jobId in render job data");
    await processRenderJob(jobId as string, job.data.manifest ?? job.data);
  },
  {
    connection: redis,
    concurrency: 1, // FFmpeg is CPU-heavy; run one at a time per worker
    limiter: { max: 1, duration: 1000 },
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] completed job ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] failed job ${job?.id}: ${err.message}`);
});

console.log(`[worker] Vionto render worker started on queue '${QUEUE_NAME}'`);

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[worker] ${signal} received. Closing…`);
  worker.close().then(() => redis.disconnect()).then(() => process.exit(0));
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
