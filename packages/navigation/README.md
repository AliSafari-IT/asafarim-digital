# @asafarim/navigation

A reusable, framework-agnostic React + TypeScript navigation system used across the ASafariM Digital monorepo.

It provides composable building blocks for:

- **Top navigation bars** (`AppNavbar`)
- **Mobile drawers** (`AppDrawer`)
- **Desktop sidebars** (`AppSidebar`)
- **Collapsible rail mode** (`AppSidebar rail`)
- **Dropdown menus** (`AppNavDropdown`)
- **Nested navigation** (any depth)
- **Role / permission visibility helpers** (`filterNavByRoles`)
- **Custom routing adapters** (`renderLink` for React Router, Next.js `<Link>`, TanStack Router, native `<a>`)
- **Theme + language selector slots**
- A polished, accessible default UI driven by CSS variables

The package contains **no business logic, no auth logic, and no app-specific routing**. You inject your own.

---

## Install

It is already part of the workspace. In any app, add it as a workspace dependency:

```jsonc
// apps/<app>/package.json
{
  "dependencies": {
    "@asafarim/navigation": "workspace:*"
  }
}
```

Then import the stylesheet once at your application root:

```tsx
import "@asafarim/navigation/styles.css";
```

---

## Public API

| Export              | Kind        | Notes                                              |
| ------------------- | ----------- | -------------------------------------------------- |
| `AppNavbar`         | Component   | Responsive top bar with hamburger drawer fallback. |
| `AppSidebar`        | Component   | Vertical sidebar with optional collapsible rail.   |
| `AppDrawer`         | Component   | Controlled slide-in drawer.                        |
| `AppNavDropdown`    | Component   | Accessible dropdown menu.                          |
| `AppNavMenu`        | Component   | Generic menu (horizontal or vertical).             |
| `AppNavItem`        | Component   | Individual item + nested children.                 |
| `NavLink`           | Component   | Link primitive used internally + exported.         |
| `NavProvider`       | Component   | Optional shared context.                           |
| `useNavState`       | Hook        | Read provider state.                               |
| `useViewType`       | Hook        | `mobile` / `tablet` / `desktop`.                   |
| `useOutsideClick`   | Hook        |                                                    |
| `useControlled`     | Hook        | Controlled/uncontrolled helper.                    |
| `useBodyScrollLock` | Hook        |                                                    |
| `useFocusTrap`      | Hook        |                                                    |
| `filterNavByRoles`  | Utility     | Filter a `NavItem[]` tree.                         |
| `isItemActive`      | Utility     |                                                    |
| `isBranchActive`    | Utility     |                                                    |
| `cn`                | Utility     | Class-name joiner.                                 |
| `resolveNavigation` | Utility     | Server-side DTO resolver (existing).               |
| All public types    | TypeScript  | See [`src/types.ts`](./src/types.ts).              |

---

## Core types

```ts
type ViewType = "mobile" | "tablet" | "desktop";

type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  badge?: React.ReactNode;
  description?: string;
  shortcut?: string;
  children?: NavItem[];
  requiredRoles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
  onClick?: (event: React.MouseEvent) => void;
};
```

See [`src/types.ts`](./src/types.ts) for the full set (`AppNavbarProps`, `AppSidebarProps`, etc.).

---

## Usage

### 1. Simple topbar

```tsx
import { AppNavbar } from "@asafarim/navigation";
import "@asafarim/navigation/styles.css";

const items = [
  { id: "home", label: "Home", href: "/" },
  { id: "docs", label: "Docs", href: "/docs" },
  { id: "blog", label: "Blog", href: "/blog" },
];

export default function Topbar() {
  return <AppNavbar logo={<Logo />} navItems={items} sticky />;
}
```

### 2. Role-based nav

```tsx
import { AppNavbar, filterNavByRoles } from "@asafarim/navigation";

const allItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "admin", label: "Admin", href: "/admin", requiredRoles: ["admin"] },
  { id: "billing", label: "Billing", href: "/billing", permissions: ["billing:read"] },
];

function Topbar({ user }) {
  const items = filterNavByRoles(allItems, user.roles, user.permissions);
  return <AppNavbar navItems={items} />;
}
```

### 3. React Router integration

```tsx
import { Link, useLocation } from "react-router-dom";
import { AppNavbar } from "@asafarim/navigation";

function Topbar() {
  const { pathname } = useLocation();
  return (
    <AppNavbar
      navItems={items}
      currentPath={pathname}
      renderLink={({ item, children }) => (
        <Link to={item.href ?? "#"}>{children}</Link>
      )}
    />
  );
}
```

### 4. Next.js App Router integration

```tsx
"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { AppNavbar } from "@asafarim/navigation";

export function Topbar({ items }) {
  const pathname = usePathname();
  return (
    <AppNavbar
      navItems={items}
      currentPath={pathname}
      renderLink={({ item, children }) =>
        item.href ? <NextLink href={item.href}>{children}</NextLink> : children
      }
    />
  );
}
```

### 5. Mobile drawer (controlled)

```tsx
import { useState } from "react";
import { AppDrawer } from "@asafarim/navigation";

function MyDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Menu</button>
      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        navItems={items}
        logo={<Logo />}
        side="left"
      />
    </>
  );
}
```

### 6. Sidebar with collapsed rail

```tsx
import { useState } from "react";
import { AppSidebar } from "@asafarim/navigation";

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: "flex" }}>
      <AppSidebar
        logo={<Logo />}
        navItems={items}
        collapsible
        rail
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
```

### 7. Nested dropdown

```tsx
import { AppNavDropdown } from "@asafarim/navigation";

<AppNavDropdown
  trigger={<>Account ▾</>}
  items={[
    { id: "profile", label: "Profile", href: "/profile" },
    { id: "settings", label: "Settings", href: "/settings", shortcut: "⌘," },
    { id: "logout", label: "Sign out", onClick: signOut },
  ]}
  align="end"
/>;
```

### 8. Theme toggler + language selector

```tsx
<AppNavbar
  logo={<Logo />}
  navItems={items}
  countryLangSelector={<LanguageSelector />}
  themeToggler={<ThemeToggle />}
  actions={<UserMenu />}
/>
```

### 9. Custom item renderer

```tsx
<AppNavbar
  navItems={items}
  renderItem={({ item, active }) => (
    <MyCustomItem item={item} active={active} />
  )}
/>
```

### 10. Shared `NavProvider`

If you want to set `currentPath`, `renderLink`, and `onNavigate` once and reuse them across navbar, sidebar, and drawer:

```tsx
<NavProvider currentPath={pathname} renderLink={renderLink}>
  <AppNavbar navItems={items} />
  <AppSidebar navItems={items} />
</NavProvider>
```

---

## Recommended `NavItem[]` structure

Keep navigation items declarative and serializable:

```ts
const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: <HomeIcon /> },
  {
    id: "products",
    label: "Products",
    icon: <BoxIcon />,
    children: [
      { id: "p-list", label: "Browse", href: "/products" },
      { id: "p-new", label: "New product", href: "/products/new", requiredRoles: ["admin"] },
    ],
  },
  { id: "docs", label: "Docs", href: "/docs", badge: "v2" },
  { id: "github", label: "GitHub", href: "https://github.com/...", external: true },
];
```

---

## Accessibility

- Semantic markup (`<nav>`, `<ul>`, `<li>`, `<button>`)
- `aria-current="page"` on active items
- `aria-expanded` + `aria-controls` on disclosure triggers
- Escape closes drawers and dropdowns
- Click-outside closes dropdowns
- Body scroll is locked while the drawer is open
- Focus is trapped inside the drawer
- Disabled items are non-focusable

---

## Styling

The package ships a single `styles.css` you import once. All visual tokens are CSS variables and default to ASafariM tokens (`--color-surface`, `--color-text`, `--color-accent`, etc.). Override them on any parent element to fully re-theme the components, no Tailwind required.

```css
:root {
  --color-accent: #6d28d9;
  --color-surface: #fff;
  --color-text: #111;
}
```

Every component also accepts `className`, `itemClassName`, `menuClassName`, etc., for surgical overrides.

---

## Testing

The package uses **vitest** + **@testing-library/react**.

```bash
pnpm --filter @asafarim/navigation test
```

Covered: navbar rendering, active state (path + activeItemId), disabled items, external link attrs, custom `renderLink`, drawer open/close, Escape, controlled state, dropdown a11y, sidebar collapse, role filtering.

---

## Publishing to npm

This package is fully publishable. It ships compiled ESM + CJS + `.d.ts` from `dist/` and has zero private workspace dependencies.

```bash
# From the package directory:
cd packages/navigation

# Bump the version
pnpm version patch   # or minor / major

# Build + run tests (also runs automatically via prepublishOnly)
pnpm build
pnpm test

# Publish (uses "publishConfig.access: public" + npm registry)
pnpm publish
```

### What gets published

Only the `dist/`, `README.md`, and `LICENSE` files (see `files` in `package.json`):

```
dist/
  index.js        # ESM bundle
  index.cjs       # CJS bundle
  index.d.ts      # type definitions
  resolver.js     # ESM sub-export
  resolver.cjs    # CJS sub-export
  resolver.d.ts
  styles.css      # scoped CSS (consumers import once)
README.md
LICENSE
```

### Sub-path exports

| Import path                          | Use case                                                |
| ------------------------------------ | ------------------------------------------------------- |
| `@asafarim/navigation`               | All React components + types                            |
| `@asafarim/navigation/resolver`      | Server-side DTO resolver (no React, smaller bundle)     |
| `@asafarim/navigation/styles.css`    | Scoped stylesheet                                       |

### Peer dependencies

Consumers must install `react` (and `react-dom`) themselves:

```bash
npm install @asafarim/navigation react react-dom
```

### Release checklist

- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes
- [ ] `CHANGELOG.md` updated (if you keep one)
- [ ] `pnpm version <patch|minor|major>` bumps the version
- [ ] `pnpm publish` (or `npm publish`) — `prepublishOnly` reruns build + tests as a safety net
- [ ] Tag pushed: `git push --follow-tags`
