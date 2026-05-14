import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🧭",
    title: "Navbar",
    desc: "Responsive top bar with logo, nav links, dropdowns, badge counts, and right-side action slots.",
  },
  {
    icon: "📋",
    title: "Sidebar",
    desc: "Vertical sidebar with collapsible rail mode, icons-only state, nested items, and a footer slot.",
  },
  {
    icon: "📲",
    title: "Drawer",
    desc: "Mobile-first slide-in drawer with focus trap, body-scroll lock, and backdrop dismiss.",
  },
  {
    icon: "🔽",
    title: "Dropdown",
    desc: "Standalone dropdown primitive usable anywhere — keyboard navigable and WAI-ARIA compliant.",
  },
  {
    icon: "🔗",
    title: "Router-agnostic",
    desc: "Pass a renderLink adapter once to NavProvider; every component uses it automatically.",
  },
  {
    icon: "🛡️",
    title: "Role-based",
    desc: "Filter items by requiredRoles and permissions with the included filterNavByRoles helper.",
  },
];

const BADGES = [
  { label: "TypeScript" },
  { label: "React 18 / 19" },
  { label: "Zero runtime deps" },
  { label: "WAI-ARIA" },
  { label: "CSS custom props" },
];

export function HomePage() {
  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />

        <div className="hero__content">
          <div className="hero__badges">
            {BADGES.map((b) => (
              <span key={b.label} className="hero__badge">{b.label}</span>
            ))}
          </div>

          <h1 className="hero__title">
            Navigation primitives
            <br />
            <span className="hero__gradient">built for React</span>
          </h1>

          <p className="hero__sub">
            Navbar · Sidebar · Drawer · Dropdown — composable, accessible, and
            completely unstyled by default. Drop them into any React project in
            minutes.
          </p>

          <div className="hero__cta">
            <Link to="/get-started" className="hero__btn hero__btn--primary">
              Get started →
            </Link>
            <Link to="/demo" className="hero__btn hero__btn--ghost">
              View components
            </Link>
            <a
              href="https://www.npmjs.com/package/@asafarim/navigation"
              target="_blank"
              rel="noopener noreferrer"
              className="hero__btn hero__btn--ghost"
            >
              npm ↗
            </a>
          </div>

          <div className="hero__install">
            <span className="hero__install-prompt">$</span>
            <code>npm install @asafarim/navigation</code>
          </div>
        </div>

        {/* decorative floating cards */}
        <div className="hero__cards" aria-hidden="true">
          <div className="hero__card hero__card--1">
            <div className="hero__card-bar hero__card-bar--accent" />
            <div className="hero__card-bar" />
            <div className="hero__card-bar hero__card-bar--short" />
          </div>
          <div className="hero__card hero__card--2">
            <div className="hero__card-icon">🧭</div>
            <div className="hero__card-text">AppNavbar</div>
          </div>
          <div className="hero__card hero__card--3">
            <div className="hero__card-icon">📋</div>
            <div className="hero__card-text">AppSidebar</div>
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────── */}
      <section className="features">
        <h2 className="features__heading">Everything you need for navigation</h2>
        <p className="features__sub">
          Six composable components that cover every navigation pattern — each
          independently usable or wired together through a shared{" "}
          <code>NavProvider</code>.
        </p>
        <div className="features__grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick-look code strip ────────────────────────────── */}
      <section className="quicklook">
        <div className="quicklook__code">
          <div className="quicklook__dots" aria-hidden="true">
            <span /><span /><span />
          </div>
          <pre className="quicklook__pre"><code>{`import { AppNavbar, NavProvider } from "@asafarim/navigation";
import "@asafarim/navigation/styles.css";

function Shell() {
  return (
    <NavProvider currentPath={location.pathname}>
      <AppNavbar
        logo={<Logo />}
        navItems={navItems}
        responsiveMode="always-expanded"
        themeToggler={<ThemeToggle />}
        actions={<UserMenu />}
      />
    </NavProvider>
  );
}`}</code></pre>
        </div>
        <div className="quicklook__aside">
          <h2 className="quicklook__heading">Simple API,<br />powerful results</h2>
          <p className="quicklook__text">
            Pass your items array and slots. The library handles active states,
            keyboard navigation, ARIA roles, responsive collapse, and
            sub-menu rendering for you.
          </p>
          <Link to="/get-started" className="hero__btn hero__btn--primary" style={{ alignSelf: "flex-start" }}>
            Read the guide →
          </Link>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────── */}
      <section className="home-footer-cta">
        <h2>Ready to ship great navigation?</h2>
        <p>Open-source, MIT licensed, and published to npm.</p>
        <div className="hero__cta">
          <Link to="/get-started" className="hero__btn hero__btn--primary">Get started →</Link>
          <Link to="/demo" className="hero__btn hero__btn--ghost">Browse components</Link>
        </div>
      </section>
    </div>
  );
}
