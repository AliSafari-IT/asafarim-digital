import { Logo } from "./Logo";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 border-t border-[var(--color-border)]/60 bg-[var(--color-surface-elevated)]/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo size={36} />
          <p className="max-w-md text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Part of the ASafariM Digital platform — premium UX, durable backends, and AI
            wired into real products.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <a href={portalUrl} className="transition hover:text-[var(--color-text)]">
            Portal
          </a>
          <a
            href="https://github.com/AliSafari-IT/asafarim-digital"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[var(--color-text)]"
          >
            Monorepo
          </a>
          <span className="opacity-60">© {year} ASafariM</span>
        </div>
      </div>
    </footer>
  );
}
