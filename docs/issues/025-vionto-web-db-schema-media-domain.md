# Vionto Web Issue 3 - Database Schema for Media Projects

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `database`, `prisma`, `media`

## Objective

Add Vionto domain models to `packages/db` for projects, assets, scripts, audio, render jobs, exports, quotas, and audit events.

## Source Review Notes

- `packages/db/prisma/schema.prisma` has platform models, content-generator models, EduMatch models, cart models, audit logs, and app registry models.
- No Vionto-specific models exist yet.
- Vionto MVP requires source images, thumbnails, EXIF metadata, generated scripts, SRT, TTS audio, background music, render jobs, and MP4 exports.

## Scope

- [ ] Add `ViontoProject` with owner, tenant, title, mode, locale, status, aspect ratio, and target duration.
- [ ] Add `ViontoAsset` for originals, thumbnails, dimensions, order, metadata, and storage keys.
- [ ] Add `ViontoScript` for prompt version, provider metadata, narration text, SRT text, and user-edited flag.
- [ ] Add `ViontoAudioTrack` for narration, music, voice, duration, and mix settings.
- [ ] Add `ViontoRenderJob` for queue id, state, progress, logs, retry count, and error summary.
- [ ] Add `ViontoExport` for output storage key, duration, file size, format, and signed-link metadata.
- [ ] Add audit/usage records tied to user and tenant.
- [ ] Create migration and seed records for roles/permissions/app registry.

## Acceptance Criteria

- Prisma schema validates and migrates cleanly.
- All Vionto records enforce user/tenant ownership.
- Render jobs and exports are queryable by project.
- Deleting a project has an explicit retention/deletion policy.
- Schema supports future mobile and web clients through the same API.

## Test Plan

- Run `pnpm --filter @asafarim/db prisma validate`.
- Generate and apply migration locally.
- Add repository/service tests for project ownership and state transitions.
- Add seed idempotency test for Vionto app registry data.
