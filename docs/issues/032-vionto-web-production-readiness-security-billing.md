# Vionto Web Issue 10 - Production Readiness, Security, Billing, and Support

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `security`, `billing`, `production-readiness`

## Objective

Close the final production gaps for Vionto web: security, content safety, quotas, billing, observability, retention, support tooling, and closed beta readiness.

## Source Review Notes

- `packages/payments` exists for shared payment integration.
- `packages/db` already includes plans, subscriptions, feature flags, usage metrics, audit logs, and cart models.
- Vionto plan calls for account limits, storage quotas, analytics, simple billing integration, launch checklist, safety checks, and provenance logging.
- No Vionto-specific admin/support views exist yet.

## Scope

- [ ] Define Vionto plans, quotas, and feature flags.
- [ ] Integrate billing gate using shared payment package patterns.
- [ ] Track usage: images uploaded, storage used, TTS seconds, render minutes, exports.
- [ ] Add content safety checks for uploaded media, generated script, music upload, and sharing.
- [ ] Add provenance/audit log for generation provider, prompt version, render manifest, and export id.
- [ ] Add retention policy for originals, intermediates, logs, and exports.
- [ ] Add admin/support view for failed jobs and user project lookup.
- [ ] Add privacy, terms, and acceptable-use copy for AI media generation.
- [ ] Add production launch checklist and rollback plan.

## Acceptance Criteria

- Users cannot exceed plan limits without a clear upgrade or wait path.
- Cost per export can be calculated.
- Support can inspect failed jobs without exposing private media unnecessarily.
- Retention and deletion policies are enforceable.
- Closed beta can run with measurable export success, cost, latency, and safety outcomes.

## Test Plan

- Add quota and billing gate tests.
- Add audit/provenance tests for generated outputs.
- Add admin authorization tests.
- Run closed-beta readiness checklist before production launch.
