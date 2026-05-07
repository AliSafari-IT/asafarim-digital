# Vionto Mobile Issue 6 - Preview, Export, Download, and Share

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `export`, `sharing`, `mp4`

## Objective

Implement the Android-first preview and export experience for rendered MP4 videos, including job progress, download, and share actions.

## Source Review Notes

- Vionto has `/api/health`, but no job-status or export APIs yet.
- Docker Compose includes future Vionto envs for S3, Redis, OpenAI, and TTS.
- The MVP requires async job updates, preview player, final MP4 storage, and shareable link.

## Scope

- [ ] Add mobile render progress screen with queued, processing, failed, and completed states.
- [ ] Poll or subscribe to render status using a stable API contract.
- [ ] Add mobile MP4 preview player with poster/loading/error states.
- [ ] Add download-to-device flow with permission-aware save handling.
- [ ] Add Android share sheet integration for final MP4 or share link.
- [ ] Add retry and support-log affordances for failed renders.
- [ ] Add clear quota and retention messaging before export.

## Acceptance Criteria

- A user can start render and monitor progress on Android.
- Completed MP4 can be previewed and shared.
- Failed jobs show a useful reason and retry path.
- Download/share respects signed URL expiry and access control.
- App remains usable if the render completes while the app is backgrounded.

## Test Plan

- Test status polling through all job states.
- Test share/download on Android emulator.
- Add contract tests for signed export URL authorization.
- Verify expired links fail safely.
