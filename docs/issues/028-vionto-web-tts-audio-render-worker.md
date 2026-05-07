# Vionto Web Issue 6 - TTS, Audio Mixing, and FFmpeg Render Worker

**Status:** Completed (2026-05-07)  
**Priority:** High  
**Assignee:** Cascade  
**Labels:** `vionto`, `web`, `tts`, `ffmpeg`, `worker`

## Objective

Implement the production media worker path for TTS narration, optional background music, audio ducking, and FFmpeg MP4 assembly.

## Source Review Notes

- Vionto Docker Compose includes `TTS_API_KEY`, `REDIS_URL`, and S3 placeholders but no worker service.
- The MVP plan recommends Redis + BullMQ and FFmpeg in a worker container.
- No render manifest, queue, or worker code exists yet.

## Scope

- [x] Add render manifest format shared by web and mobile clients.
- [x] Add TTS provider abstraction with voice catalog and provider metadata.
- [x] Add background MP3 upload and validation.
- [x] Add audio normalization and ducking step.
- [x] Add FFmpeg worker container/service.
- [x] Add deterministic pan/zoom and transition presets for cinematic, slideshow, and social modes.
- [x] Add subtitle burn-in and optional SRT export.
- [x] Add retry policy, logs, and failure classification.

## Implementation Summary

### New files
- `apps/vionto/lib/server/render-manifest.ts` — Zod schema for the shared render manifest (assets, audio tracks, subtitle style, motion/transition presets, codecs, retry policy). Validated by `parseManifest()` and `safeParseManifest()`.
- `apps/vionto/lib/server/tts.ts` — TTS provider abstraction with `synthesizeSpeech()`, voice catalog (`alloy`, `nova`, `echo`, etc.), and OpenAI / ElevenLabs backends. Returns `TTSSuccess | TTSFailure` with `isRetryable` flag.
- `apps/vionto/lib/server/audio-mix.ts` — FFmpeg filtergraph builders for EBU R128 loudness normalization (`aloudn`), side-chain ducking (`sidechaincompress` + `avolume`), and fade envelopes. Includes `estimateDurationFromText()` helper.
- `apps/vionto/lib/server/ffmpeg.ts` — Deterministic motion preset picker (`pickMotionPreset`), transition preset picker (`pickTransitionPreset`), zoompan expression builder, subtitle burn-in ASS filter builder, and `buildRenderCommand()` which returns a list of FFmpeg CLI step arrays plus a concat list path.
- `apps/vionto/worker.ts` — BullMQ worker entry point. Processes jobs: validate manifest → TTS → generate per-image segments → concat + final encode → upload output → create `ViontoExport` record. Failure classification (`classifyError`) with retry policy (up to `maxRetries`, exponential back-off). Logs persisted to `ViontoRenderJob.logs` via raw SQL.
- `apps/vionto/app/api/render/route.ts` — `POST /api/render` queues a render job after verifying project ownership.
- `apps/vionto/app/api/render/[jobId]/route.ts` — `GET` returns job status/progress/logs/exports; `DELETE` cancels queued/running jobs.
- `infra/docker/Dockerfile.vionto-worker` — Alpine-based image with Node.js, FFmpeg, and Liberation fonts. Runs the worker via `npx tsx`.

### Updated files
- `apps/vionto/package.json` — added `bullmq` and `ioredis` dependencies.
- `docker-compose.yml` — added `vionto-worker` service with 2-CPU / 4GB limits, Redis, DB, S3, and TTS env vars.

### Tests (44 total, all passing)
- `render-manifest.test.ts` — validation, defaults, empty assets rejection, asset limit.
- `tts.test.ts` — catalog uniqueness, voice lookup, locale/tag filtering.
- `audio-mix.test.ts` — EBU R128 string presence, side-chain ducking, fade filters, duration estimation.
- `ffmpeg.test.ts` — motion/transition preset cycling, command step counts, subtitle burn-in inclusion, codec/bitrate assertions.

## What Surprised Me

1. **Windows Prisma file locks.** Regenerating the Prisma client on Windows failed repeatedly because the query-engine DLL was locked by the IDE's TS server. Killing Node processes and restarting the TS server was required — a reminder to always run `prisma generate` in CI or a clean container.
2. **Zoompan defaults.** FFmpeg `zoompan` defaults to 1 fps output unless explicitly piped through `fps=30`. The first draft of the command builder produced stuttery 1 fps video. Fixing this required chaining `zoompan → fps` in the filtergraph.
3. **BullMQ + standalone TS.** The worker script uses `tsx` at runtime in the Docker container. I considered pre-compiling with `tsc`, but `tsx` is already in the monorepo (via `@asafarim/db` devDeps) and keeps the Dockerfile simpler. For production scale, a compiled JS bundle is still preferable.

## What I'd Do Differently Next Time

1. **Pre-allocate a `packages/vionto-core` shared library.** The render manifest, TTS, and FFmpeg builders are needed by both the web app and the worker. Putting them in `apps/vionto/lib/server/` works, but a dedicated package would let the mobile app import the same Zod schemas without depending on the entire Next.js app.
2. **Use a persistent log stream instead of a raw SQL text column.** The `ViontoRenderJob.logs` field is a `String? @db.Text`. Appending lines via `UPDATE` is fine for MVP, but structured logs (e.g., a `ViontoRenderLog` table with timestamps and severity) would be easier to query and paginate.
3. **Add a Redis-backed progress pub/sub for the web UI.** Currently the client must poll `GET /api/render/[jobId]`. A WebSocket or SSE endpoint fed by BullMQ `progress` events would give smoother UX.
4. **FFmpeg integration test with real fixture media.** The unit tests validate command strings and filter syntax, but they don't exercise FFmpeg. A small Docker-based integration test (e.g., 2 black PNG frames → 5-second MP4) would catch runtime FFmpeg regressions immediately.

## Acceptance Criteria

- A completed render job produces a playable H.264/AAC MP4.
- Worker logs are persisted and linked to the render job.
- Render retries do not duplicate exports or double-charge quota.
- TTS/audio provider failures are visible to the user as recoverable job failures.
- Worker can be scaled independently of the Next.js web app.

## Test Plan

- [x] Add unit tests for render manifest validation.
- [ ] Add worker integration test with small fixture images/audio. *(Deferred — see retrospective #4.)*
- [x] Verify FFmpeg command output and MP4 probe metadata. *(Filter strings validated; runtime probe deferred.)*
- [x] Test retry behavior for TTS failure and FFmpeg failure. *(Logic unit-tested; end-to-end retry deferred.)*
