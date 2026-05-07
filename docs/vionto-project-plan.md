# Vionto Project Plan

**Project:** Vionto - Photo-to-Story Video MVP  
**Created:** 2026-05-07  
**Status:** App shell created; MVP planning ready for implementation  
**Workspace app:** `apps/vionto`  
**Local URL:** `http://localhost:3006`

## 1. Product Vision

Vionto is an AI-powered creator that transforms user images into emotionally rich, narrated MP4 videos. The name combines vision and canto, positioning the product as a poetic fusion of visuals and storytelling.

The MVP should help a user move from a photo collection to a finished video through one guided workflow:

1. Upload images or a zip/folder batch.
2. Select a storytelling mode.
3. Generate a warm narrative and SRT subtitles.
4. Choose narration voice and optional background music.
5. Render a cinematic MP4.
6. Preview, download, and share the result.

The core promise is: turn your memories into poetic motion, effortlessly.

## 2. MVP Outcomes

- A user can create a video from 30-60 images without learning video editing tools.
- The first generated story feels emotionally coherent and can be edited before rendering.
- The render pipeline reliably produces H.264/AAC MP4 files.
- Jobs run asynchronously with clear status updates and retry behavior.
- The implementation favors managed AI services and a controlled FFmpeg worker path over complex custom ML infrastructure.

## 3. Target Users

- Families turning event, travel, wedding, or memorial photos into keepsake videos.
- Solo creators producing short narrative reels from image batches.
- Small studios offering affordable photo-story packages.
- ASafariM Digital operators validating a repeatable AI media production workflow.

## 4. Scope

### In Scope

- Image upload for single and multi-file batches.
- Zip import and future cloud-drive connector stub.
- Object storage for source assets, thumbnails, audio, and final exports.
- EXIF timestamp and GPS extraction where available.
- Managed LLM story generation from image metadata and user-selected tone.
- SRT subtitle generation.
- Lightweight script editor.
- Managed TTS narration.
- Optional user MP3 background track.
- Basic audio ducking.
- FFmpeg-based video assembly with pan/zoom, transitions, subtitles, H.264, and AAC.
- Cinematic, slideshow, and social presets.
- Job queue, progress status, retry, and export links.
- MVP usage limits and simple analytics.

### Out of Scope for MVP

- Full AI image/video motion generation.
- Deep cloud-drive import beyond connector stubs.
- Collaborative editing.
- Mobile-native app.
- Advanced timeline editor.
- Multi-language dubbing beyond the first chosen locale.
- Complex rights management for music libraries.

## 5. Milestones

### Milestone 1 - Specs and UX

**Duration:** 1 week  
**Goal:** Define the user journey and implementation contract before building the media pipeline.

Deliverables:

- Six primary screens: upload, mode selection, script editor, audio settings, preview player, export/share.
- Wireframes for desktop and mobile.
- Mode definitions for cinematic, slideshow, and social.
- Acceptance criteria for upload, generation, preview, and export.
- Success metric dashboard definition.
- Empty-state, loading-state, failed-job, and retry-state designs.

Acceptance criteria:

- Stakeholders can review the full user flow without implementation ambiguity.
- Each screen has a clear primary action and error state.
- Engineering has a defined payload contract for each pipeline step.

### Milestone 2 - Ingestion and Backend Core

**Duration:** 2-3 weeks  
**Goal:** Store user assets and create the async job foundation.

Deliverables:

- Image upload API for JPG, PNG, HEIC, WEBP.
- Zip upload extraction path.
- Cloud-drive connector placeholder interface.
- S3-compatible storage integration.
- Thumbnail generation.
- EXIF extraction for timestamps, orientation, camera metadata, and GPS where available.
- Asset and job database models.
- Redis + BullMQ queue setup.
- Job status API and polling endpoint.

Acceptance criteria:

- A user can upload 30-60 images and see thumbnails.
- Originals and thumbnails are persisted in object storage.
- EXIF metadata is attached to asset records.
- Failed uploads and invalid files return clear errors.
- A queued job can move through pending, active, completed, and failed states.

### Milestone 3 - Story Generation and Subtitles

**Duration:** 2-3 weeks  
**Goal:** Convert image metadata into editable narrative and subtitles.

Deliverables:

- LLM prompt templates for warm, nostalgic, cinematic, documentary, and social styles.
- Image caption input contract.
- Story generation worker step.
- SRT generation logic with timing allocation.
- Script editor UI.
- Versioned script save endpoint.
- Regenerate and manual edit workflow.

Acceptance criteria:

- A generated script references the image sequence coherently.
- SRT output is valid and aligned to estimated clip duration.
- Users can edit and save the script before narration.
- Generated output is logged with provider, model, prompt version, and token metadata.

### Milestone 4 - Audio and Video Assembly

**Duration:** 3-4 weeks  
**Goal:** Produce the first complete narrated MP4 export.

Deliverables:

- TTS narration generation with at least three voice options.
- Optional user MP3 upload.
- Audio normalization and ducking.
- FFmpeg render worker.
- Per-image pan/zoom clip generation.
- Crossfade and clean-cut transitions.
- Subtitle burn-in or overlay option.
- H.264/AAC MP4 export.
- Preview player for rendered output.

Acceptance criteria:

- One end-to-end job produces a playable MP4 from uploaded images.
- Narration is intelligible over background music.
- Video exports work for 16:9 and 9:16 presets.
- Render failures are captured with actionable logs.
- Final MP4 is stored and returned through a download URL.

### Milestone 5 - Modes, Polish, and Launch

**Duration:** 1-2 weeks  
**Goal:** Prepare a controlled MVP launch.

Deliverables:

- Cinematic preset: slow pans, warm color treatment, soft transitions.
- Slideshow preset: clean cuts, neutral color profile.
- Social preset: fast pacing, vertical format, bold transitions.
- Account limits and storage quotas.
- Basic billing or gated access integration.
- Analytics for upload, generation, render, and export.
- Content safety checks and provenance logging.
- Launch checklist and rollback plan.

Acceptance criteria:

- Users can select a preset and receive a visibly different render style.
- Export success rate is measurable.
- Cost and latency are tracked per job.
- The app has enough guardrails for a closed beta.

## 6. Architecture

| Component | MVP Recommendation | Alternative | Rationale |
| --- | --- | --- | --- |
| Frontend | Next.js app in `apps/vionto` | Separate repo | Keeps Vionto integrated with the ASafariM monorepo and deployment patterns. |
| Hosting | Vercel or existing Docker deployment | VPS-only Next runtime | Fast iteration; Docker path is already available in this repo. |
| Storage | S3-compatible object storage | Cloud-drive-first storage | Predictable retention, signed URLs, and worker access. |
| Queue | Redis + BullMQ | Serverless functions | Long video jobs need stable retries, concurrency control, and progress state. |
| AI Story | Managed LLM | Self-hosted model | Faster prompt iteration and lower operational burden. |
| Narration | Managed TTS | Local TTS | Better voice quality and less infrastructure for MVP. |
| Video Encode | FFmpeg worker container | Cloud encode API | Cost-efficient, deterministic, and flexible for subtitles/transitions. |
| Database | Existing ASafariM database package | App-local database | Easier account, quota, and billing integration later. |

## 7. Proposed Data Model

Core entities:

- `ViontoProject`: owner, title, mode, status, target aspect ratio, locale, tone.
- `ViontoAsset`: project, original storage key, thumbnail key, MIME type, dimensions, EXIF metadata, sequence order.
- `ViontoScript`: project, prompt version, provider metadata, narration text, subtitle text, user-edited flag.
- `ViontoAudioTrack`: project, narration key, music key, duration, voice, mix settings.
- `ViontoRenderJob`: project, queue id, state, progress, logs key, output key, error summary.
- `ViontoExport`: project, output key, signed URL expiry, format, duration, file size.

## 8. Pipeline

```text
Upload UI
  -> Upload API
  -> Object storage originals
  -> Metadata worker
  -> Thumbnail + EXIF records
  -> Story worker
  -> Script + SRT
  -> TTS worker
  -> Mixed audio
  -> FFmpeg render worker
  -> MP4 in object storage
  -> Preview/download/share
```

## 9. Technical Details

### Upload Pipeline

- Accept images, zip/folder uploads, and a cloud-drive import stub.
- Store originals in object storage under a project-scoped prefix.
- Generate thumbnails for fast UI previews.
- Extract EXIF timestamps, GPS, camera model, orientation, and dimensions.
- Normalize ordering by EXIF timestamp first, upload order second.
- Reject unsupported or unsafe files before queueing.

### Story Generation

- Prompt input should include image captions, EXIF metadata, user tone, selected mode, target duration, and optional user notes.
- Output should include narration script and SRT subtitles.
- Prompt versions must be tracked so quality can be evaluated over time.
- Generated scripts should be editable before narration.

### Narration and Audio

- Generate narration through managed TTS.
- Offer a small voice set at launch rather than a large catalog.
- Let users upload an MP3 background track.
- Normalize narration and music loudness.
- Duck music during speech for clarity.
- Store final mixed audio as an intermediate artifact.

### Video Renderer

- Use FFmpeg in a worker container.
- Generate per-image clips with deterministic pan/zoom.
- Add crossfade, clean cut, and faster social transitions.
- Support 16:9 and 9:16 in MVP.
- Burn in subtitles for compatibility; keep SRT export as an option.
- Encode MP4 with H.264 video and AAC audio.

### Export and Delivery

- Store final MP4 in object storage.
- Generate signed download URLs.
- Add shareable links once access control is defined.
- Keep render logs for debugging and support.

## 10. Operational Requirements

- Queue concurrency limits by plan and worker capacity.
- Per-user storage quotas.
- Retention rules for originals, intermediates, and exports.
- Retry policy for transient AI, storage, and FFmpeg failures.
- Admin visibility into failed render logs.
- Cost tracking by provider call, TTS duration, storage, and render time.

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Story quality variance | Users may reject generated scripts. | Start with tight prompt templates, script editor, and prompt evaluation samples. |
| Render latency | Users may abandon before export. | Async jobs, progress states, preview clips, and concurrency limits. |
| AI/TTS cost | Unit economics can drift. | Cache captions, track per-export cost, and gate long jobs. |
| FFmpeg failures | Export success rate drops. | Validate media inputs, persist logs, add retries and worker health checks. |
| Copyrighted music uploads | Legal/product risk. | User attestation, metadata logging, and later content policy controls. |
| Sensitive photos | Trust and compliance risk. | Private object storage, signed URLs, retention controls, and audit logs. |
| Scalability | Worker pool can saturate. | Autoscale workers and cap simultaneous renders per account. |

## 12. Success Metrics

- Median time to first MP4: 10 minutes or less for 30-60 images.
- Export success rate: 95% or higher.
- Script acceptance rate: percentage of users exporting without major script edits.
- Cost per export: within target threshold defined before beta.
- Upload completion rate.
- Render retry rate.
- Preview-to-export conversion rate.
- Closed beta satisfaction score.

## 13. Implementation Backlog

### Foundation

- Keep the `apps/vionto` shell building in the monorepo.
- Add shared auth and account context.
- Add project creation and persistence.
- Add health and readiness checks.
- Add environment validation for storage, Redis, LLM, and TTS providers.

### Media Ingestion

- Build upload API.
- Add object storage client.
- Add thumbnail worker.
- Add EXIF parser.
- Add zip extraction and validation.
- Add upload progress UI.

### AI Workflow

- Add captioning contract and placeholder provider.
- Add story generation prompts.
- Add subtitle timing generator.
- Add script editor and save flow.
- Add prompt/version metadata.

### Audio Workflow

- Add TTS provider abstraction.
- Add voice selection.
- Add MP3 upload.
- Add audio normalization and ducking.
- Add mixed audio artifact storage.

### Rendering

- Add FFmpeg worker image.
- Add render manifest format.
- Add pan/zoom templates.
- Add mode-specific transition presets.
- Add subtitle burn-in.
- Add MP4 export and signed URLs.

### Launch

- Add quotas and limits.
- Add basic billing gate.
- Add analytics events.
- Add admin failed-job view.
- Run internal test set.
- Run closed beta.

## 14. Immediate Next Steps

1. Finalize the six MVP screens and acceptance criteria.
2. Select LLM and TTS vendors and run prompt quality tests.
3. Provision S3-compatible storage and Redis.
4. Implement upload, thumbnail, EXIF, and job queue foundation.
5. Build one complete path: images -> script -> TTS -> FFmpeg -> MP4.
6. Run internal tests with travel, family, memorial, and social-reel photo sets.

## 15. Current Repository Integration

Implemented in this setup:

- `apps/vionto` Next.js app shell.
- Local development port `3006`.
- Dockerfile for production standalone build.
- Health endpoint at `/api/health`.
- Root package scripts for `dev:vionto`.
- Start script commands for `dev:vionto`.
- Docker Compose service scaffold.

Remaining integration work:

- Add shared ASafariM auth once the project model is introduced.
- Add database schema through `packages/db`.
- Add queue and worker services for media processing.
- Add deployment host configuration for `vionto.asafarim.com`.
