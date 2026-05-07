# Vionto Web Issue 7 - API Contracts, Queue Status, and Realtime Updates

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `api`, `queue`, `realtime`

## Objective

Create stable web/mobile API contracts for projects, uploads, story generation, render jobs, progress updates, exports, and retries.

## Source Review Notes

- Vionto currently exposes only `/api/health`.
- `turbo.json` already supports build/typecheck/test tasks across the monorepo.
- Mobile and web need the same backend contract for future scalability.

## Scope

- [ ] Define route handlers for project create/list/detail/update/delete.
- [ ] Define upload session, asset order, and metadata APIs.
- [ ] Define story generate/save/regenerate APIs.
- [ ] Define audio preferences and TTS preview APIs.
- [ ] Define render start/status/cancel/retry APIs.
- [ ] Define export download/share APIs.
- [ ] Add polling response shape and optional SSE/WebSocket strategy.
- [ ] Add Zod or shared schema validation in an appropriate package.

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
