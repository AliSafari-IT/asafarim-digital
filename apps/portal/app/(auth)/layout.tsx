import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="site-noise" />

      <header className="border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-sm font-bold text-white shadow-[var(--shadow-glow)]">
              AD
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                ASafariM Digital
              </span>
              <span className="block text-base font-semibold">Product engineering for AI-native SaaS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-[var(--color-text-muted)] md:flex">
            <Link href="/#capabilities" className="transition hover:text-[var(--color-text)]">
              Capabilities
            </Link>
            <Link href="/#showcase" className="transition hover:text-[var(--color-text)]">
              Work
            </Link>
            <Link href="/#contact" className="transition hover:text-[var(--color-text)]">
              Contact
            </Link>
          </nav>

          <Link
            href="/"
            className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ASafariM Digital</p>
          <p>Secure access for products, demos, and internal tools</p>
        </div>
      </footer>
    </div>
  );
}
