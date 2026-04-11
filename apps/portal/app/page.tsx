'use client';

import { useState } from "react";

const services = [
  {
    title: "End-to-End SaaS Development",
    description:
      "From product discovery to release-ready platforms, I build scalable SaaS products with strong UX and clean architecture.",
  },
  {
    title: "AI Agents, RAG & Automation",
    description:
      "I design practical AI workflows with retrieval, tools, and orchestration to automate support, operations, and internal processes.",
  },
  {
    title: "Cloud-Ready API Systems",
    description:
      "Robust TypeScript and C#/.NET services with observability, queue-driven workflows, and secure multi-tenant design.",
  },
];

const showcases = [
  {
    name: "AI Studio",
    type: "Prompting, evaluation, and model routing",
    summary:
      "An internal workspace for creating AI assistants, testing prompts, and shipping reusable agent workflows.",
  },
  {
    name: "SaaS Operations Hub",
    type: "Admin analytics and automations",
    summary:
      "A management dashboard for billing, feature flags, user lifecycle insights, and workflow automation control.",
  },
  {
    name: "Marketing + Content Engine",
    type: "SEO pages, blog pipeline, and lead flows",
    summary:
      "A conversion-focused website stack with structured content generation, lead qualification, and campaign automation.",
  },
];

const stack = [
  "Next.js 16 (App Router)",
  "TypeScript",
  "PostgreSQL",
  "C# / .NET microservices",
  "AI agents & RAG pipelines",
  "Workflow automation",
];

export default function PortalHome() {
  const [isCopied, setIsCopied] = useState(false);

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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(58,123,255,0.2),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(79,242,201,0.18),transparent_30%)]"
      />

      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3" aria-label="Back to top">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">
              AD
            </span>
            <span>
              <span className="block text-sm font-semibold">asafarim-digital</span>
              <span className="block text-xs text-[var(--color-text-secondary)]">
                AI-Empowered SaaS & Web Innovation
              </span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
            <a href="#services" className="transition hover:text-[var(--color-primary)]">
              Services
            </a>
            <a href="#showcase" className="transition hover:text-[var(--color-primary)]">
              SaaS Showcase
            </a>
            <a href="#stack" className="transition hover:text-[var(--color-primary)]">
              Tech Stack
            </a>
            <a href="#about" className="transition hover:text-[var(--color-primary)]">
              About
            </a>
          </nav>

          <a
            href="#contact"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            Book a Call
          </a>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-7xl px-6 pb-16 pt-12 sm:pt-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
              AI-Empowered Digital Craftsmanship
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Building premium AI-powered SaaS products with speed, clarity, and long-term architecture.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              I&apos;m Ali, full-stack developer and AI SaaS architect behind <strong>asafarim-digital</strong>. I help founders and teams ship
              future-ready products with Next.js, TypeScript, PostgreSQL, C# microservices, and intelligent AI workflows.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Start Your Project
              </a>
              <a
                href="#showcase"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--color-primary)]"
              >
                Explore SaaS Work
              </a>
            </div>
          </div>

          <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-card)] sm:p-8" aria-label="Highlighted outcomes">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Results-focused delivery</h2>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Typical Build Window</dt>
                <dd className="mt-1 text-2xl font-semibold">4-12 Weeks</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Architecture Focus</dt>
                <dd className="mt-1 text-base font-medium">Scalable, AI-ready, and maintainable by design</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Engagement Style</dt>
                <dd className="mt-1 text-base font-medium">Hands-on partner from strategy to deployment</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section id="services" className="mt-20 scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="mt-3 max-w-3xl text-[var(--color-text-secondary)]">
            Practical engineering and architecture support for teams building serious products with AI.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {services.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="showcase" className="mt-20 scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight">AI-Powered SaaS Showcase</h2>
          <p className="mt-3 max-w-3xl text-[var(--color-text-secondary)]">
            Selected products and systems from the asafarim-digital monorepo ecosystem.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {showcases.map((item, index) => (
              <article key={item.name} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                <img
                  src={`/brand/showcase-${index + 1}.svg`}
                  alt={`${item.name} visual placeholder`}
                  className="h-36 w-full object-cover"
                />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">Project 0{index + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">{item.type}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="stack" className="mt-20 scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight">Tech Stack Expertise</h2>
          <p className="mt-3 max-w-3xl text-[var(--color-text-secondary)]">
            Built for modern AI-driven delivery across frontend, backend, infrastructure, and automation.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Technology stack list">
            {stack.map((item) => (
              <li key={item} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm font-medium">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="about" className="mt-20 scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 sm:p-10">
          <h2 className="text-3xl font-bold tracking-tight">About Ali</h2>
          <p className="mt-4 max-w-4xl text-[var(--color-text-secondary)]">
            I&apos;m a full-stack developer and AI SaaS architect focused on shipping high-impact digital products. My approach blends
            product strategy, conversion-focused UX, and deep engineering across Next.js + TypeScript, PostgreSQL, C#/.NET
            microservices, and AI systems such as retrieval-augmented generation, tool-enabled agents, and operational automation.
          </p>
        </section>

        <section id="contact" className="mt-20 scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 sm:p-10">
          <h2 className="text-3xl font-bold tracking-tight">Let&apos;s Build Your Next SaaS Product</h2>
          <p className="mt-4 max-w-3xl text-[var(--color-text-secondary)]">
            Need a reliable technical partner for an AI-first product? Let&apos;s plan architecture, scope milestones, and turn your idea
            into a launch-ready platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleCopyEmail}
              className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${
                isCopied
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
              }`}
            >
              {isCopied ? "Email copied!" : "Copy Email Address"}
            </button>
            <a
              href="mailto:info@asafarim.com"
              className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--color-primary)]"
            >
              Open in Mail Client
            </a>
            <a
              href="https://github.com/AliSafari-IT/asafarim-digital"
              className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--color-primary)]"
            >
              View Monorepo
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} asafarim-digital</p>
          <p>AI-Empowered SaaS & Web Innovation</p>
        </div>
      </footer>
    </div>
  );
}
