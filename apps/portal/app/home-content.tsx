"use client";

import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ContentMap {
  [section: string]: {
    section: string;
    title: string | null;
    subtitle: string | null;
    eyebrow: string | null;
    body: any;
    metadata: any;
  };
}

export function HomeContent({ content }: { content: ContentMap }) {
  const [isCopied, setIsCopied] = useState(false);

  const hero = content.hero;
  const capabilities = content.capabilities;
  const showcase = content.showcase;
  const process = content.process;
  const stack = content.stack;
  const about = content.about;
  const contact = content.contact;

  const proofPoints: { value: string; label: string }[] = hero?.body?.proofPoints ?? [];
  const capabilityTracks: { title: string; eyebrow: string; description: string; points: string[] }[] = capabilities?.body?.tracks ?? [];
  const showcaseItems: { name: string; label: string; type: string; summary: string; href: string; cta: string; isLive: boolean }[] = showcase?.body?.items ?? [];
  const deliveryPhases: { step: string; title: string; summary: string }[] = process?.body?.phases ?? [];
  const stackGroups: { title: string; items: string[] }[] = stack?.body?.groups ?? [];
  const contactCtas: { label: string; href?: string; action?: string }[] = contact?.body?.ctas ?? [];
  const contactEmail: string = contact?.body?.email ?? "info@asafarim.com";

  const deliverySnapshot = hero?.metadata?.deliverySnapshot;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      <div aria-hidden="true" className="site-noise" />
      <SiteHeader />

      <main id="top" className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 sm:pt-14 lg:pt-16">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="relative">
            {hero?.eyebrow && (
              <div className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                {hero.eyebrow}
              </div>
            )}
            {hero?.title && (
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                {hero.title}
              </h1>
            )}
            {hero?.subtitle && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)] sm:text-xl">
                {hero.subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {hero?.body?.ctaPrimary && (
                <a
                  href={hero.body.ctaPrimary.href}
                  className="rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  {hero.body.ctaPrimary.label}
                </a>
              )}
              {hero?.body?.ctaSecondary && (
                <a
                  href={hero.body.ctaSecondary.href}
                  className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
                >
                  {hero.body.ctaSecondary.label}
                </a>
              )}
            </div>

            {proofPoints.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofPoints.map((item) => (
                  <div key={item.value} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                    <div className="font-mono text-2xl font-semibold text-[var(--color-text)]">{item.value}</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {deliverySnapshot && (
            <aside className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-6 shadow-[var(--shadow-card)] sm:p-8">
              <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-accent),transparent)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Delivery Snapshot
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{deliverySnapshot.title}</h2>
                </div>
                {deliverySnapshot.badge && (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    {deliverySnapshot.badge}
                  </span>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  <span>Project model</span>
                  <span>{deliverySnapshot.projectModel}</span>
                </div>
                {deliverySnapshot.cards && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {deliverySnapshot.cards.map((card: { label: string; text: string }) => (
                      <div key={card.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{card.label}</p>
                        <p className="mt-3 text-lg font-semibold">{card.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {deliverySnapshot.codePreview && (
                <div className="mt-5 rounded-3xl border border-[var(--color-border)] bg-[#081120] p-5 text-sm text-slate-200">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-200/70">stack.preview.ts</div>
                  <pre className="mt-4 overflow-x-auto font-mono text-[13px] leading-6 text-sky-100">
                    {deliverySnapshot.codePreview}
                  </pre>
                </div>
              )}
            </aside>
          )}
        </section>

        {/* Capabilities */}
        {capabilities && (
          <section id="capabilities" className="mt-24 scroll-mt-28">
            <div className="max-w-3xl">
              {capabilities.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{capabilities.eyebrow}</p>}
              {capabilities.title && <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{capabilities.title}</h2>}
              {capabilities.subtitle && <p className="mt-5 text-lg leading-8 text-[var(--color-text-muted)]">{capabilities.subtitle}</p>}
            </div>
            {capabilityTracks.length > 0 && (
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
            )}
          </section>
        )}

        {/* Showcase */}
        {showcase && (
          <section id="showcase" className="mt-24 scroll-mt-28">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                {showcase.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{showcase.eyebrow}</p>}
                {showcase.title && <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{showcase.title}</h2>}
              </div>
              {showcase.subtitle && <p className="max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">{showcase.subtitle}</p>}
            </div>
            {showcaseItems.length > 0 && (
              <div className="mt-10 grid gap-5 xl:grid-cols-3">
                {showcaseItems.map((item, index) => (
                  <a key={item.name} href={item.href} className="group overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] transition hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card)]">
                    <div className="relative overflow-hidden border-b border-[var(--color-border)] bg-[linear-gradient(135deg,#0b1324,#10203f)] p-6">
                      <img src={`/brand/showcase-${index + 1}.svg`} alt={`${item.name} interface preview`} className="h-44 w-full rounded-2xl border border-white/10 object-cover" />
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/75">{item.label}</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.isLive ? "bg-emerald-400/10 text-emerald-300" : "bg-white/8 text-slate-300"}`}>
                          {item.isLive ? "Live" : "Concept"}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold tracking-[-0.03em]">{item.name}</h3>
                      <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">{item.type}</p>
                      <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">{item.summary}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                        {item.cta}<span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Process */}
        {process && (
          <section id="process" className="mt-24 scroll-mt-28 grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-8">
              {process.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{process.eyebrow}</p>}
              {process.title && <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{process.title}</h2>}
              {process.subtitle && <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">{process.subtitle}</p>}
            </div>
            {deliveryPhases.length > 0 && (
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
            )}
          </section>
        )}

        {/* Stack */}
        {stack && (
          <section id="stack" className="mt-24 scroll-mt-28">
            {stack.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{stack.eyebrow}</p>}
            {stack.title && <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{stack.title}</h2>}
            {stackGroups.length > 0 && (
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
            )}
          </section>
        )}

        {/* About + Contact */}
        <section className="mt-24 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          {about && (
            <article className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-8">
              {about.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{about.eyebrow}</p>}
              {about.title && <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{about.title}</h2>}
              {about.subtitle && <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">{about.subtitle}</p>}
            </article>
          )}

          {contact && (
            <article id="contact" className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[linear-gradient(135deg,var(--color-panel-strong),var(--color-panel))] p-8 shadow-[var(--shadow-card)]">
              {contact.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{contact.eyebrow}</p>}
              {contact.title && <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{contact.title}</h2>}
              {contact.subtitle && <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">{contact.subtitle}</p>}

              <div className="mt-8 flex flex-wrap gap-4">
                {contactCtas.map((cta) =>
                  cta.action === "copy_email" ? (
                    <button
                      key={cta.label}
                      type="button"
                      onClick={handleCopyEmail}
                      className={`rounded-full px-6 py-3.5 text-sm font-semibold text-white transition ${
                        isCopied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                      }`}
                    >
                      {isCopied ? "Email copied" : cta.label}
                    </button>
                  ) : (
                    <a
                      key={cta.label}
                      href={cta.href}
                      className="rounded-full border border-[var(--color-border-strong)] px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
                    >
                      {cta.label}
                    </a>
                  )
                )}
              </div>
            </article>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
