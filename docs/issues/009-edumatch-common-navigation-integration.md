# EduMatch Common Navigation Integration

**Status:** Ready for development  
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

### 1. Seed EduMatch Navigation Items
- [ ] Add EduMatch-specific navigation items to Prisma seed:
  - Student nav: Home, New Inquiry, My Inquiries, My Bookings, Profile
  - Tutor nav: Home, Quote Requests, My Bookings, Wallet, Profile
  - Placement: header for main nav, sidebar for dashboard
  - Visibility: public for home, authenticated for profile, role-based for student/tutor specific items
- [ ] Set appropriate `appScope` to `["edumatch"]`
- [ ] Configure `requiredRole` for role-specific items (student vs tutor)
- [ ] Add icon keys from `NAV_ICON_MAP`

### 2. Update EduMatch Web App
- [ ] Replace `apps/edumatch/components/EduNav.tsx` with `CommonNavbar` from `@asafarim/ui`
- [ ] Add `useNavigation` hook to fetch navigation items for `app="edumatch"`
- [ ] Wire up placement filtering (header for main nav)
- [ ] Configure logo and right content (user menu, sign out)
- [ ] Test navigation for unauthenticated, student, and tutor roles

### 3. Add Sidebar Navigation for Dashboard Pages
- [ ] Use `CommonSidebar` for student and tutor dashboard pages
- [ ] Filter by `placement="sidebar"`
- [ ] Group items appropriately (e.g., "My Account", "Activity")
- [ ] Ensure mobile responsive behavior

### 4. Cross-App Links
- [ ] Add navigation items for cross-app links (Portal, Content Generator, Ops Hub, Marketing Content)
- [ ] Use `metadata.appTarget` for cross-app URL resolution
- [ ] Ensure environment variables for app URLs are set

### 5. Testing
- [ ] Verify navigation items appear correctly for each role
- [ ] Test role-based visibility (student-only, tutor-only items)
- [ ] Test cross-app links resolve correctly
- [ ] Verify mobile menu behavior
- [ ] Test navigation with no items (fallback behavior)

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
