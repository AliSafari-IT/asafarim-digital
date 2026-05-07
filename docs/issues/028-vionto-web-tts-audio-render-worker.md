# Vionto Web Issue 6 - TTS, Audio Mixing, and FFmpeg Render Worker

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `tts`, `ffmpeg`, `worker`

## Objective

Implement the production media worker path for TTS narration, optional background music, audio ducking, and FFmpeg MP4 assembly.

## Source Review Notes

- Vionto Docker Compose includes `TTS_API_KEY`, `REDIS_URL`, and S3 placeholders but no worker service.
- The MVP plan recommends Redis + BullMQ and FFmpeg in a worker container.
- No render manifest, queue, or worker code exists yet.

## Scope

- [ ] Add render manifest format shared by web and mobile clients.
- [ ] Add TTS provider abstraction with voice catalog and provider metadata.
- [ ] Add background MP3 upload and validation.
- [ ] Add audio normalization and ducking step.
- [ ] Add FFmpeg worker container/service.
- [ ] Add deterministic pan/zoom and transition presets for cinematic, slideshow, and social modes.
- [ ] Add subtitle burn-in and optional SRT export.
- [ ] Add retry policy, logs, and failure classification.

## Acceptance Criteria

- A completed render job produces a playable H.264/AAC MP4.
- Worker logs are persisted and linked to the render job.
- Render retries do not duplicate exports or double-charge quota.
- TTS/audio provider failures are visible to the user as recoverable job failures.
- Worker can be scaled independently of the Next.js web app.

## Test Plan

- Add unit tests for render manifest validation.
- Add worker integration test with small fixture images/audio.
- Verify FFmpeg command output and MP4 probe metadata.
- Test retry behavior for TTS failure and FFmpeg failure.
