# Common Navbar And Navigation Management Plan

## Goal

Build one backend-driven, reusable navigation system for all ASafariM apps while keeping each app free to render a navbar, sidebar, command palette, or mobile menu that fits its product surface.

The portal admin area already has Navigation Management backed by `NavItem`. The next step is to make `NavItem` app-aware, expose a filtered public navigation API, and move common navbar logic into `@asafarim/ui` so every app consumes the same data contract.

## Current State

- `packages/db/prisma/schema.prisma` already has:
  - `NavItem` with `label`, `href`, `position`, `visibility`, `requiredRole`, `parentId`, `group`, `isActive`, `icon`, `target`.
  - `AppRegistry` with app codes such as `portal`, `content-generator`, `ops-hub`, `marketing-content`.
- `apps/portal/app/admin/navigation/page.tsx` already manages nav items.
- `apps/portal/app/api/admin/navigation/*` already provides admin CRUD routes with `navigation.list` and `navigation.edit` permissions.
- `packages/ui/src/app-switcher.tsx` already defines an `AppKey` union and app metadata, but this is hard-coded.
- App navs are currently duplicated:
  - Portal: `apps/portal/components/site-shell.tsx`
  - Content Generator: `apps/content-generator/components/Shell.tsx` and `Header.tsx`
  - EduMatch: `apps/edumatch/components/EduNav.tsx`
  - Ops Hub: `apps/ops-hub/components/Shell.tsx`
  - Marketing Content: `apps/marketing-content/components/Shell.tsx`

## Recommended Model

Use `NavItem` as the canonical navigation table and add an explicit app-scope field:

```prisma
model NavItem {
  id           String  @id @default(cuid())
  label        String
  labelKey     String?
  href         String
  position     Int     @default(0)
  visibility   String  @default("public")
  requiredRole String?
  requiredPermissions String[] @default([])
  appScope     String[] @default(["all"])
  parentId     String?
  isActive     Boolean @default(true)
  icon         String?
  target       String? @default("_self")
  group        String  @default("main")
  placement    String  @default("header")
  metadata     Json?

  parent   NavItem?  @relation("NavItemTree", fields: [parentId], references: [id])
  children NavItem[] @relation("NavItemTree")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([group])
  @@index([position])
  @@index([visibility])
  @@index([parentId])
  @@index([placement])
}
```

`appScope` should contain app codes or `"all"`, for example:

```json
["all"]
["portal"]
["portal", "content-generator"]
["ops-hub", "marketing-content"]
```

This is simpler and faster than creating a join table at the current scale. If app-specific overrides later become complex, introduce `NavItemAppOverride` without changing the public API contract.

## App Codes

Use one shared app-code source across database seed data, API validation, and UI:

```ts
export const APP_CODES = [
  "portal",
  "content-generator",
  "ops-hub",
  "marketing-content",
  "edumatch",
] as const;

export type AppCode = (typeof APP_CODES)[number];
export type NavAppScope = "all" | AppCode;
```

Recommended home: `packages/types/src/index.ts` or a new `packages/navigation` package if the logic grows.

## Filtering Logic

Create a pure resolver function and test it heavily:

```ts
type ResolveNavigationInput = {
  items: NavItemDto[];
  currentApp: AppCode;
  user?: {
    authenticated: boolean;
    roles: string[];
    permissions: string[];
  };
  placement?: "header" | "sidebar" | "footer" | "command";
  group?: string;
};
```

Filtering order:

1. Keep only `isActive`.
2. Keep only items where `appScope` contains `"all"` or `currentApp`.
3. Keep only requested `placement` and/or `group`.
4. Apply visibility:
   - `public`: always visible.
   - `authenticated`: only signed-in users.
   - `role`: signed-in users with `requiredRole` or `requiredPermissions`.
5. Remove parents with no visible children unless the parent itself has an actionable `href`.
6. Sort by `group`, `position`, then `label`.

The same resolver should run server-side for API responses and client-side only for defensive rendering. Do not rely on client-side filtering for permission-sensitive links.

## API Design

Keep admin CRUD under portal:

- `GET /api/admin/navigation`
- `POST /api/admin/navigation`
- `PATCH /api/admin/navigation/[id]`
- `DELETE /api/admin/navigation/[id]`

Add a read API for apps:

- `GET /api/navigation?app=portal&placement=header`
- `GET /api/navigation?app=ops-hub&placement=sidebar`
- `GET /api/navigation?app=content-generator&group=main`

Behavior:

- Public endpoint may return public-only nav for unauthenticated users.
- Authenticated endpoint can use session roles and permissions to include role-gated items.
- Validate `app` against `APP_CODES`.
- Cache public responses briefly with `s-maxage`.
- Use `no-store` or user-aware cache keys for authenticated responses.

## Shared UI Package

Add a small navigation layer to `packages/ui` or a new `packages/navigation`:

- `types.ts`: `AppCode`, `NavItemDto`, `NavPlacement`, `ResolvedNavItem`.
- `resolver.ts`: `resolveNavigation(input)`.
- `fetcher.ts`: `getNavigation({ app, placement, group })`.
- `CommonNavbar.tsx`: product-agnostic top navbar renderer.
- `CommonSidebar.tsx`: product-agnostic sidebar renderer.
- `AppSwitcher`: should eventually consume `AppRegistry` or a shared app config, not a duplicated hard-coded list.

Keep icons as string keys in the database, not JSX:

```ts
const NAV_ICON_MAP = {
  overview: OverviewIcon,
  users: UsersIcon,
  billing: BillingIcon,
  analytics: AnalyticsIcon,
  home: HomeIcon,
} as const;
```

Unknown icons should fall back to a neutral icon. This avoids storing code-like values in the database.

## Admin UI Changes

Update `Navigation Management` with these fields:

- Label
- Optional translation key, `labelKey`
- Href
- App scope multi-select:
  - All apps
  - Portal
  - Content Generator
  - Ops Hub
  - Marketing Content
  - EduMatch
- Placement select:
  - Header
  - Sidebar
  - Footer
  - Command palette
- Group
- Parent item
- Position
- Icon key
- Target
- Visibility
- Required role
- Required permissions multi-select
- Active toggle
- Metadata JSON only for advanced cases

Important UX rule: when "All apps" is selected, disable individual app checkboxes to avoid ambiguous records.

## URL Strategy

A nav item can be internal to the current app or cross-app:

- Internal app URL: `href="/overview"` and `appScope=["ops-hub"]`.
- Portal anchored URL: `href="/#contact"` and `appScope=["portal"]`.
- Cross-app URL: store `metadata.appTarget = "portal"` and `href="/profile"`, then resolve to `${portalUrl}/profile`.
- External URL: `href="https://..."`, `target="_blank"`.

Avoid storing environment-specific full URLs for internal ASafariM apps. Store app code plus path, then resolve URLs from `AppRegistry` or environment config.

## Rollout Plan

1. Add shared types and resolver.
2. Add `appScope`, `placement`, `labelKey`, `requiredPermissions`, and `metadata` to `NavItem`.
3. Backfill existing nav rows with `appScope=["portal"]` and `placement="header"`.
4. Seed app-specific rows for existing hard-coded navs:
   - `portal`: Capabilities, Work, Process, Stack, Contact, Profile, Admin.
   - `content-generator`: Generator, Features, Prompts.
   - `edumatch`: Home, Student Dashboard, Ask Question, Tutor.
   - `ops-hub`: Overview, Tenants, Users, Billing, System, Feature Flags, Lifecycle, Automations, Audit Log.
   - `marketing-content`: Overview, Campaigns, Content, SEO, Leads, Automations, Analytics.
5. Extend admin CRUD API validation and audit logging for the new fields.
6. Add `GET /api/navigation` for resolved, app-aware navigation.
7. Update `Navigation Management` UI with app scope and placement controls.
8. Replace one low-risk app first, ideally `content-generator`, with the shared resolver/UI.
9. Replace portal header after content-generator proves the contract.
10. Replace ops-hub and marketing-content sidebars.
11. Replace EduMatch last because its nav is user-role specific and needs careful role/permission mapping.
12. Add tests for resolver logic and API authorization behavior.

## Testing Strategy

Minimum tests:

- `appScope=["all"]` appears in every app.
- `appScope=["portal"]` appears only in portal.
- Multi-app scope appears in the selected apps only.
- `public`, `authenticated`, and `role` visibility behave correctly.
- Required permissions work independently from required role.
- Hidden parent with visible child is handled consistently.
- Inactive item never appears.
- Items sort predictably by group and position.

Recommended location:

- Resolver tests near the shared resolver package.
- API tests for `/api/navigation`.
- One Playwright smoke test per converted app to verify desktop and mobile nav render.

## Professional Implementation Notes

- Treat database navigation as configuration, not authorization. Pages and APIs must still enforce permissions independently.
- Keep the resolver pure and framework-independent; this makes it easy to use from Next server components, API routes, command palettes, and tests.
- Keep app identity explicit. Each app should pass `currentApp` once at its shell boundary.
- Do not let each app invent its own nav DTO. One DTO should serve every renderer.
- Avoid full dynamic rendering for every public page if only public nav is needed; cache public navigation separately.
- Prefer additive migration and backfill over replacing current hard-coded navs in one large change.

## Suggested First Implementation PR

Scope the first PR to infrastructure only:

- Add shared app/nav types.
- Add resolver and unit tests.
- Add Prisma fields and migration.
- Update seed data.
- Extend admin API validation.
- Update admin form with app scope and placement.

Do not replace app shells in the first PR. A second PR can convert `content-generator`, then subsequent smaller PRs can convert the remaining apps.
