# Vionto Web Issue 4 - Storage, Uploads, Thumbnails, and EXIF Processing

**Status:** In Progress  
**Priority:** High  
**Assignee:** AI Assistant  
**Labels:** `vionto`, `web`, `storage`, `uploads`, `s3`

## Objective

Implement Vionto's web upload and storage pipeline with S3-compatible object storage, thumbnail generation, EXIF extraction, and production-safe validation.

## Source Review Notes

- Docker Compose includes placeholder Vionto environment variables for S3.
- EduMatch already uses S3-compatible env naming for DigitalOcean Spaces.
- Vionto web now has a server-side upload pipeline: presign, complete, zip import, and cleanup APIs.
- `docs/vionto-project-plan.md` requires images, zip/folder import, thumbnails, EXIF, and storage of originals.
- Thumbnail generation worker is stubbed — requires `sharp` or a background worker queue (BullMQ) for full implementation.

## Scope

- [x] Add Vionto storage client package/module using S3-compatible configuration.
  - `apps/vionto/lib/server/storage.ts` — S3 client, presigned URLs, key building, ownership checks, object existence, deletion.
- [x] Define storage prefixes for originals, thumbnails, audio, render logs, and exports.
  - Prefix: `vionto/{userId}/{category}/{sessionId|projectId}/{uuid}/{safeName}`
- [x] Add signed upload or server upload API with MIME and size validation.
  - `POST /api/uploads/presign` — validated, scoped presigned PUT URLs.
  - `POST /api/uploads/complete` — confirms upload, stages asset in session.
- [x] Add zip extraction path with safe file limits.
  - `POST /api/uploads/zip` — validates ZIP, queues background extraction (stub).
  - Safety: max 200 images, no path traversal, image/* filtering.
- [ ] Add thumbnail generation worker or server task.
  - **Pending:** Requires `sharp` or background worker (BullMQ). API structure ready.
- [x] Add EXIF extraction for timestamp, orientation, GPS, camera model, and dimensions.
  - `apps/vionto/lib/server/exif.ts` — lightweight JPEG/PNG parser, graceful fallback.
- [x] Add idempotent upload sessions.
  - `apps/vionto/lib/server/upload-session.ts` — in-memory with TTL, auto-cleanup.
- [x] Add cleanup job for abandoned uploads.
  - `POST /api/uploads/cleanup` — per-session cleanup (any user) + global cleanup (admin only).
  - Deletes storage objects and purges in-memory sessions.

## Acceptance Criteria

- A user can upload a valid image batch and see persisted thumbnails.
- Invalid files are rejected before expensive processing.
- EXIF data is stored when available without breaking files that lack metadata.
- Object storage keys never expose raw user emails or unsafe file names.
- Upload limits are enforced by plan/quota.

## Test Plan

- Add API tests for file validation and upload session idempotency.
- Test EXIF extraction with images with and without metadata.
- Test zip import with valid files, nested folders, and unsafe paths.
- Verify storage cleanup for abandoned sessions.
