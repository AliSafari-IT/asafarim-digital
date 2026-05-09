# Vionto Vertical Slice Issue 4 - Smart Export Filenames, Video Library, and Dynamic Preview

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `exports`, `library`, `preview`, `metadata`, `ux`

## Objective

Replace the static preview/export placeholder with a user-specific latest-video experience, and make every rendered MP4 discoverable through a lightweight video library with searchable metadata and predictable filenames.

The exported filename should be generated from:

```text
{mode}_{aspect-label}_{keyword-1}_{keyword-2}_{keyword-3}_{yyyyMMdd-HHmmss}.mp4
```

Example:

```text
social_1by1_targets_focus_victory_20260509-151340.mp4
```

## Current Source Review Notes

- `apps/vionto/components/ViontoPage.tsx` already has `activeMode` with UI values `cinematic`, `slideshow`, and `social`.
- `UI_MODE_TO_API_MODE` currently maps `cinematic -> story`, `slideshow -> slideshow`, and `social -> documentary`; export metadata should preserve the user-facing mode as well as the API/render mode.
- The create screen currently has no explicit aspect control. `ViontoProject.aspectRatio` exists in Prisma and defaults to `16:9`, but the UI does not expose `landscape`, `portrait`, or `1by1` radio controls.
- `ViontoExport` stores `storageKey`, `format`, `resolution`, `durationSeconds`, `fileSizeBytes`, `createdAt`, and `userId`, but it does not store user-facing export filename, mode, aspect label, story keywords, or preview subtitle.
- `GET /api/exports?projectId=...` only lists exports for one project. There is no user-level library endpoint with filters across all user videos.
- `loadProjectExports()` only finds the latest completed export for the selected project and only stores `exportId`; the UI does not show an actual video in the large marked preview placeholder.
- The marked preview placeholder in `ViontoPage.tsx` is hardcoded to `Summer evening, narrated with warmth.` and should instead reflect the latest completed user video or the selected render draft.
- `worker.ts` currently writes object storage keys as `render-${jobId}.mp4`; this is stable but not meaningful for users.

## Scope

- [ ] Add explicit aspect ratio radio controls on the create screen:
  - `Landscape` -> `16:9`
  - `Portrait` -> `9:16`
  - `1by1` -> `1:1`
- [ ] Persist the selected aspect ratio to `ViontoProject.aspectRatio` before story generation/render.
- [ ] Keep the selected user-facing mode value (`cinematic`, `slideshow`, `social`) available through story generation, render manifest creation, export metadata, and UI display.
- [ ] Extract three filename-safe keywords from the generated story:
  - Prefer the latest `ViontoScript.narrationText`.
  - Ignore common stop words.
  - Normalize to lowercase ASCII slugs.
  - Use user/project fallback keywords when fewer than three good story keywords exist.
- [ ] Generate a unique user-facing export filename using mode, aspect label, three keywords, and a timestamp suffix such as `20260509-151340`.
- [ ] Store the generated filename in export metadata.
- [ ] Store enough export metadata to support filtering without joining through logs:
  - user-facing mode
  - render/API mode
  - aspect ratio
  - aspect label
  - story keywords
  - generated filename
  - preview subtitle
- [ ] Update object storage export keys to include the generated filename while keeping project/user path scoping.
- [ ] Add a user-level video library endpoint, for example `GET /api/exports/library`, with filters:
  - `createdFrom`
  - `createdTo`
  - `mode`
  - `aspectRatio`
  - `projectId`
  - pagination cursor or `page`/`limit`
- [ ] Add a video library UI area that shows previously created videos with:
  - preview/play action
  - generated filename
  - project title
  - mode
  - aspect label
  - created date
  - duration
  - file size
  - download action
- [ ] Populate the large marked preview placeholder with the latest completed video for the current user.
- [ ] When a project is selected, prefer that project latest video; otherwise show the latest completed video across the user library.
- [ ] Replace the hardcoded preview subtitle with a generated subtitle derived from the latest video metadata/story.

## Suggested Data Model

Add fields to `ViontoExport` or create a dedicated metadata JSON column. Prefer explicit columns for filterable values and JSON for secondary generated copy.

```prisma
model ViontoExport {
  // existing fields...
  filename       String?
  userMode       String? // cinematic, slideshow, social
  renderMode     String? // cinematic, slideshow, social or internal mapped mode
  aspectRatio    String? // 16:9, 9:16, 1:1
  aspectLabel    String? // landscape, portrait, 1by1
  storyKeywords  Json?
  previewTitle   String?
  previewSubtitle String? @db.Text

  @@index([userId, createdAt])
  @@index([userId, userMode, createdAt])
  @@index([userId, aspectRatio, createdAt])
}
```

If avoiding a migration for the first pass, store this in a typed `metadata Json?` field and add explicit columns later once the shape stabilizes.

## Filename Rules

- Use only lowercase `a-z`, `0-9`, and `_`.
- Collapse repeated separators.
- Limit each keyword to 24 characters.
- Limit the final base filename to a safe length, for example 120 characters before `.mp4`.
- Ensure uniqueness with timestamp down to seconds; append job id suffix only on collision.
- Do not expose internal CUIDs in the default user-facing filename.

Example implementation output:

```text
cinematic_landscape_family_sunset_laughter_20260509-151340.mp4
slideshow_portrait_graduation_friends_paris_20260509-151522.mp4
social_1by1_targets_focus_victory_20260509-151711.mp4
```

## Preview Subtitle Rules

Replace:

```text
Summer evening, narrated with warmth.
```

with a computed subtitle such as:

```text
Latest cinematic landscape render, built from family, sunset, and laughter.
```

Fallback order:

1. Latest completed export metadata preview subtitle.
2. Latest script-derived subtitle for the selected project.
3. Project title plus mode/aspect.
4. Neutral empty-state copy when no video exists.

## API Contract Sketch

```http
GET /api/exports/library?mode=cinematic&createdFrom=2026-05-01&createdTo=2026-05-09&limit=20
```

Response:

```json
{
  "data": [
    {
      "id": "export_id",
      "projectId": "project_id",
      "projectTitle": "May2026",
      "filename": "social_1by1_targets_focus_victory_20260509-151340.mp4",
      "mode": "social",
      "aspectRatio": "1:1",
      "aspectLabel": "1by1",
      "keywords": ["targets", "focus", "victory"],
      "previewTitle": "May2026 social cut",
      "previewSubtitle": "Latest social 1by1 render, built from targets, focus, and victory.",
      "createdAt": "2026-05-09T13:13:40.000Z",
      "durationSeconds": 33,
      "fileSizeBytes": 6302680,
      "downloadUrl": null
    }
  ],
  "nextCursor": null
}
```

## Acceptance Criteria

- A user can choose mode and aspect ratio before generating/rendering.
- Rendered MP4 exports receive meaningful, deterministic, user-facing filenames.
- Filenames include mode, aspect label, three story keywords, and a unique datetime suffix.
- The latest completed video for the user appears in the marked preview placeholder.
- The preview placeholder shows a real video element when a signed download/preview URL is available.
- The preview subtitle is dynamic and no longer uses the hardcoded `Summer evening, narrated with warmth.` copy.
- Users can browse previously created videos.
- Users can filter videos by created date and mode.
- Export filtering never returns another user's videos.
- Refreshing the page preserves the latest video preview and library results.

## Test Plan

- Unit test filename generation:
  - cinematic/slideshow/social modes
  - landscape/portrait/1by1 labels
  - keyword slugging
  - missing or short story fallback
  - datetime uniqueness
- Unit test keyword extraction from generated narration text.
- API tests for `GET /api/exports/library` ownership and filters.
- API tests for export creation metadata after a completed render.
- UI test for aspect radio controls and selected state.
- UI test for replacing the hardcoded preview subtitle after a completed export exists.
- Manual QA:
  - create three renders with different modes/aspects
  - verify filenames
  - filter by mode
  - filter by date
  - download each export
  - reload and verify the latest video remains in the marked preview area

## Implementation Notes

- Keep `ViontoProject.mode` mapping backward compatible. Existing projects may still use `story`, `slideshow`, or `documentary`; new UI can store a separate user-facing mode or normalize at the API boundary.
- Prefer building the filename server-side in the render API or worker so it cannot be spoofed by the client.
- The worker already creates `ViontoExport`; it is a natural place to persist the final filename and render-derived metadata.
- Signed download URLs should remain short-lived. Do not store permanent signed URLs as preview sources.
- For the preview video, fetch a fresh signed URL on demand or through the library endpoint with a short expiry.

## Wow Improvements

- Add a hover-scrub preview thumbnail strip for each completed video.
- Generate a poster frame from the best source image or first rendered frame.
- Add an auto-generated title like `May2026: Focus and Victory`.
- Add a one-click `Make another version` action that reuses the same assets/story but switches mode or aspect.
- Add visual badges for `Subtitles`, `Narration`, `Music`, and `Ready to share`.
- Add a share sheet with copy link, download, and social-safe aspect recommendations.
- Add render quality presets: `Fast preview`, `Balanced`, and `High quality`.
- Add an AI quality note after render, for example `Best for LinkedIn square posts` or `Portrait version recommended for reels`.
- Add a timeline mini-map showing which image appears at each segment of the video.
- Add a `Favorite` marker so the preview placeholder can show either the latest video or the user's pinned best render.
