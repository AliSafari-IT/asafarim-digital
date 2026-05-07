# Vionto Web Issue 7 - API Contracts, Queue Status, and Realtime Updates

**Status:** Completed  
**Priority:** High  
**Assignee:** AI  
**Labels:** `vionto`, `web`, `api`, `queue`, `realtime`

## Objective

Create stable web/mobile API contracts for projects, uploads, story generation, render jobs, progress updates, exports, and retries.

## Source Review Notes

- Vionto now exposes comprehensive API routes for all major operations.
- `turbo.json` supports build/typecheck/test tasks across the monorepo.
- Mobile and web can share the same backend contracts via the new `@asafarim/vionto-schemas` package.

## Implementation Summary

### Shared Schema Package
Created `packages/vionto-schemas` with Zod schemas for all API contracts:
- Project CRUD schemas (`createProjectSchema`, `updateProjectSchema`, `paginationQuerySchema`)
- Upload schemas (`presignRequestSchema`, `uploadCompleteSchema`, `zipImportSchema`)
- Story schemas (`storyGenerateSchema`, `storyUpdateSchema`)
- Render manifest schemas (reused from `render-manifest.ts`)
- Audio track schemas (`audioTrackCreateSchema`, `audioTrackUpdateSchema`, `ttsPreviewSchema`)
- Job polling/SSE response schemas (`jobPollResponseSchema`, `sseEventSchema`)
- Export/share schemas (`shareExportSchema`)

### API Routes Created

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/projects` | GET, POST | List/create projects with pagination |
| `/api/projects/[projectId]` | GET, PUT, DELETE | Project CRUD with ownership checks |
| `/api/story/[scriptId]/regenerate` | POST | Regenerate narration with provider fallback |
| `/api/audio/voices` | GET | List TTS voices with locale/tag filters |
| `/api/audio/preview` | POST | Generate short TTS preview (base64) |
| `/api/audio/tracks` | GET, POST | List/create project audio tracks |
| `/api/audio/tracks/[trackId]` | PUT, DELETE | Update/delete audio track |
| `/api/render/[jobId]/retry` | POST | Idempotent retry for failed/cancelled jobs |
| `/api/exports/[exportId]/download` | GET | Generate signed download URL |
| `/api/exports/[exportId]/share` | POST | Create shareable link with expiry |
| `/api/uploads/session` | GET, POST | List/create upload sessions |
| `/api/uploads/session/[sessionId]` | GET, PUT, DELETE | Session detail, reorder assets, delete |
| `/api/render/[jobId]/events` | GET (SSE) | Real-time SSE stream for job progress |

### Key Features
- All mutating routes enforce auth via `getAuthedUser()`
- Ownership validation on every project/asset/export operation
- Consistent error response shape via `badRequest()`, `serverError()`, `unauthorized()`
- SSE endpoint with heartbeat, progress events, and auto-cleanup
- Idempotent retry logic prevents duplicate job creation
- Pagination with safe defaults and max limits

### Tests
- `lib/server/__tests__/api-contracts.test.ts` validates all shared Zod schemas
- Tests cover project, story, render, audio, pagination, and SSE schemas

## Scope

- [x] Define route handlers for project create/list/detail/update/delete.
- [x] Define upload session, asset order, and metadata APIs.
- [x] Define story generate/save/regenerate APIs.
- [x] Define audio preferences and TTS preview APIs.
- [x] Define render start/status/cancel/retry APIs.
- [x] Define export download/share APIs.
- [x] Add polling response shape and optional SSE/WebSocket strategy.
- [x] Add Zod or shared schema validation in an appropriate package.

## Acceptance Criteria

- API contracts are documented and consumed by web UI.
- Mobile can reuse the same contracts without web-specific assumptions.
- All mutating routes enforce auth and ownership.
- Job status is reliable across refreshes.
- Cancel/retry behavior is idempotent.

## Test Plan

- Add route-handler tests for auth, ownership, validation, and state transitions.
- Add contract tests using shared schema fixtures.
- Add UI integration test for status polling.
- Verify unauthorized users cannot access another user's project/export.
