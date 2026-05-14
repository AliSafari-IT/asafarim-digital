import { useState } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "./widgets";

type PM = "npm" | "pnpm" | "yarn";

const INSTALL: Record<PM, string> = {
  npm: "npm install @asafarim/navigation",
  pnpm: "pnpm add @asafarim/navigation",
  yarn: "yarn add @asafarim/navigation",
};

const STEPS = [
  {
    n: "1",
    title: "Install the package",
    content: <InstallStep />,
  },
  {
    n: "2",
    title: "Import the stylesheet",
    content: (
      <CodeBlock code={`// In your root entry file (e.g. main.tsx / index.tsx)
import "@asafarim/navigation/styles.css";`} />
    ),
  },
  {
    n: "3",
    title: "Wrap your app in NavProvider",
    content: (
      <CodeBlock code={`import { NavProvider } from "@asafarim/navigation";

// currentPath drives the active-item highlight automatically
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider currentPath={window.location.pathname}>
      {children}
    </NavProvider>
  );
}`} />
    ),
  },
  {
    n: "4",
    title: "Add a Navbar",
    content: (
      <CodeBlock code={`import { AppNavbar } from "@asafarim/navigation";
import type { NavItem } from "@asafarim/navigation";

const navItems: NavItem[] = [
  { id: "home",     label: "Home",     href: "/" },
  { id: "docs",     label: "Docs",     href: "/docs" },
  { id: "settings", label: "Settings", href: "/settings", shortcut: "⌘," },
];

export function Header() {
  return (
    <AppNavbar
      logo={<span>MyApp</span>}
      navItems={navItems}
      responsiveMode="always-expanded"
    />
  );
}`} />
    ),
  },
  {
    n: "5",
    title: "Use with React Router",
    content: (
      <CodeBlock code={`import { Link, useLocation } from "react-router-dom";
import { NavProvider, AppNavbar, type RenderLink } from "@asafarim/navigation";

// Pass a renderLink adapter so every nav link uses <Link> instead of <a>
const renderLink: RenderLink = ({ item, children }) => (
  <Link to={item.href ?? "/"}>{children}</Link>
);

export function Shell() {
  const { pathname } = useLocation();
  return (
    <NavProvider currentPath={pathname} renderLink={renderLink}>
      <AppNavbar logo={<span>MyApp</span>} navItems={navItems} />
    </NavProvider>
  );
}`} />
    ),
  },
];

function InstallStep() {
  const [pm, setPm] = useState<PM>("pnpm");
  return (
    <div className="gs-install">
      <div className="gs-tabs" role="tablist" aria-label="Package manager">
        {(["npm", "pnpm", "yarn"] as PM[]).map((p) => (
          <button
            key={p}
            role="tab"
            type="button"
            aria-selected={pm === p}
            className={`gs-tab${pm === p ? " gs-tab--active" : ""}`}
            onClick={() => setPm(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="gs-install-cmd">
        <span className="hero__install-prompt">$</span>
        <code>{INSTALL[pm]}</code>
        <CopyBtn text={INSTALL[pm]} />
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="gs-copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

const API_ROWS = [
  ["logo", "ReactNode", "—", "Rendered in the left slot of the navbar"],
  ["navItems", "NavItem[]", "[]", "The navigation tree (supports nesting)"],
  ["responsiveMode", '"always-expanded" | "hamburger" | "auto"', '"auto"', "Controls when the hamburger collapses items"],
  ["themeToggler", "ReactNode", "—", "Slot for a theme-toggle button"],
  ["actions", "ReactNode", "—", "Right-side slot (avatar, notifications…)"],
  ["countryLangSelector", "ReactNode", "—", "Country / language picker slot"],
  ["renderItem", "fn", "—", "Replace the default item renderer entirely"],
  ["bordered", "boolean", "true", "Show a bottom border on the bar"],
];

export function GetStartedPage() {
  return (
    <div className="gs-page">
      <div className="gs-hero">
        <span className="gs-hero__label">Documentation</span>
        <h1 className="gs-hero__title">Get Started</h1>
        <p className="gs-hero__sub">
          Add fully-accessible navigation to your React app in under five
          minutes.
        </p>
      </div>

      {/* Steps */}
      <section className="gs-steps">
        {STEPS.map((s) => (
          <div key={s.n} className="gs-step">
            <div className="gs-step__num" aria-hidden="true">{s.n}</div>
            <div className="gs-step__body">
              <h2 className="gs-step__title">{s.title}</h2>
              {s.content}
            </div>
          </div>
        ))}
      </section>

      {/* API reference */}
      <section className="gs-api">
        <h2 className="gs-api__heading">AppNavbar props</h2>
        <div className="gs-table-wrap">
          <table className="gs-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {API_ROWS.map(([prop, type, def, desc]) => (
                <tr key={prop}>
                  <td><code>{prop}</code></td>
                  <td><code className="gs-table__type">{type}</code></td>
                  <td><code>{def}</code></td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* NavItem shape */}
      <section className="gs-api" style={{ marginTop: "2rem" }}>
        <h2 className="gs-api__heading">NavItem shape</h2>
        <CodeBlock code={`interface NavItem {
  id:            string;
  label:         string;
  href?:         string;
  icon?:         ReactNode;
  badge?:        string | number;
  shortcut?:     string;
  description?:  string;
  external?:     boolean;
  disabled?:     boolean;
  requiredRoles?:    string[];
  permissions?:      string[];
  children?:     NavItem[];   // nested sub-menu
  onClick?:      () => void;
}`} />
      </section>

      {/* Next steps */}
      <section className="gs-next">
        <h2>What's next?</h2>
        <div className="gs-next__grid">
          <Link to="/demo" className="gs-next__card">
            <span className="gs-next__icon">🧩</span>
            <strong>Browse all components</strong>
            <span>See live examples of every component with copy-able code.</span>
          </Link>
          <a
            href="https://github.com/AliSafari-IT/navigation"
            target="_blank"
            rel="noopener noreferrer"
            className="gs-next__card"
          >
            <span className="gs-next__icon">⭐</span>
            <strong>Star on GitHub</strong>
            <span>Follow development, open issues, or contribute a PR.</span>
          </a>
          <a
            href="https://www.npmjs.com/package/@asafarim/navigation"
            target="_blank"
            rel="noopener noreferrer"
            className="gs-next__card"
          >
            <span className="gs-next__icon">📦</span>
            <strong>View on npm</strong>
            <span>Check version history, download stats, and the full changelog.</span>
          </a>
        </div>
      </section>
    </div>
  );
}
