# Vionto Web Issue 10 - Production Readiness, Security, Billing, and Support

**Status:** Implemented  
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

- [x] Define Vionto plans, quotas, and feature flags. _(ViontoPlanQuota model + seed script)_
- [x] Integrate billing gate using shared payment package patterns. _(added 'vionto' to CartItem.productType)_
- [x] Track usage: images uploaded, storage used, TTS seconds, render minutes, exports. _(ViontoUsageMetric model)_
- [x] Add content safety checks for uploaded media, generated script, music upload, and sharing. _(moderation API route + schema fields)_
- [x] Add provenance/audit log for generation provider, prompt version, render manifest, and export id. _(ViontoScript provenance fields + ViontoAuditEvent)_
- [x] Add retention policy for originals, intermediates, logs, and exports. _(retentionPolicy field + enforcement API)_
- [x] Add admin/support view for failed jobs and user project lookup. _(admin/support/lookup API)_
- [x] Add privacy, terms, and acceptable-use copy for AI media generation. _(legal pages created)_
- [x] Add production launch checklist and rollback plan. _(see below)_

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

## Production Launch Checklist

### Pre-Launch
- [ ] Run `pnpm --filter @asafarim/db db:generate` after schema changes
- [ ] Run `pnpm install` to add openai dependency
- [ ] Run seed script: `npx tsx packages/db/prisma/seed-vionto-plans.ts`
- [ ] Configure GitHub secrets: OPENAI_API_KEY, ELEVENLABS_API_KEY, DO_SPACES_*, REDIS_URL
- [ ] Verify content moderation API endpoint works with test content
- [ ] Test retention enforcement in dry-run mode
- [ ] Verify admin/support lookup requires admin role
- [ ] Test legal pages render correctly
- [ ] Run CI pipeline: typecheck, build, test, Docker lint
- [ ] Review all moderation outcomes for false positives/negatives

### Launch Day
- [ ] Deploy to production via deploy workflow
- [ ] Verify Vionto health endpoint responds
- [ ] Verify worker health endpoint responds
- [ ] Test end-to-end: upload → generate → render → export
- [ ] Monitor first 10 exports for success rate, latency, cost
- [ ] Check moderation API is functioning
- [ ] Verify usage metrics are being recorded
- [ ] Confirm retention policy enforcement cron is scheduled

### Post-Launch (24-48 hours)
- [ ] Monitor error rates in logs
- [ ] Check render queue backlog
- [ ] Review moderation outcomes
- [ ] Verify billing integration (if paid plans active)
- [ ] Gather feedback from beta users
- [ ] Update documentation based on issues found

## Rollback Plan

### Triggers for Rollback
- Critical bug preventing core functionality
- Security vulnerability in AI providers or infrastructure
- High rate of moderation failures or false positives
- Cost overruns beyond acceptable thresholds
- Data corruption or loss

### Rollback Steps
1. **Immediate** (if critical):
   - Stop Vionto web and worker services: `docker compose stop vionto vionto-worker`
   - Disable Vionto nginx config: `rm /etc/nginx/sites-enabled/vionto.asafarim.com.conf && nginx -s reload`
   - Notify users via email/announcement banner

2. **Graceful** (if non-critical):
   - Set Vionto to maintenance mode via environment flag
   - Allow existing projects to export but block new uploads
   - Queue existing renders for completion
   - Monitor until queue drains
   - Then stop services

3. **Data Recovery**:
   - Restore database from pre-launch backup (if corruption occurred)
   - Restore object storage from backup (if data loss occurred)
   - Verify integrity of restored data
   - Re-run seed scripts if needed

4. **Root Cause Analysis**:
   - Collect logs from all services
- Review error patterns
- Identify root cause
- Document findings and remediation plan
- Implement fix in staging
- Test thoroughly before re-launch

### Re-Launch Criteria
- Root cause identified and fixed
- Fix validated in staging environment
- Rollback plan updated if needed
- Team approval obtained
- Communication plan ready for users
