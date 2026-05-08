/**
 * Vionto Render Worker â€” BullMQ worker for FFmpeg pipeline jobs.
 *
 * Processes render manifests from Redis, runs TTS â†’ images â†’ audio mix â†’
 * FFmpeg encode â†’ upload, and updates the render job row in Postgres.
 */

import { Worker } from "bullmq";
import Redis from "ioredis";
import { spawn } from "node:child_process";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { prisma } from "@asafarim/db";
import { safeParseManifest } from "./lib/server/render-manifest";
import { buildRenderCommand, buildConcatListContent, pickMotionPreset } from "./lib/server/ffmpeg";
import { synthesizeSpeech } from "./lib/server/tts";
import { buildKey, downloadObjectToLocalFile, uploadLocalFileToStorage, createPresignedDownloadUrl, getStorageStatus } from "./lib/server/storage";
import { QUEUE_NAME, renderQueue } from "./lib/server/queue";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const WORKER_HEALTH_PORT = Number.parseInt(process.env.WORKER_HEALTH_PORT ?? "3007", 10);
const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
let isShuttingDown = false;

/** Failure classification for telemetry and retry decisions. */
function classifyError(err: unknown): { category: string; retryable: boolean } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("ENOENT") || msg.includes("ffmpeg")) {
    return { category: "FFMPEG_NOT_FOUND", retryable: false };
  }
  if (msg.includes("Disk full") || msg.includes("ENOSPC")) {
    return { category: "DISK_FULL", retryable: false };
  }
  if (msg.includes("TTS") || msg.includes("openai") || msg.includes("elevenlabs") || msg.includes("azure")) {
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

  await prisma.viontoRenderJob.update({
    where: { id: jobId },
    data: { state: "running", progressPercent: 5, startedAt: new Date(), errorSummary: null },
  });
  logLines.push("Manifest validated");

  try {
    // --- Materialize assets: download images from storage ---
    logLines.push(`Materializing ${manifest.assets.length} assets…`);
    const localAssetPaths: string[] = [];
    for (let i = 0; i < manifest.assets.length; i++) {
      const asset = manifest.assets[i];
      const ext = extname(asset.storageKey).replace(/[^a-zA-Z0-9.]/g, "") || ".jpg";
      const localPath = join(workDir, `asset_${String(i).padStart(4, "0")}${ext}`);
      try {
        await downloadObjectToLocalFile(asset.storageKey, localPath);
        localAssetPaths.push(localPath);
        logLines.push(`Downloaded asset ${i}: ${asset.storageKey}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logLines.push(`Failed to download asset ${i}: ${msg}`);
        throw new Error(`Failed to download asset ${i}: ${msg}`);
      }
    }
    await updateState(jobId, "running", { progressPercent: 15 });

    // --- Store SRT text as local file if provided ---
    let srtPath: string | undefined;
    if (manifest.srtStorageKey) {
      srtPath = join(workDir, "subtitles.srt");
      try {
        await downloadObjectToLocalFile(manifest.srtStorageKey, srtPath);
        logLines.push(`Downloaded SRT: ${manifest.srtStorageKey}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logLines.push(`Failed to download SRT: ${msg}`);
        // Continue without subtitles if SRT download fails
        srtPath = undefined;
      }
    } else if (manifest.srtText) {
      srtPath = join(workDir, "subtitles.srt");
      await writeFile(srtPath, manifest.srtText);
      logLines.push("Wrote SRT text to local file");
    }

    // --- Audio materialization / TTS ---
    let narrationWavPath: string | undefined;
    let musicPath: string | undefined;
    const narrationTrack = manifest.audioTracks.find((t) => t.type === "narration");
    const musicTrack = manifest.audioTracks.find((t) => t.type === "music" && t.storageKey);

    if (narrationTrack?.storageKey) {
      const ext = extname(narrationTrack.storageKey).replace(/[^a-zA-Z0-9.]/g, "") || ".mp3";
      narrationWavPath = join(workDir, `narration${ext}`);
      await downloadObjectToLocalFile(narrationTrack.storageKey, narrationWavPath);
      logLines.push(`Downloaded narration audio: ${narrationTrack.storageKey}`);
    } else if (manifest.narrationText) {
      logLines.push("Synthesizing narration…");
      const voiceId = narrationTrack?.voiceId ?? narrationTrack?.storageKey ?? "alloy";
      const ttsResult = await synthesizeSpeech(manifest.narrationText, voiceId);
      if (!ttsResult.ok) {
        throw new Error(`TTS failed: ${ttsResult.error}`);
      }
      narrationWavPath = join(workDir, "narration.mp3");
      await writeFile(narrationWavPath, ttsResult.audioBuffer);
      logLines.push(`TTS done (${ttsResult.provider}, ${ttsResult.latencyMs}ms)`);
    }

    if (musicTrack?.storageKey) {
      const ext = extname(musicTrack.storageKey).replace(/[^a-zA-Z0-9.]/g, "") || ".mp3";
      musicPath = join(workDir, `music${ext}`);
      await downloadObjectToLocalFile(musicTrack.storageKey, musicPath);
      logLines.push(`Downloaded music audio: ${musicTrack.storageKey}`);
    }
    await updateState(jobId, "running", { progressPercent: 25 });

    // --- Prepare image segments with local paths ---
    logLines.push("Generating image segments…");
    // Create a modified manifest with local paths instead of storage keys
    const localManifest = {
      ...manifest,
      assets: manifest.assets.map((asset, i) => ({
        ...asset,
        storageKey: localAssetPaths[i], // Replace storage key with local path
      })),
    };

    const { steps, concatListPath } = buildRenderCommand(localManifest, workDir, {
      narrationWavPath,
      musicPath,
      srtPath,
      outputPath: join(workDir, "output.mp4"),
    });

    // Fill in motion defaults for logging
    for (let i = 0; i < localManifest.assets.length; i++) {
      if (!localManifest.assets[i].motion) {
        localManifest.assets[i].motion = pickMotionPreset(i, localManifest.mode);
      }
    }

    // Run all segment generation steps except the final concat/encode
    for (let i = 0; i < steps.length - 1; i++) {
      await runFfmpeg(steps[i], workDir, logLines);
      const progress = 25 + Math.round(((i + 1) / steps.length) * 35);
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
    await updateState(jobId, "running", { progressPercent: 75 });

    // --- Upload output ---
    logLines.push("Uploading output…");
    const outputPath = join(workDir, "output.mp4");
    const outputKey = buildKey(manifest.userId, "exports", manifest.projectId, `render-${jobId}.mp4`);
    
    // Get file stats for metadata
    const fileStats = await stat(outputPath);
    const fileSizeBytes = fileStats.size;
    
    await uploadLocalFileToStorage(outputPath, outputKey, "video/mp4");
    logLines.push(`Output uploaded: ${outputKey}`);

    // Create export record with full metadata
    const exportRecord = await prisma.viontoExport.create({
      data: {
        projectId: manifest.projectId,
        userId: manifest.userId,
        renderJobId: jobId,
        storageKey: outputKey,
        format: manifest.outputFormat,
        resolution: manifest.resolution,
        fileSizeBytes,
        durationSeconds: manifest.targetDurationSeconds,
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
      await renderQueue.add(QUEUE_NAME, { jobId, manifest: manifestRaw }, { jobId: `${jobId}-retry-${retries}`, delay: 5000 * retries });
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

const healthServer = createServer(async (_req, res) => {
  const checks = {
    worker: !isShuttingDown,
    redis: false,
    database: false,
    storage: getStorageStatus(),
  };

  try {
    checks.redis = (await redis.ping()) === "PONG";
  } catch {}

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {}

  const ok = checks.worker && checks.redis && checks.database && checks.storage.configured;
  res.writeHead(ok ? 200 : 503, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    ok,
    service: "vionto-worker",
    queue: QUEUE_NAME,
    checks,
    timestamp: new Date().toISOString(),
  }));
});

healthServer.listen(WORKER_HEALTH_PORT, "0.0.0.0", () => {
  console.log(`[worker] health server listening on ${WORKER_HEALTH_PORT}`);
});

console.log(`[worker] Vionto render worker started on queue '${QUEUE_NAME}'`);

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[worker] ${signal} received. Closingâ€¦`);
  worker.close().then(() => redis.disconnect()).then(() => process.exit(0));
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
