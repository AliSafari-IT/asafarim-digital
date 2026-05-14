import { useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { SiteNav } from "./SiteNav";
import { HomePage } from "./HomePage";
import { GetStartedPage } from "./GetStartedPage";
import {
  AppNavbar,
  AppSidebar,
  AppDrawer,
  AppNavDropdown,
  AppNavMenu,
  NavProvider,
  filterNavByRoles,
  type NavItem,
  type RenderLink,
} from "@asafarim/navigation";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import { navItems, accountDropdownItems } from "./data";
import {
  AvatarTrigger,
  CodeBlock,
  Logo,
  NotificationBell,
  ThemeToggle,
} from "./widgets";

/* ──────────────────────────────────────────────────────────
 * Shared Next.js / React Router adapter so every demo can
 * navigate without full page reloads.
 * ────────────────────────────────────────────────────────── */
const renderLink: RenderLink = ({ item, children }) => {
  if (!item.href) return <>{children}</>;
  if (item.external || /^https?:\/\//.test(item.href)) {
    return (
      <a
        href={item.href}
        className="asaf-nav-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={item.href} className="asaf-nav-link">
      {children}
    </Link>
  );
};

/* ──────────────────────────────────────────────────────────
 * Code snippets for each demo section
 * ────────────────────────────────────────────────────────── */
const CODE_1 = `\
<AppNavbar
  logo={<Logo />}
  navItems={navItems.slice(0, 4)}
  responsiveMode="always-expanded"
  bordered={false}
/>`;

const CODE_2 = `\
<AppNavbar
  logo={<Logo />}
  navItems={navItems.slice(0, 4)}
  responsiveMode="always-expanded"
  countryLangSelector={<CountryLanguageSelector />}
  themeToggler={<ThemeToggle />}
  actions={
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <NotificationBell />
      <AppNavDropdown
        trigger={<AvatarTrigger />}
        items={accountDropdownItems}
        align="end"
        ariaLabel="Account menu"
      />
    </div>
  }
  bordered={false}
/>`;

const CODE_3 = `\
const [roles, setRoles] = useState<string[]>([]);
const [permissions, setPermissions] = useState<string[]>([]);

// navItems with requiredRoles / permissions fields:
// { id: "admin", label: "Admin", requiredRoles: ["admin"] }
// { id: "billing", label: "Billing", permissions: ["billing:read"] }

<AppNavbar
  logo={<Logo />}
  navItems={filterNavByRoles(navItems, roles, permissions)}
  responsiveMode="always-expanded"
  bordered={false}
/>`;

const CODE_4 = `\
import { Link, useLocation } from "react-router-dom";
import { NavProvider, AppNavbar, type RenderLink } from "@asafarim/navigation";

const renderLink: RenderLink = ({ item, children }) => {
  if (item.external || /^https?:\\/\\//.test(item.href ?? ""))
    return <a href={item.href} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link to={item.href!}>{children}</Link>;
};

// NavProvider sets currentPath + renderLink once for all descendants
<NavProvider currentPath={pathname} renderLink={renderLink}>
  <AppNavbar
    logo={<Logo />}
    navItems={navItems}
    responsiveMode="always-expanded"
    bordered={false}
  />
</NavProvider>`;

const CODE_5 = `\
<AppNavbar
  logo={<Logo />}
  navItems={navItems.slice(0, 5)}
  responsiveMode="always-expanded"
  bordered={false}
  renderItem={({ item, active }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.375rem 0.75rem",
        borderRadius: 6,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "inherit",
        fontWeight: active ? 600 : 400,
        fontSize: "0.875rem",
      }}
    >
      {item.label}
      {item.external && <span className="demo-tag">ext</span>}
      {active && <span aria-hidden="true">✓</span>}
    </span>
  )}
/>`;

const CODE_6 = `\
const [open, setOpen] = useState(false);
const [side, setSide] = useState<"left" | "right">("left");

<button onClick={() => setOpen(true)}>Open drawer</button>

<AppDrawer
  open={open}
  onOpenChange={setOpen}
  navItems={navItems}
  logo={<Logo />}
  side={side}
  footer={<small>Demo footer</small>}
/>`;

const CODE_7 = `\
<AppSidebar
  logo={<Logo />}
  navItems={navItems}
  footer={<small>v0.2.0 · MIT</small>}
/>`;

const CODE_8 = `\
// collapsible enables the toggle button
// rail renders icons-only when collapsed
<AppSidebar
  logo={<Logo compact />}
  navItems={navItems}
  collapsible
  rail
  defaultCollapsed={false}
/>`;

const CODE_9 = `\
// AppNavDropdown works standalone — no AppNavbar needed
<AppNavDropdown
  trigger={<span>Account ▾</span>}
  items={accountDropdownItems}
  align="start"
  ariaLabel="Account"
/>`;

const CODE_10 = `\
// AppNavMenu is the shared primitive inside Navbar / Sidebar / Drawer
<AppNavMenu
  items={navItems.slice(0, 5)}
  orientation="vertical"
/>`;

const CODE_11 = `\
// Wrap once at the root — all navigation components
// automatically inherit currentPath, renderLink, and user context
<NavProvider
  currentPath={pathname}
  renderLink={renderLink}
  userRoles={roles}
  userPermissions={permissions}
>
  <AppNavbar logo={<Logo />} navItems={navItems} />
  <AppSidebar navItems={navItems} />
  <AppDrawer open={open} onOpenChange={setOpen} navItems={navItems} />
</NavProvider>`;

const CODE_12 = `\
<AppNavbar
  logo={<Logo />}
  navItems={[
    { id: "home", label: "Home", href: "/" },
    {
      id: "products",
      label: "Products",
      children: [
        { id: "p-list", label: "All products", href: "/products" },
        { id: "p-new", label: "Launch", href: "/products/new", badge: "β" },
      ],
    },
    { id: "pricing", label: "Pricing", href: "/pricing" },
  ]}
  responsiveMode="always-expanded"
  countryLangSelector={<CountryLanguageSelector />}
  themeToggler={<ThemeToggle />}
  actions={
    <AppNavDropdown
      trigger={<AvatarTrigger />}
      items={accountDropdownItems}
      align="end"
    />
  }
  bordered={false}
/>`;

/* ──────────────────────────────────────────────────────────
 * App
 * ────────────────────────────────────────────────────────── */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
      <Route path="/get-started" element={<SiteLayout><GetStartedPage /></SiteLayout>} />
      <Route path="/demo" element={<DemoShowcase />} />
      <Route path="*" element={<SiteLayout><HomePage /></SiteLayout>} />
    </Routes>
  );
}

function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
    </>
  );
}

function DemoShowcase() {
  const { pathname } = useLocation();
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <NavProvider
      currentPath={pathname}
      renderLink={renderLink}
      userRoles={roles}
      userPermissions={permissions}
    >
      <SiteNav />
      <div className="demo-page">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <ThemeToggle />
        </header>
        <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
          A standalone showcase of every usage pattern supported by{" "}
          <code>@asafarim/navigation</code>. Open each section to inspect the
          live component plus its source.
        </p>

        <nav className="demo-toc">
          <h3>Sections</h3>
          <ol>
            <li><a href="#topbar-simple">1. Simple topbar</a></li>
            <li><a href="#topbar-full">2. Topbar with all slots</a></li>
            <li><a href="#topbar-role">3. Role-based topbar</a></li>
            <li><a href="#topbar-router">4. React Router integration</a></li>
            <li><a href="#topbar-custom-item">5. Custom renderItem</a></li>
            <li><a href="#drawer">6. Mobile drawer (controlled)</a></li>
            <li><a href="#sidebar">7. Sidebar</a></li>
            <li><a href="#sidebar-rail">8. Sidebar collapsible rail</a></li>
            <li><a href="#dropdown">9. Standalone dropdown</a></li>
            <li><a href="#menu">10. Generic AppNavMenu</a></li>
            <li><a href="#provider">11. NavProvider + useNavState</a></li>
            <li><a href="#nested-with-country">12. With CountryLanguageSelector</a></li>
          </ol>
        </nav>

        {/* 1 */}
        <section className="demo-section" id="topbar-simple">
          <h2>1. Simple topbar</h2>
          <p>Minimum config: logo + nav items.</p>
          <div className="demo-frame">
            <AppNavbar
              logo={<Logo />}
              navItems={navItems.slice(0, 4)}
              responsiveMode="always-expanded"
              bordered={false}
            />
          </div>
          <CodeBlock code={CODE_1} />
        </section>

        {/* 2 */}
        <section className="demo-section" id="topbar-full">
          <h2>2. Topbar with all slots filled</h2>
          <p>
            Logo, primary nav, country/language selector, theme toggle,
            notifications, dropdown user menu.
          </p>
          <div className="demo-frame">
            <AppNavbar
              logo={<Logo />}
              navItems={navItems.slice(0, 4)}
              responsiveMode="always-expanded"
              countryLangSelector={<CountryLanguageSelector />}
              themeToggler={<ThemeToggle />}
              actions={
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <NotificationBell />
                  <AppNavDropdown
                    trigger={<AvatarTrigger />}
                    items={accountDropdownItems}
                    align="end"
                    ariaLabel="Account menu"
                  />
                </div>
              }
              bordered={false}
            />
          </div>
          <CodeBlock code={CODE_2} />
        </section>

        {/* 3 */}
        <section className="demo-section" id="topbar-role">
          <h2>3. Role-based navigation</h2>
          <p>
            Toggle role / permission membership below. The <code>Admin</code> and{" "}
            <code>Billing</code> entries appear and disappear via{" "}
            <code>filterNavByRoles()</code>.
          </p>
          <div className="demo-role-bar">
            <RolePill
              active={roles.includes("admin")}
              onClick={() =>
                setRoles((r) =>
                  r.includes("admin") ? r.filter((x) => x !== "admin") : [...r, "admin"]
                )
              }
            >
              role: admin
            </RolePill>
            <RolePill
              active={permissions.includes("billing:read")}
              onClick={() =>
                setPermissions((p) =>
                  p.includes("billing:read")
                    ? p.filter((x) => x !== "billing:read")
                    : [...p, "billing:read"]
                )
              }
            >
              permission: billing:read
            </RolePill>
          </div>
          <div className="demo-frame">
            <AppNavbar
              logo={<Logo />}
              navItems={filterNavByRoles(navItems, roles, permissions)}
              responsiveMode="always-expanded"
              bordered={false}
            />
          </div>
          <CodeBlock code={CODE_3} />
        </section>

        {/* 4 */}
        <section className="demo-section" id="topbar-router">
          <h2>4. React Router integration</h2>
          <p>
            Active state is driven by <code>currentPath</code> (the{" "}
            <code>useLocation()</code> pathname). The internal links are real{" "}
            <code>&lt;Link&gt;</code> elements; external links open in a new tab.
          </p>
          <div className="demo-frame">
            <AppNavbar
              logo={<Logo />}
              navItems={navItems}
              responsiveMode="always-expanded"
              bordered={false}
            />
          </div>
          <p style={{ marginTop: "0.5rem" }}>
            Current pathname: <code>{pathname}</code>
          </p>
          <CodeBlock code={CODE_4} />
        </section>

        {/* 5 */}
        <section className="demo-section" id="topbar-custom-item">
          <h2>5. Custom renderItem</h2>
          <p>
            Render each item with a totally bespoke shape — here, with a tag for
            external links and a green check for active ones.
          </p>
          <div className="demo-frame">
            <AppNavbar
              logo={<Logo />}
              navItems={navItems.slice(0, 5)}
              responsiveMode="always-expanded"
              bordered={false}
              renderItem={({ item, active }) => (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.75rem",
                    borderRadius: 6,
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--accent)" : "inherit",
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.875rem",
                  }}
                >
                  {item.label}
                  {item.external && <span className="demo-tag">ext</span>}
                  {active && <span aria-hidden="true">✓</span>}
                </span>
              )}
            />
          </div>
          <CodeBlock code={CODE_5} />
        </section>

        {/* 6 */}
        <section className="demo-section" id="drawer">
          <h2>6. Mobile drawer (controlled)</h2>
          <p>
            Click the button to open a controlled <code>AppDrawer</code> with a
            focus trap, body-scroll lock, Escape close, and backdrop click.
          </p>
          <DrawerDemo />
          <CodeBlock code={CODE_6} />
        </section>

        {/* 7 */}
        <section className="demo-section" id="sidebar">
          <h2>7. Sidebar</h2>
          <p>Plain vertical sidebar (non-collapsible).</p>
          <div className="demo-frame demo-frame--split">
            <AppSidebar
              logo={<Logo />}
              navItems={navItems}
              footer={
                <small style={{ color: "var(--text-muted)" }}>
                  v0.2.0 · MIT
                </small>
              }
            />
            <main className="demo-app-main">
              <h3>Dashboard</h3>
              <p style={{ color: "var(--text-muted)" }}>
                Main content area. Active item is resolved against the current
                route ({pathname}).
              </p>
            </main>
          </div>
          <CodeBlock code={CODE_7} />
        </section>

        {/* 8 */}
        <section className="demo-section" id="sidebar-rail">
          <h2>8. Sidebar with collapsible rail</h2>
          <p>
            <code>collapsible</code> + <code>rail</code> renders icons-only when
            collapsed. The collapse state is uncontrolled here.
          </p>
          <div className="demo-frame demo-frame--split">
            <AppSidebar
              logo={<Logo compact />}
              navItems={navItems}
              collapsible
              rail
              defaultCollapsed={false}
            />
            <main className="demo-app-main">
              <h3>Workspace</h3>
              <p style={{ color: "var(--text-muted)" }}>
                Click the chevron in the sidebar header to toggle the rail.
              </p>
            </main>
          </div>
          <CodeBlock code={CODE_8} />
        </section>

        {/* 9 */}
        <section className="demo-section" id="dropdown">
          <h2>9. Standalone dropdown</h2>
          <p>
            <code>AppNavDropdown</code> can be used anywhere — no navbar
            required.
          </p>
          <div className="demo-frame" style={{ padding: "1rem" }}>
            <AppNavDropdown
              trigger={<span>Account ▾</span>}
              items={accountDropdownItems}
              align="start"
              ariaLabel="Account"
            />
          </div>
          <CodeBlock code={CODE_9} />
        </section>

        {/* 10 */}
        <section className="demo-section" id="menu">
          <h2>10. Generic AppNavMenu (vertical)</h2>
          <p>
            <code>AppNavMenu</code> is the primitive used inside sidebar,
            drawer, and navbar. You can render it standalone — e.g., as a
            section index.
          </p>
          <div className="demo-frame" style={{ padding: "0.75rem", maxWidth: 320 }}>
            <AppNavMenu items={navItems.slice(0, 5)} orientation="vertical" />
          </div>
          <CodeBlock code={CODE_10} />
        </section>

        {/* 11 */}
        <section className="demo-section" id="provider">
          <h2>11. NavProvider + useNavState</h2>
          <p>
            This entire page is already wrapped in <code>&lt;NavProvider&gt;</code>{" "}
            so every navbar/sidebar/dropdown automatically picks up{" "}
            <code>currentPath</code>, <code>renderLink</code>, and user roles
            without having to pass them as props.
          </p>
          <div className="demo-frame" style={{ padding: "1rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            <code>
              {`<NavProvider currentPath={pathname} renderLink={renderLink} userRoles={roles} userPermissions={perms}>`}
            </code>
          </div>
          <CodeBlock code={CODE_11} />
        </section>

        {/* 12 */}
        <section className="demo-section" id="nested-with-country">
          <h2>
            12. Integration: <code>@asafarim/country-language-selector</code>
            <span className="demo-badge">npm</span>
          </h2>
          <p>
            Combines the published <code>CountryLanguageSelector</code> with{" "}
            <code>AppNavbar</code>'s <code>countryLangSelector</code> slot, and a
            nested submenu in <code>navItems</code>.
          </p>
          <div className="demo-frame">
            <AppNavbar
              logo={<Logo />}
              navItems={[
                { id: "home", label: "Home", href: "/" },
                {
                  id: "products",
                  label: "Products",
                  children: [
                    { id: "p-list", label: "All products", href: "/products" },
                    { id: "p-new", label: "Launch", href: "/products/new", badge: "β" },
                  ],
                },
                { id: "pricing", label: "Pricing", href: "/pricing" },
              ]}
              responsiveMode="always-expanded"
              countryLangSelector={<CountryLanguageSelector />}
              themeToggler={<ThemeToggle />}
              actions={
                <AppNavDropdown
                  trigger={<AvatarTrigger />}
                  items={accountDropdownItems}
                  align="end"
                />
              }
              bordered={false}
            />
          </div>
          <CodeBlock code={CODE_12} />
        </section>

      </div>
    </NavProvider>
  );
}

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

function RolePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="demo-pill"
      aria-pressed={active}
      onClick={onClick}
    >
      <span aria-hidden="true">{active ? "✓" : "+"}</span>
      {children}
    </button>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"left" | "right">("left");
  return (
    <>
      <div className="demo-role-bar">
        <button
          type="button"
          className="demo-btn demo-btn--primary"
          onClick={() => setOpen(true)}
        >
          Open drawer
        </button>
        <button
          type="button"
          className="demo-pill"
          aria-pressed={side === "left"}
          onClick={() => setSide("left")}
        >
          left
        </button>
        <button
          type="button"
          className="demo-pill"
          aria-pressed={side === "right"}
          onClick={() => setSide("right")}
        >
          right
        </button>
      </div>
      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        navItems={navItems}
        logo={<Logo />}
        side={side}
        footer={
          <small style={{ color: "var(--text-muted)" }}>
            Demo footer
          </small>
        }
      />
    </>
  );
}

/* Silence unused imports when tree-shaking */
export type _UnusedRef = NavItem;
