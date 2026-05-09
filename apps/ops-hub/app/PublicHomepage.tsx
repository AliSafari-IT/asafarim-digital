"use client";

import { useState } from "react";
import {
  Activity,
  Shield,
  Users,
  CreditCard,
  Flag,
  History,
  Zap,
  ArrowRight,
  CheckCircle,
  Lock,
  Server,
  BarChart3,
} from "lucide-react";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";
const currentAppUrl = process.env.NEXT_PUBLIC_OPS_HUB_URL || "http://localhost:3003";

const features = [
  {
    icon: Activity,
    title: "Tenant Monitoring",
    description: "Track tenant health, status, and lifecycle from trial to churn. Spot at-risk accounts before they leave.",
    accent: "from-indigo-500 to-cyan-400",
  },
  {
    icon: CreditCard,
    title: "Billing Visibility",
    description: "Monitor MRR, subscriptions, invoices, and payment status. Connect to Stripe for real-time revenue data.",
    accent: "from-cyan-400 to-emerald-400",
  },
  {
    icon: Users,
    title: "User Lifecycle",
    description: "Track user onboarding, activity, and churn. Understand how customers move through your product.",
    accent: "from-emerald-400 to-amber-400",
  },
  {
    icon: Flag,
    title: "Feature Flags",
    description: "Control rollouts, kill switches, and tenant-specific overrides. Manage risk during deployments.",
    accent: "from-amber-400 to-rose-400",
  },
  {
    icon: Zap,
    title: "Automation Monitoring",
    description: "Watch automation health, track runs, and review failures. Ensure operational jobs run smoothly.",
    accent: "from-rose-400 to-violet-400",
  },
  {
    icon: History,
    title: "Audit History",
    description: "Immutable log of operator actions. Know who changed what, when, and why across all operations.",
    accent: "from-violet-400 to-indigo-500",
  },
];

const capabilities = [
  { title: "Churn Risk Detection", description: "AI-assisted risk signals" },
  { title: "Revenue Analytics", description: "MRR, ARR, plan mix" },
  { title: "Subscription Health", description: "Status and renewal tracking" },
  { title: "Invoice Management", description: "Open, paid, and past-due" },
  { title: "Usage Metrics", description: "Weekly and monthly rollups" },
  { title: "System Health", description: "Service status and alerts" },
];

export function PublicHomepage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const signInUrl = `${portalUrl}/sign-in?callbackUrl=${encodeURIComponent(currentAppUrl + "/")}`;
  const registerUrl = `${portalUrl}/sign-up?callbackUrl=${encodeURIComponent(currentAppUrl + "/")}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      {/* Background gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.12),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(168,85,247,0.10),transparent_40%)]"
      />

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-16 sm:pt-24">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            SaaS Operations Console
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            The control room for your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              SaaS business
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            Monitor tenants, track revenue, manage rollouts, and run operations from one console. 
            Built for operators who need answers fast.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={signInUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              <Lock className="h-4 w-4" />
              Sign In to Console
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={portalUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-6 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)]"
            >
              Return to Portal
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
            <Shield className="h-3 w-3" />
            <span>Protected operator access required</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-20 w-full max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          Everything an operator needs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div
                className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${feature.accent} opacity-80`}
              />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface)]">
                <feature.icon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          Operational capabilities
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 transition hover:border-[var(--color-primary)]"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold">{cap.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Protected Section */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10">
              <Lock className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Why is sign-in required?
            </h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">
              Ops Hub contains sensitive business, customer, billing, and operational data. 
              Access is restricted to authorized operators with proper permissions.
            </p>

            <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h3 className="text-sm font-semibold">Protected Data</h3>
                <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <li>• Tenant business information</li>
                  <li>• Revenue and billing data</li>
                  <li>• User and customer records</li>
                  <li>• Feature flag configurations</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h3 className="text-sm font-semibold">Required Roles</h3>
                <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <li>• ops_viewer — Read-only access</li>
                  <li>• ops_admin — Full console access</li>
                  <li>• superadmin — All permissions</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={registerUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
              >
                Request Access
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-16 w-full max-w-7xl px-6 pb-16">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Part of the ASafariM Portal ecosystem
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <a href={portalUrl} className="hover:text-[var(--color-text)]">
              Portal
            </a>
            <span>·</span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Operator Console
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
