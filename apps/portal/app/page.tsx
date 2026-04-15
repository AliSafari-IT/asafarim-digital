"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type Theme = "dark" | "light";

const proofPoints = [
  { value: "4-12", label: "week delivery window for MVP-to-v1 builds" },
  { value: "3 layers", label: "frontend, backend, and AI workflow ownership" },
  { value: "1 partner", label: "strategy, implementation, and launch support" },
];

const capabilityTracks = [
  {
    title: "Frontend Systems",
    eyebrow: "Interface quality",
    description:
      "Design-forward product interfaces with structured information flow, polished interactions, and conversion-aware UX.",
    points: ["Next.js App Router", "Design systems", "Product landing pages", "Dashboard UX"],
  },
  {
    title: "Backend Platforms",
    eyebrow: "Architecture depth",
    description:
      "Service boundaries, data modeling, secure auth flows, observability, and delivery patterns that hold up after launch.",
    points: ["TypeScript APIs", "C#/.NET services", "PostgreSQL", "Queues + automation"],
  },
  {
    title: "AI Product Layers",
    eyebrow: "Applied intelligence",
    description:
      "Production-focused agent flows, retrieval pipelines, and operational tooling that support real teams instead of demos.",
    points: ["RAG pipelines", "Tool-enabled agents", "Workflow orchestration", "Content automation"],
  },
];

const deliveryPhases = [
  {
    step: "01",
    title: "Strategy + scoping",
    summary: "Define the revenue path, product surface, system boundaries, and delivery constraints before code expands.",
  },
  {
    step: "02",
    title: "Interface + architecture",
    summary: "Shape the product experience and data flow together so the UI and backend reinforce each other.",
  },
  {
    step: "03",
    title: "Build + operationalize",
    summary: "Ship the app, instrument it, and leave behind a maintainable platform instead of a fragile launch artifact.",
  },
];

const showcases = [
  {
    name: "Content Generator",
    label: "Live product",
    type: "AI writing workspace",
    summary:
      "Prompt-driven content production with clean UI states, reusable generation flows, and an application shell ready for expansion.",
    href: "/showcase/content-generator",
    cta: "Open app",
    isLive: true,
  },
  {
    name: "SaaS Operations Hub",
    label: "Backend-heavy concept",
    type: "Admin analytics + lifecycle controls",
    summary:
      "Billing, feature access, metrics, and workflow controls designed as one operator surface rather than disconnected tools.",
    href: "#contact",
    cta: "Discuss build",
    isLive: false,
  },
  {
    name: "Marketing + Content Engine",
    label: "Growth system",
    type: "Website, SEO, and lead automation",
    summary:
      "A conversion-oriented marketing system combining front-end polish, structured content, and automated acquisition workflows.",
    href: "#contact",
    cta: "Request similar system",
    isLive: false,
  },
];

const stackGroups = [
  {
    title: "Frontend",
    items: ["Next.js App Router", "TypeScript", "Tailwind CSS", "Conversion-focused UI systems"],
  },
  {
    title: "Backend",
    items: ["Node.js services", "C# / .NET microservices", "PostgreSQL", "Authentication + multi-tenant patterns"],
  },
  {
    title: "AI + Ops",
    items: ["RAG pipelines", "Agent orchestration", "Workflow automation", "Operational tooling"],
  },
];

function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-border)]" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-primary)]"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="rounded-full"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[140px] truncate sm:block">{session.user.name ?? session.user.email}</span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[var(--color-text-muted)]" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[220px] rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-2 shadow-[var(--shadow-card)]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
            <p className="text-sm font-semibold">{session.user.name ?? "User"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{session.user.email}</p>
            {session.user.role && (
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                {session.user.role}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await signOut({ callbackUrl: "/" });
              } catch (error) {
                console.error("Sign out error:", error);
                // Fallback: manually redirect to home
                window.location.href = "/";
              }
            }}
            className="mt-2 w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-panel)]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 3v2.5M12 18.5V21M4.64 4.64l1.77 1.77M17.59 17.59l1.77 1.77M3 12h2.5M18.5 12H21M4.64 19.36l1.77-1.77M17.59 6.41l1.77-1.77M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export default function PortalHome() {
  const [isCopied, setIsCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("asafarim-theme") as Theme | null;
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const resolvedTheme: Theme = storedTheme ?? (systemPrefersLight ? "light" : "dark");

    setTheme(resolvedTheme);
    document.documentElement.dataset.theme = resolvedTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("asafarim-theme", nextTheme);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("info@asafarim.com");
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      <div aria-hidden="true" className="site-noise" />

      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <a href="#top" className="flex items-center gap-4" aria-label="Back to top">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-sm font-bold text-white shadow-[var(--shadow-glow)]">
              AD
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.08em] uppercase text-[var(--color-text-muted)]">
                ASafariM Digital
              </span>
              <span className="block text-base font-semibold">Product engineering for AI-native SaaS</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-[var(--color-text-muted)] lg:flex">
            <a href="#capabilities" className="transition hover:text-[var(--color-text)]">
              Capabilities
            </a>
            <a href="#showcase" className="transition hover:text-[var(--color-text)]">
              Work
            </a>
            <a href="#process" className="transition hover:text-[var(--color-text)]">
              Process
            </a>
            <a href="#stack" className="transition hover:text-[var(--color-text)]">
              Stack
            </a>
            <a href="#contact" className="transition hover:text-[var(--color-text)]">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <UserMenu />
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 sm:pt-14 lg:pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="relative">
            <div className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Backend rigor. Frontend polish. AI-ready systems.
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              I build software that looks premium on the surface and stays reliable underneath it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)] sm:text-xl">
              I help founders and teams ship credible SaaS products with strong UX, disciplined backend architecture, and
              AI workflows that solve operational problems instead of adding complexity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Start a build conversation
              </a>
              <a
                href="#showcase"
                className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
              >
                Review selected work
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proofPoints.map((item) => (
                <div key={item.value} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                  <div className="font-mono text-2xl font-semibold text-[var(--color-text)]">{item.value}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-accent),transparent)]" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  Delivery Snapshot
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Architecture that sells and scales</h2>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Shipping now
              </span>
            </div>

            <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                <span>Project model</span>
                <span>Single-owner execution</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Frontend</p>
                  <p className="mt-3 text-lg font-semibold">Intentional layout, motion, and content hierarchy</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Backend</p>
                  <p className="mt-3 text-lg font-semibold">Auth, data models, APIs, queues, and maintainable service seams</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-[var(--color-border)] bg-[#081120] p-5 text-sm text-slate-200">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-200/70">stack.preview.ts</div>
              <pre className="mt-4 overflow-x-auto font-mono text-[13px] leading-6 text-sky-100">
{`export const productSystem = {
  frontend: ["Next.js", "TypeScript", "Design systems"],
  backend: ["Node.js", ".NET", "PostgreSQL"],
  intelligence: ["Agents", "RAG", "Automation"],
  outcome: "launch-ready SaaS with operational depth"
};`}
              </pre>
            </div>
          </aside>
        </section>

        <section id="capabilities" className="mt-24 scroll-mt-28">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Capabilities</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              The site now needs to prove expertise, not just mention it.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--color-text-muted)]">
              The strongest signal for your business is not a long tool list. It is showing that you can shape product
              experience, data architecture, and automation as one coherent system.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {capabilityTracks.map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-7 transition hover:-translate-y-1 hover:border-[var(--color-border-strong)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{item.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">{item.description}</p>
                <ul className="mt-6 space-y-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="showcase" className="mt-24 scroll-mt-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Selected Work</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Products that connect UX ambition to system design</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
              These cards are positioned as product systems, not generic portfolio tiles. That reads as more senior and more credible.
            </p>
          </div>

          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {showcases.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="group overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] transition hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative overflow-hidden border-b border-[var(--color-border)] bg-[linear-gradient(135deg,#0b1324,#10203f)] p-6">
                  <img
                    src={`/brand/showcase-${index + 1}.svg`}
                    alt={`${item.name} interface preview`}
                    className="h-44 w-full rounded-2xl border border-white/10 object-cover"
                  />
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/75">{item.label}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        item.isLive ? "bg-emerald-400/10 text-emerald-300" : "bg-white/8 text-slate-300"
                      }`}
                    >
                      {item.isLive ? "Live" : "Concept"}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{item.name}</h3>
                  <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">{item.type}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">{item.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                    {item.cta}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="process" className="mt-24 scroll-mt-28 grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Working Style</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Hands-on from product framing to deployment</h2>
            <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">
              You are selling senior execution. The layout now emphasizes judgment, sequencing, and ownership instead of just listing services.
            </p>
          </div>

          <div className="grid gap-4">
            {deliveryPhases.map((item) => (
              <article key={item.step} className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-primary)]">{item.step}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="stack" className="mt-24 scroll-mt-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Technology Stack</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Depth across interface, infrastructure, and AI delivery</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {stackGroups.map((group) => (
              <article key={group.title} className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
                <h3 className="text-xl font-semibold">{group.title}</h3>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">About</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">I work at the intersection of product taste and engineering discipline.</h2>
            <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">
              My focus is building software that helps a business move: clearer positioning, cleaner interfaces, stronger backend foundations,
              and automation that reduces manual load. That balance is what makes a solo technical partner valuable.
            </p>
          </article>

          <article id="contact" className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[linear-gradient(135deg,var(--color-panel-strong),var(--color-panel))] p-8 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Contact</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Need a serious technical partner for your next SaaS product?</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
              Let&apos;s scope the product, architecture, and build sequence with the end-state in mind from day one.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleCopyEmail}
                className={`rounded-full px-6 py-3.5 text-sm font-semibold text-white transition ${
                  isCopied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                }`}
              >
                {isCopied ? "Email copied" : "Copy email address"}
              </button>
              <a
                href="mailto:info@asafarim.com"
                className="rounded-full border border-[var(--color-border-strong)] px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
              >
                Open mail client
              </a>
              <a
                href="https://github.com/AliSafari-IT/asafarim-digital"
                className="rounded-full border border-[var(--color-border-strong)] px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
              >
                View monorepo
              </a>
            </div>
          </article>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ASafariM Digital</p>
          <p>Premium SaaS delivery across frontend, backend, and AI systems</p>
        </div>
      </footer>
    </div>
  );
}
