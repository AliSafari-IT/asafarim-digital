# Vionto Vertical Slice Issue 3 - Render Manifest, Worker Materialization, MP4 Upload, and Download

**Status:** Ready for development  
**Priority:** Critical  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `vertical-slice`, `render`, `ffmpeg`, `export`, `mvp`

## Objective

Complete the first real render path: build a render manifest from database assets/script/audio, make the worker materialize files locally, run FFmpeg, upload the final MP4, persist export metadata, and return a real signed download URL.

This is the final step in the end-to-end MVP path:

```text
Assets + script + audio settings -> Render manifest -> FFmpeg worker -> MP4 export -> Signed download
```

## Source Review Notes

- `/api/render` can enqueue jobs, but its fallback manifest contains `assets: []`, which the manifest schema rejects.
- `apps/vionto/lib/server/render-manifest.ts` requires at least one render asset.
- `apps/vionto/lib/server/ffmpeg.ts` passes `asset.storageKey` directly to FFmpeg as an input path, but storage keys are not local files.
- `apps/vionto/worker.ts` synthesizes narration and runs FFmpeg commands, but does not yet download image/audio assets from object storage.
- The worker creates a `ViontoExport` row but does not upload the generated MP4 to object storage.
- `/api/exports/[exportId]/download` currently returns a stub CDN URL instead of a real signed object-storage URL.

## Scope

- [ ] Add a server-side manifest builder that loads the project, ordered `ViontoAsset` rows, selected `ViontoScript`, SRT, and audio settings.
- [ ] Ensure `/api/render` rejects render attempts when project assets/script/audio prerequisites are missing.
- [ ] Replace the empty fallback manifest with a valid DB-backed manifest.
- [ ] Store SRT text as a worker-readable file or storage object before render.
- [ ] Add worker materialization: download original images, narration/music audio, and SRT into the job temp directory.
- [ ] Update FFmpeg command building so it uses local temp file paths, not object-storage keys.
- [ ] Generate narration audio from the selected voice if no narration audio track already exists.
- [ ] Run FFmpeg to produce MP4 with motion, transitions, narration, optional music, and subtitles.
- [ ] Upload the final MP4 to object storage.
- [ ] Persist `ViontoExport` metadata: storage key, duration, file size, format, resolution, and render job id.
- [ ] Implement real signed GET URLs for `/api/exports/[exportId]/download`.
- [ ] Update the UI to start render, subscribe/poll job progress, show preview when complete, and expose download.

## Acceptance Criteria

- A user can click Render after upload/story/audio setup and receive a completed MP4.
- The render job progresses through queued/running/completed or failed with useful error state.
- FFmpeg receives local paths and succeeds with real uploaded images.
- The final MP4 is uploaded to configured object storage.
- Export metadata is accurate enough for UI display and support debugging.
- Download returns a real signed URL that expires.
- Refreshing the page after completion still shows the completed export.

## Test Plan

- Add manifest builder tests for missing assets, missing script, selected mode, aspect ratio, and duration.
- Add worker integration test using fixture images and generated/fake narration audio.
- Add storage tests for download/upload materialization and signed GET URL generation.
- Add route tests for render start, job status, retry, and export download authorization.
- Manual QA: create project, upload images, generate story, select voice, render, preview, download MP4.

## Dependencies

- Issue `033` must provide persisted project assets.
- Issue `034` must provide selected script/SRT and voice/audio settings.
- Redis, object storage, FFmpeg, and AI/TTS provider configuration must be available in the target environment.
