# Common Navbar Navigation System

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `navigation`, `ui`, `infrastructure`

## Objective
Build one backend-driven, reusable navigation system for all ASafariM apps while keeping each app free to render a navbar, sidebar, command palette, or mobile menu that fits its product surface.

## Background
Currently, each app has duplicated navigation logic:
- Portal: `apps/portal/components/site-shell.tsx`
- Content Generator: `apps/content-generator/components/Shell.tsx` and `Header.tsx`
- EduMatch: `apps/edumatch/components/EduNav.tsx`
- Ops Hub: `apps/ops-hub/components/Shell.tsx`
- Marketing Content: `apps/marketing-content/components/Shell.tsx`

The portal admin area already has Navigation Management backed by `NavItem`, but it needs to be made app-aware and shared across all apps.

## Tasks

### 1. Add Shared Types and Resolver
- [ ] Create `packages/types/src/navigation.ts` with:
  - `APP_CODES` const array
  - `AppCode` type
  - `NavAppScope` type
  - `NavItemDto` interface
  - `NavPlacement` type
  - `ResolvedNavItem` interface
- [ ] Create `packages/navigation/resolver.ts` with `resolveNavigation(input)` function
- [ ] Write comprehensive tests for resolver logic:
  - Filter by appScope
  - Filter by placement/group
  - Apply visibility rules (public/authenticated/role)
  - Remove parents with no visible children
  - Sort by group, position, label

### 2. Update Prisma Schema
- [ ] Add fields to `NavItem` model:
  - `appScope String[] @default(["all"])`
  - `placement String @default("header")`
  - `labelKey String?`
  - `requiredPermissions String[] @default([])`
  - `metadata Json?`
- [ ] Add indexes for new fields
- [ ] Run database migration

### 3. Backfill Existing Navigation Data
- [ ] Update existing nav rows with `appScope=["portal"]` and `placement="header"`
- [ ] Seed app-specific navigation for:
  - `portal`: Capabilities, Work, Process, Stack, Contact, Profile, Admin
  - `content-generator`: Generator, Features, Prompts
  - `edumatch`: Home, Student Dashboard, Ask Question, Tutor
  - `ops-hub`: Overview, Tenants, Users, Billing, System, Feature Flags, Lifecycle, Automations, Audit Log
  - `marketing-content`: Overview, Campaigns, Content, SEO, Leads, Automations, Analytics

### 4. Extend Admin CRUD API
- [ ] Update validation for new fields in `apps/portal/app/api/admin/navigation/*`
- [ ] Add audit logging for app scope changes
- [ ] Ensure "All apps" selection disables individual app checkboxes

### 5. Add Public Navigation API
- [ ] Create `GET /api/navigation?app=portal&placement=header`
- [ ] Create `GET /api/navigation?app=ops-hub&placement=sidebar`
- [ ] Create `GET /api/navigation?app=content-generator&group=main`
- [ ] Implement filtering logic using resolver
- [ ] Add caching:
  - `s-maxage` for public responses
  - User-aware cache keys for authenticated responses
- [ ] Validate `app` parameter against `APP_CODES`

### 6. Update Admin UI
- [ ] Update `Navigation Management` page with new fields:
  - Label and optional translation key
  - App scope multi-select with UX rule
  - Placement select (header/sidebar/footer/command)
  - Group selector
  - Parent item selector
  - Icon key selector
  - Target selector
  - Visibility selector
  - Required role selector
  - Required permissions multi-select
  - Active toggle
  - Metadata JSON editor (advanced)

### 7. Create Shared UI Components
- [ ] Add to `packages/ui` or new `packages/navigation`:
  - `CommonNavbar.tsx` - product-agnostic top navbar renderer
  - `CommonSidebar.tsx` - product-agnostic sidebar renderer
  - `NAV_ICON_MAP` - icon key to component mapping
- [ ] Update `AppSwitcher` to consume `AppRegistry` instead of hard-coded list

### 8. Rollout to Apps (Phased)
- [ ] Replace `content-generator` navigation first (low-risk)
- [ ] Replace portal header navigation
- [ ] Replace ops-hub sidebar navigation
- [ ] Replace marketing-content sidebar navigation
- [ ] Replace EduMatch navigation last (role-specific, needs careful mapping)

### 9. URL Resolution Strategy
- [ ] Implement cross-app URL resolution using `metadata.appTarget`
- [ ] Resolve internal app URLs from `AppRegistry` or environment config
- [ ] Avoid storing environment-specific full URLs in database

## Acceptance Criteria
- [ ] All apps consume navigation from shared API
- [ ] Navigation is filtered by app scope, placement, group, and user permissions
- [ ] Admin UI can manage navigation for all apps
- [ ] Cross-app links work correctly
- [ ] Public navigation is cached appropriately
- [ ] Resolver has comprehensive test coverage
- [ ] No duplicate navigation code across apps

## Technical Notes
- Use `NavItem` as canonical navigation table
- `appScope` should contain app codes or `"all"`
- Same resolver runs server-side for API and client-side for defensive rendering
- Do not rely on client-side filtering for permission-sensitive links
- Icons stored as string keys in database, mapped to components in UI

## Related Files
- `packages/db/prisma/schema.prisma` - NavItem model
- `apps/portal/app/admin/navigation/page.tsx` - Navigation Management UI
- `apps/portal/app/api/admin/navigation/*` - Admin CRUD routes
- `packages/ui/src/app-switcher.tsx` - App switcher component
- `docs/common-navbar-navigation-plan.md` - Full plan document

## Estimated Effort
2-3 weeks

## Blockers
None - infrastructure and admin navigation already exist.
