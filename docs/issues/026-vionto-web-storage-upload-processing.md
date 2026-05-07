# Vionto Web Issue 4 - Storage, Uploads, Thumbnails, and EXIF Processing

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `storage`, `uploads`, `s3`

## Objective

Implement Vionto's web upload and storage pipeline with S3-compatible object storage, thumbnail generation, EXIF extraction, and production-safe validation.

## Source Review Notes

- Docker Compose includes placeholder Vionto environment variables for S3.
- EduMatch already uses S3-compatible env naming for DigitalOcean Spaces.
- Vionto web has static upload UI only.
- `docs/vionto-project-plan.md` requires images, zip/folder import, thumbnails, EXIF, and storage of originals.

## Scope

- [ ] Add Vionto storage client package/module using S3-compatible configuration.
- [ ] Define storage prefixes for originals, thumbnails, audio, render logs, and exports.
- [ ] Add signed upload or server upload API with MIME and size validation.
- [ ] Add zip extraction path with safe file limits.
- [ ] Add thumbnail generation worker or server task.
- [ ] Add EXIF extraction for timestamp, orientation, GPS, camera model, and dimensions.
- [ ] Add idempotent upload sessions.
- [ ] Add cleanup job for abandoned uploads.

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
