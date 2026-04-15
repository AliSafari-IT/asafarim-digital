# Admin Panel — Architecture & Extension Guide

## Overview

The portal app includes a fully backend-driven admin panel with a scalable RBAC (Role-Based Access Control) system. All content, navigation, settings, user data, roles, and permissions are sourced from the database.

## Data Model

### Core Auth Models (Auth.js compatible)

- **User** — extended with `isActive`, `deactivatedAt`, `username`, profile fields
- **Account** / **Session** / **VerificationToken** — standard Auth.js tables

### RBAC Tables

```
User ──< UserRole >── Role ──< RolePermission >── Permission
```

- **Role** — `name` (slug), `displayName`, `description`, `isSystem`, `isDefault`
- **Permission** — `name` (e.g. `users.list`), `displayName`, `group`, `description`
- **UserRole** — join table with `assignedAt`, `assignedBy` tracking
- **RolePermission** — join table linking roles to permissions

### CMS Tables

- **SiteContent** — keyed by `section` (e.g. `hero`, `capabilities`). Stores `title`, `subtitle`, `eyebrow`, `body` (JSON), `metadata` (JSON), `position`, `isPublished`
- **NavItem** — hierarchical nav items with `label`, `href`, `position`, `visibility`, `requiredRole`, `parentId`, `group`, `isActive`
- **SiteSetting** — key-value store with `key`, `value` (JSON), `group`, `displayName`, `description`
- **AuditLog** — `userId`, `action`, `entity`, `entityId`, `changes` (JSON), `ipAddress`, `createdAt`

### Default Roles

| Role | System | Default | Description |
|------|--------|---------|-------------|
| `superadmin` | ✓ | ✗ | Full access, bypasses all permission checks |
| `admin` | ✓ | ✗ | Configurable admin with granular permissions |
| `standard_user` | ✓ | ✗ | Standard authenticated user |
| `guest` | ✓ | ✓ | Default role for new registrations |

### Permission Groups

- **users** — `list`, `view`, `edit`, `deactivate`
- **roles** — `list`, `view`, `edit`, `assign`
- **content** — `list`, `view`, `create`, `edit`, `delete`, `publish`
- **navigation** — `list`, `edit`
- **settings** — `list`, `edit`
- **audit** — `view`

## Architecture

### Auth Flow

1. **NextAuth.js** with PrismaAdapter handles authentication
2. JWT callback loads user's roles from `UserRole` join table → stores as `roles[]` in token
3. Session callback exposes `roles[]` to the client
4. `signIn` callback assigns default (`guest`) role to new OAuth users
5. Registration API (`/api/auth/register`) also assigns default role

### Authorization

**Middleware** (`apps/portal/middleware.ts`):
- Public routes: `/`, `/api/health`, `/sign-in`, `/sign-up`, etc.
- Admin routes (`/admin/*`): requires `superadmin` or `admin` role

**Server-side helpers** (`apps/portal/lib/authorization.ts`):
- `requirePermission(permName)` — checks session → loads user's permissions from DB → throws `AuthorizationError` if missing
- `requireAdmin()` — shorthand for admin/superadmin check
- `getUserPermissions(userId)` — returns full permission list
- `createAuditLog(params)` — records admin actions

### API Routes

All admin APIs live under `/api/admin/` and enforce permissions via `requirePermission()`:

| Endpoint | Methods | Permission |
|----------|---------|------------|
| `/api/admin/dashboard` | GET | `users.list` |
| `/api/admin/users` | GET | `users.list` |
| `/api/admin/users/[id]` | GET, PATCH | `users.view`, `users.edit` |
| `/api/admin/users/[id]/roles` | POST, DELETE | `roles.assign` |
| `/api/admin/roles` | GET, POST | `roles.list`, `roles.edit` |
| `/api/admin/roles/[id]` | PATCH, DELETE | `roles.edit` |
| `/api/admin/permissions` | GET | `roles.view` |
| `/api/admin/content` | GET, POST | `content.list`, `content.create` |
| `/api/admin/content/[id]` | PATCH, DELETE | `content.edit`, `content.delete` |
| `/api/admin/navigation` | GET, POST | `navigation.list`, `navigation.edit` |
| `/api/admin/navigation/[id]` | PATCH, DELETE | `navigation.edit` |
| `/api/admin/settings` | GET, PUT | `settings.list`, `settings.edit` |
| `/api/admin/audit` | GET | `audit.view` |
| `/api/content` | GET | *(public — published content only)* |

## Admin UI

Located at `/admin/*` with a sidebar layout (`apps/portal/app/admin/layout.tsx`):

- **Dashboard** — stats cards, role distribution, recent users, recent audit activity
- **Users** — searchable, filterable table with pagination; user detail page with role assignment
- **Roles** — list/create/edit roles with inline permission editor (grouped checkboxes)
- **Content** — manage site content sections with JSON body/metadata editor
- **Navigation** — manage nav items with hierarchy, visibility, and role restrictions
- **Settings** — grouped key-value settings editor
- **Audit Log** — filterable, paginated log viewer with expandable change details

## Backend-Driven Homepage

The homepage (`/`) is a **server component** that fetches published `SiteContent` sections from the DB and passes them as a content map to the `HomeContent` client component. Each section key (e.g. `hero`, `capabilities`, `showcase`) maps to its DB record. The `body` and `metadata` JSON fields store structured data (proof points, capability tracks, showcase items, etc.).

To edit homepage content: use the Admin → Content section, or update `SiteContent` rows directly.

## Extension Guide

### Adding a new permission

1. Add a row to the `Permission` table (via seed script or admin UI)
2. Assign it to appropriate roles via `RolePermission`
3. Use `requirePermission("your.permission")` in your API route

### Adding a new admin module

1. Create API route(s) under `apps/portal/app/api/admin/your-module/`
2. Use `requirePermission()` for authorization
3. Add `createAuditLog()` calls for write operations
4. Create UI page at `apps/portal/app/admin/your-module/page.tsx`
5. Add nav entry in `apps/portal/app/admin/layout.tsx`

### Adding a new role

Use the admin UI (Roles → New Role) or insert directly:

```ts
await prisma.role.create({
  data: {
    name: "editor",
    displayName: "Editor",
    description: "Can manage content and navigation",
    rolePermissions: {
      create: permissionIds.map(id => ({ permissionId: id }))
    }
  }
});
```

## Key Files

| Path | Purpose |
|------|---------|
| `packages/db/prisma/schema.prisma` | Data model |
| `packages/db/prisma/seed.ts` | Default data seeding |
| `packages/auth/src/index.ts` | NextAuth config with RBAC callbacks |
| `packages/auth/src/types.ts` | Extended session/JWT types |
| `packages/auth/src/middleware.ts` | Route-level auth middleware |
| `apps/portal/lib/authorization.ts` | Server-side permission helpers |
| `apps/portal/app/admin/layout.tsx` | Admin panel layout + sidebar |
| `apps/portal/app/admin/*/page.tsx` | Admin module pages |
| `apps/portal/app/api/admin/*/route.ts` | Admin API endpoints |
| `apps/portal/app/page.tsx` | Homepage (server component, fetches content) |
| `apps/portal/app/home-content.tsx` | Homepage (client component, renders content) |
