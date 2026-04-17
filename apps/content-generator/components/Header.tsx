"use client";

import { Logo } from "./Logo";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";
const repoUrl = "https://github.com/AliSafari-IT/asafarim-digital";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)]/60 bg-[var(--color-surface)]/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <a href="/" className="flex items-center gap-3" aria-label="Content Generator home">
          <Logo size={44} />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "#generator", label: "Generator" },
            { href: "#features", label: "Features" },
            { href: "#prompts", label: "Prompts" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)] sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.94c.58.1.79-.25.79-.56v-2c-3.2.69-3.87-1.37-3.87-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a10.97 10.97 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.12 3.06.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.42.36.79 1.07.79 2.17v3.22c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            GitHub
          </a>
          <a
            href={portalUrl}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-brand)] px-4 py-2 text-xs font-semibold text-[#0d0d0f] shadow-[0_8px_24px_-10px_rgba(58,123,255,0.8)] transition hover:brightness-110"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Portal
          </a>
        </div>
      </div>
    </header>
  );
}
