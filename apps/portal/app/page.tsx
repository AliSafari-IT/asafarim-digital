import { StatusBadge } from "@/components/status-badge";
import { AppCard } from "@/components/app-card";
import { QuickLink } from "@/components/quick-link";

const apps = [
  {
    name: "SaaS App",
    description: "Main product application",
    href: "/apps/saas",
    status: "coming-soon" as const,
    icon: "rocket",
  },
  {
    name: "AI Studio",
    description: "Prompt playground, models & agents",
    href: "/apps/ai-studio",
    status: "coming-soon" as const,
    icon: "brain",
  },
  {
    name: "Admin Console",
    description: "Platform management & monitoring",
    href: "/apps/admin",
    status: "coming-soon" as const,
    icon: "shield",
  },
  {
    name: "Marketing Site",
    description: "Public-facing website & blog",
    href: "/apps/marketing",
    status: "coming-soon" as const,
    icon: "globe",
  },
];

const quickLinks = [
  { label: "API Docs", href: "/docs/api", icon: "book" },
  { label: "GitHub", href: "https://github.com/AliSafari-IT/asafarim-digital", icon: "code" },
  { label: "Status", href: "/status", icon: "activity" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

const services = [
  { name: "API Gateway", status: "operational" as const },
  { name: "Identity Service", status: "operational" as const },
  { name: "AI Service", status: "coming-soon" as const },
  { name: "Billing Service", status: "coming-soon" as const },
  { name: "Event Bus", status: "coming-soon" as const },
];

export default function PortalHome() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
              AS
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                ASafariM Digital
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Developer Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium dark:bg-amber-900/30 dark:text-amber-400">
              QA Environment
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to the Portal
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl">
            Your central hub for the ASafariM Digital ecosystem. Access
            applications, monitor services, and explore the API.
          </p>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <QuickLink key={link.label} {...link} />
            ))}
          </div>
        </section>

        {/* Apps Grid */}
        <section className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
            Applications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {apps.map((app) => (
              <AppCard key={app.name} {...app} />
            ))}
          </div>
        </section>

        {/* Services Status */}
        <section className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
            Platform Services
          </h3>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
            <div className="divide-y divide-[var(--color-border)]">
              {services.map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <span className="font-medium text-sm">{svc.name}</span>
                  <StatusBadge status={svc.status} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Environment Info */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
            Environment
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[var(--color-text-secondary)]">Env</p>
              <p className="font-mono font-medium">QA</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Region</p>
              <p className="font-mono font-medium">Hostinger VPS</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Version</p>
              <p className="font-mono font-medium">0.1.0</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Domain</p>
              <p className="font-mono font-medium">portal-qa.asafarim.com</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-16">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <p>&copy; {new Date().getFullYear()} ASafariM Digital</p>
          <p>
            Built with Next.js + Turborepo
          </p>
        </div>
      </footer>
    </div>
  );
}
