# @asafarim/navigation — Demo

A standalone Vite + React 19 playground that exercises every usage pattern of [`@asafarim/navigation`](../).

This folder is **excluded** from the root pnpm workspace (`!packages/navigation/demo` in `pnpm-workspace.yaml`) so it has its own `node_modules` and lockfile. The parent navigation package is consumed via `link:..`, so any source change in `../src` is reflected instantly after rebuild.

## Run it

```bash
# 1. Build the navigation package once (required because the demo imports the built dist)
cd packages/navigation
pnpm build

# 2. Install + run the demo
cd demo
pnpm install
pnpm dev
```

Visit `http://localhost:5181`.

While iterating on `../src`, run `pnpm --filter @asafarim/navigation dev` (tsup watch mode) in another terminal — the demo picks up new dist output automatically.

## What's covered

1. Simple topbar
2. Topbar with all slots filled (logo, navItems, country/language selector, theme toggler, notifications, account dropdown)
3. Role-based filtering via `filterNavByRoles`
4. React Router integration via `renderLink` adapter
5. Custom `renderItem`
6. Mobile drawer (controlled, left + right side)
7. Sidebar (plain)
8. Sidebar with collapsible icon-only rail
9. Standalone `AppNavDropdown`
10. Generic `AppNavMenu` (vertical)
11. Shared state via `NavProvider` + `useNavState`
12. Integration with [`@asafarim/country-language-selector`](https://www.npmjs.com/package/@asafarim/country-language-selector) (npm)
