# Vionto Vertical Slice Issue 1 - Project Flow, Upload Sessions, and Asset Persistence

**Status:** Implemented  
**Priority:** Critical  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `vertical-slice`, `uploads`, `assets`, `mvp`

## Objective

Replace the current demo-only Vionto upload surface with the first functional project and asset flow: create a real project, upload real images through presigned upload sessions, persist completed uploads as `ViontoAsset` rows, and generate trusted server-side thumbnails/EXIF metadata.

This is the first step in the end-to-end MVP path:

```text
Project -> Upload images -> Persist assets -> Metadata/thumbnails ready
```

## Source Review Notes

- `apps/vionto/components/ViontoPage.tsx` currently stores selected files in local React state only.
- The UI calls story generation with hard-coded `projectId: "demo-project"`.
- Upload APIs exist: `/api/uploads/session`, `/api/uploads/presign`, `/api/uploads/complete`, and `/api/uploads/zip`.
- Upload sessions are in-memory and explicitly marked as local/dev behavior in `apps/vionto/lib/server/upload-session.ts`.
- `ViontoAsset` exists in `packages/db/prisma/schema.prisma`, but completed uploads are not yet persisted to that table from the UI flow.
- `apps/vionto/lib/server/exif.ts` exists, but the current completion path trusts client-provided metadata.

## Scope

- [ ] Add a real project creation step in the UI using `POST /api/projects`.
- [ ] Store the active project id in UI state and remove all `demo-project` usage.
- [ ] Create an upload session before file upload.
- [ ] For each selected image, call `/api/uploads/presign`, upload to the returned URL, then call `/api/uploads/complete`.
- [ ] Persist completed uploads as `ViontoAsset` rows linked to the active project.
- [ ] Add an endpoint or service function that promotes staged upload-session assets into project assets.
- [ ] Move thumbnail generation and EXIF extraction to trusted server/worker code.
- [ ] Store original storage key, thumbnail storage key, dimensions, file size, order index, and metadata on `ViontoAsset`.
- [ ] Add upload progress, retry, remove, and validation states in the UI.
- [ ] Support zip upload only if it can create the same `ViontoAsset` records as direct image upload.

## Acceptance Criteria

- A signed-in user can create a new Vionto project from the web UI.
- Selected images are actually uploaded through the storage pipeline.
- Completed uploads are visible after refresh because they are persisted in the database.
- `ViontoAsset` rows are owned by the authenticated user and linked to the project.
- EXIF and dimensions come from server-side extraction or a trusted worker, not blindly from client metadata.
- Thumbnails are generated and displayed from persisted thumbnail records.
- The next story-generation step can query project assets and metadata without relying on browser memory.

## Test Plan

- Add route tests for project creation and project ownership.
- Add upload contract tests for presign, complete, and promote-to-project behavior.
- Add tests for invalid MIME, oversized files, expired session, wrong-user session, and duplicate completion.
- Add EXIF fixture tests for images with and without timestamp/orientation/GPS.
- Manual QA: create project, upload 5 images, refresh page, verify thumbnails and order remain.

## Dependencies

- S3-compatible object storage configuration for non-stub environments.
- Prisma migration containing Vionto models must be applied.
- Auth must be configured so `getAuthedUser()` works for Vionto web.
