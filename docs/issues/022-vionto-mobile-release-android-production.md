# Vionto Mobile Issue 8 - Android Release, CI, and Store Readiness

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `android`, `ci`, `release`

## Objective

Prepare Vionto mobile for repeatable Android QA and production releases with CI, signing, environment separation, and store-readiness checks.

## Source Review Notes

- Existing GitHub workflows cover web CI, deploy, PR checks, branch protection, and issue triage.
- Current CI builds Portal and EduMatch explicitly, but Vionto is not included yet.
- No Android build/signing workflow exists for Vionto mobile.

## Scope

- [ ] Add Android build workflow under `.github/workflows`.
- [ ] Add release channels for local, internal QA, beta, and production.
- [ ] Configure signing secrets and document rotation.
- [ ] Add artifact upload for APK/AAB outputs.
- [ ] Add lint/type/test jobs for the selected mobile stack.
- [ ] Add release notes generation tied to issue numbers.
- [ ] Add Play Store checklist: privacy policy, data safety, screenshots, icon, permissions rationale.
- [ ] Add rollback procedure for broken mobile releases.

## Acceptance Criteria

- A pull request can validate the mobile app without manual steps.
- Internal QA builds are reproducible from GitHub Actions.
- Production signing secrets are not exposed to logs.
- Store metadata and permissions are documented before beta submission.
- Release artifacts are traceable to commit SHA and issue number.

## Test Plan

- Run mobile CI on a test branch.
- Verify generated artifact installs on Android emulator.
- Verify signing uses protected secrets only.
- Confirm release checklist is complete before beta.
