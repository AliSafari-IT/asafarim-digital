# EduMatch Common Navigation Integration

**Status:** In Progress (Implementation Complete, Testing Pending)  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `navigation`, `edumatch`

## Objective
Integrate the newly implemented common navbar navigation system into the EduMatch web app, replacing the current hard-coded navigation in `apps/edumatch/components/EduNav.tsx` with the shared navigation API and components.

## Background
The common navbar navigation system has been completed with:
- Shared types and resolver in `packages/navigation`
- Public Navigation API endpoint at `/api/navigation`
- Shared UI components: `CommonNavbar`, `CommonSidebar`, `NAV_ICON_MAP`
- Admin UI with filters for navigation management

EduMatch currently has hard-coded navigation that needs to be migrated to consume the shared system.

## Tasks

### 1. Seed EduMatch Navigation Items ✅
- [x] Add EduMatch-specific navigation items to Prisma seed:
  - Header nav: Home (public), Student (role-based), Tutor (role-based)
  - Student sidebar: Dashboard, New Inquiry, My Inquiries, My Bookings, Wallet, Profile
  - Tutor sidebar: Dashboard, Quote Requests, My Quotes, My Bookings, Earnings, Wallet, Profile, Settings
  - Placement: header for main nav, sidebar for dashboard
  - Visibility: public for home, role-based for student/tutor specific items
- [x] Set appropriate `appScope` to `["edumatch"]`
- [x] Configure `requiredRole` for role-specific items (edumatch_student, edumatch_tutor)
- [x] Add icon keys from `NAV_ICON_MAP` (home, education, users, overview, chat, list, layers, billing, analytics, settings)

### 2. Update EduMatch Web App ✅
- [x] Replace `apps/edumatch/components/EduNav.tsx` with `CommonNavbar` from `@asafarim/ui`
- [x] Add `useNavigation` hook to fetch navigation items for `app="edumatch"`
- [x] Wire up placement filtering (header for main nav)
- [x] Configure logo (`EduLogo` component) and right content (CountryLanguageSelector, ThemeToggle, AppSwitcher, UserMenu)
- [ ] Test navigation for unauthenticated, student, and tutor roles

### 3. Add Sidebar Navigation for Dashboard Pages ✅
- [x] Create `EduSidebar.tsx` with `CommonSidebar` for student and tutor dashboard pages
- [x] Filter by `placement="sidebar"`
- [x] Group items appropriately (main, account, apps)
- [x] Create `StudentSidebar`, `TutorSidebar`, and `EduSidebar` (auto-detect role) components
- [x] Ensure mobile responsive behavior with collapsible sidebar

### 4. Cross-App Links ✅
- [x] Add navigation items for cross-app links (Portal, Content Generator, Ops Hub, Marketing Content)
- [x] Use `metadata.appTarget` for cross-app URL resolution
- [ ] Ensure environment variables for app URLs are set (NEXT_PUBLIC_PORTAL_URL, etc.)

### 5. Testing
- [ ] Run `pnpm db:seed` to seed EduMatch navigation items
- [ ] Verify navigation items appear correctly for each role
- [ ] Test role-based visibility (student-only, tutor-only items)
- [ ] Test cross-app links resolve correctly
- [ ] Verify mobile menu behavior
- [ ] Test navigation with no items (fallback behavior)
- [ ] Run `pnpm build` in apps/edumatch to verify no TypeScript errors

## Acceptance Criteria
- [ ] EduMatch web app consumes navigation from `/api/navigation?app=edumatch`
- [ ] Navigation items are role-appropriate (students see student items, tutors see tutor items)
- [ ] Cross-app links work correctly
- [ ] No hard-coded navigation in EduMatch web app
- [ ] Navigation can be managed from Portal Admin UI

## Related Files
- `packages/navigation/src/resolver.ts` - Navigation resolver
- `packages/ui/src/common-navbar.tsx` - Shared navbar component
- `packages/ui/src/common-sidebar.tsx` - Shared sidebar component
- `apps/edumatch/components/EduNav.tsx` - Current hard-coded navigation (to be replaced)
- `packages/db/prisma/seed.ts` - Navigation seed data

## Estimated Effort
3-4 days

## Blockers
None - common navigation system is complete and functional.
