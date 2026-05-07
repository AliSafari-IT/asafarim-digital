# Vionto Mobile Issue 4 - Photo Ingestion, Permissions, and Offline Queue

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `uploads`, `offline`, `media`

## Objective

Build the Android-first photo ingestion flow for selecting images, preserving metadata, handling permissions, and uploading reliably over mobile networks.

## Source Review Notes

- Vionto web currently has an upload UI placeholder only.
- No Vionto database models exist yet in `packages/db`.
- No object storage client exists for Vionto-specific assets.
- The MVP plan requires image upload, zip/folder import, thumbnails, EXIF, and S3-compatible storage.

## Scope

- [ ] Add Android photo picker integration with multi-select support.
- [ ] Request and explain photo/media permissions using localized copy.
- [ ] Preserve original file metadata where available.
- [ ] Generate local preview thumbnails before upload.
- [ ] Add resumable/chunked upload strategy or retry queue for unstable networks.
- [ ] Queue uploads when offline and resume when connectivity returns.
- [ ] Enforce mobile upload limits before network transfer.
- [ ] Surface per-file validation errors for unsupported formats or size limits.

## Acceptance Criteria

- A user can select 30-60 images on Android and see a stable ordered preview list.
- Upload progress survives short app backgrounding/network drops.
- Unsupported assets do not block valid assets from uploading.
- EXIF timestamp/orientation metadata is preserved or clearly marked unavailable.
- The upload queue cannot create duplicate assets on retry.

## Test Plan

- Test on emulator and one physical Android device.
- Simulate airplane mode, network loss, and app backgrounding.
- Verify upload ordering and duplicate prevention.
- Add API contract tests for idempotent upload sessions.
