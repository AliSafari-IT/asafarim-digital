# Vionto Web Issue 3 - Database Schema for Media Projects

**Status:** In Progress  
**Priority:** High  
**Assignee:** AI Assistant  
**Labels:** `vionto`, `web`, `database`, `prisma`, `media`

## Objective

Add Vionto domain models to `packages/db` for projects, assets, scripts, audio, render jobs, exports, quotas, and audit events.

## Source Review Notes

- `packages/db/prisma/schema.prisma` has platform models, content-generator models, EduMatch models, cart models, audit logs, and app registry models.
- No Vionto-specific models exist yet.
- Vionto MVP requires source images, thumbnails, EXIF metadata, generated scripts, SRT, TTS audio, background music, render jobs, and MP4 exports.

## Scope

- [x] Add `ViontoProject` with owner, tenant, title, mode, locale, status, aspect ratio, and target duration.
  - `packages/db/prisma/schema.prisma` — added with relations to assets, scripts, audio, renders, exports.
- [x] Add `ViontoAsset` for originals, thumbnails, dimensions, order, metadata, and storage keys.
- [x] Add `ViontoScript` for prompt version, provider metadata, narration text, SRT text, and user-edited flag.
- [x] Add `ViontoAudioTrack` for narration, music, voice, duration, and mix settings.
- [x] Add `ViontoRenderJob` for queue id, state, progress, logs, retry count, and error summary.
- [x] Add `ViontoExport` for output storage key, duration, file size, format, and signed-link metadata.
- [x] Add audit/usage records tied to user and tenant.
  - `ViontoAuditEvent` model added with actor relation and domain-specific action/entity tracking.
- [x] Create migration and seed records for roles/permissions/app registry.
  - Migration `20260507203954_add_vionto_media_domain` generated and applied.
  - App registry + roles/permissions already seeded in prior #024 work.

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
