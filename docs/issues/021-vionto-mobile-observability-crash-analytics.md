# Vionto Mobile Issue 7 - Mobile Observability, Crash Reporting, and Analytics

**Status:** Ready for development  
**Priority:** Medium  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `observability`, `analytics`, `production`

## Objective

Add production-grade mobile observability so Vionto can be debugged and measured during internal QA and closed beta.

## Source Review Notes

- The repo has app health endpoints and deployment health checks for existing web apps.
- Vionto mobile currently has no crash, analytics, or client log strategy.
- MVP success metrics include time to first MP4, export success rate, edit rate, and cost per export.

## Scope

- [ ] Select mobile crash reporting provider and document privacy settings.
- [ ] Add analytics event schema for upload started/completed, story generated, script edited, render started, render completed, export shared.
- [ ] Attach app version, platform, locale, network type, and anonymized user/project ids.
- [ ] Add client log capture for upload and render failures.
- [ ] Add opt-out or privacy notice where required.
- [ ] Add dashboard requirements for closed beta monitoring.

## Acceptance Criteria

- Mobile crashes can be tied to app version and release channel.
- Product metrics can be calculated for the MVP success criteria.
- Logs do not include raw photos, story text, OAuth tokens, or signed URLs.
- Analytics events use shared names that can also be emitted by the web app.

## Test Plan

- Trigger a test crash in a non-production build.
- Verify analytics event payload shape.
- Verify PII redaction in client logs.
- Confirm mobile metrics align with web metrics.
