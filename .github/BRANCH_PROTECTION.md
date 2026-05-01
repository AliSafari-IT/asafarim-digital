# Branch Protection Setup Guide

This document describes how to configure branch protection rules for the `main` branch.

## GitHub UI Configuration

Go to **Settings → Branches → Add rule** and configure:

### Branch Name Pattern
```
main
```

### Protection Rules

#### ✅ Require a pull request before merging
- **Require approvals:** 1
- **Dismiss stale PR approvals when new commits are pushed:** ✅
- **Require review from CODEOWNERS:** ⬜ (optional)

#### ✅ Require status checks to pass before merging
**Required status checks:**
- `typecheck` — TypeScript type checking
- `lint` — ESLint validation
- `build` — Build verification
- `schema-check` — Database schema validation
- `all-checks-pass` — Branch protection aggregation

#### ✅ Require conversation resolution before merging
Ensures all review comments are resolved.

#### ✅ Require signed commits
(optional, but recommended for security)

#### ✅ Include administrators
Even admins must follow the rules (prevents accidents).

#### ⬜ Allow force pushes
**Leave unchecked** — Force pushes to main should never be allowed.

#### ⬜ Allow deletions
**Leave unchecked** — Main branch should never be deleted.

## Workflow Files

The following workflows enforce these protections:

| Workflow | Purpose | Triggers |
|----------|---------|----------|
| `ci.yml` | Type check, lint, build, schema validation | Push to main/develop, all PRs |
| `pr-checks.yml` | PR metadata, lockfile, security audit, bundle size | PRs to main |
| `branch-protection.yml` | Review requirements, branch currency | PRs to main |
| `deploy.yml` | Deploy to VPS (only from main) | Push to main, manual |

## Semantic Commit Convention

PR titles should follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting (no code change)
- `refactor` — Code restructuring
- `perf` — Performance improvement
- `test` — Adding/updating tests
- `build` — Build system changes
- `ci` — CI/CD changes
- `chore` — Maintenance
- `revert` — Revert previous commit

### Scopes
- `edumatch` — EduMatch app
- `portal` — Portal app
- `auth` — Authentication package
- `db` — Database package
- `ui` — UI package
- `payments` — Payments package
- `shared` — Shared configuration
- `infra` — Infrastructure/deployment

### Examples
```
feat(edumatch): add student profile API

fix(auth): resolve session timeout issue

docs: update deployment instructions
```

## Bypassing Rules (Emergency Only)

Administrators can bypass protection rules in emergencies:

1. Go to **Settings → Branches**
2. Temporarily uncheck rules
3. Make the urgent fix
4. Re-enable rules immediately
5. Document the bypass in PR comments

## Troubleshooting

### "Required status check not found"
- Ensure the workflow file exists and is valid YAML
- Push a test commit to trigger the workflow
- Check **Actions** tab for workflow runs

### "Merging is blocked"
- All required checks must show ✅ (not ⏭️ skipped)
- Ensure at least 1 approving review
- Resolve all conversation threads
- Rebase if branch is behind main

### Lockfile conflicts
```bash
pnpm install --frozen-lockfile
# If conflicts exist:
pnpm install
# Commit the updated pnpm-lock.yaml
```
