"use client";

import { useState } from "react";
import {
  Megaphone,
  Calendar,
  Search,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Lock,
  Layout,
  FileText,
  TrendingUp,
} from "lucide-react";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";
const currentAppUrl = process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL || "http://localhost:3004";

const features = [
  {
    icon: Megaphone,
    title: "Campaign Planning",
    description: "Plan and track marketing campaigns from ideation to launch. Coordinate messaging, channels, and timelines.",
    accent: "from-purple-500 to-pink-400",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Organize content work across channels. Schedule blog posts, social media, email sequences, and more.",
    accent: "from-pink-400 to-rose-400",
  },
  {
    icon: Search,
    title: "SEO Visibility",
    description: "Track keyword opportunities, content gaps, and search performance. Build data-driven SEO roadmaps.",
    accent: "from-rose-400 to-orange-400",
  },
  {
    icon: Target,
    title: "Lead Tracking",
    description: "Monitor lead flow from campaigns. Track conversion rates, pipeline velocity, and attribution.",
    accent: "from-orange-400 to-amber-400",
  },
  {
    icon: Zap,
    title: "Automation Monitoring",
    description: "Watch marketing automations, email sequences, and nurture flows. Identify and fix dropped leads.",
    accent: "from-amber-400 to-yellow-400",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Review campaign ROI, content engagement, and growth metrics. Make data-driven decisions.",
    accent: "from-yellow-400 to-green-400",
  },
];

const capabilities = [
  { title: "Campaign Roadmaps", description: "Visual planning tools" },
  { title: "Content Scheduling", description: "Multi-channel calendar" },
  { title: "Keyword Tracking", description: "SEO opportunity monitoring" },
  { title: "Lead Attribution", description: "Source-to-revenue tracking" },
  { title: "Automation Health", description: "Flow monitoring and alerts" },
  { title: "Growth Dashboards", description: "KPIs and performance trends" },
];

const useCases = [
  {
    title: "Launch Campaign Planning",
    description: "Coordinate messaging, assets, and channels for product launches and seasonal campaigns.",
  },
  {
    title: "Weekly Content Calendar",
    description: "Plan and schedule blog posts, social content, and email newsletters in one place.",
  },
  {
    title: "SEO Content Backlog",
    description: "Track keyword opportunities and prioritize content that drives organic growth.",
  },
  {
    title: "Lead Follow-up Workflow",
    description: "Monitor lead handoffs from marketing to sales and ensure no prospects fall through cracks.",
  },
  {
    title: "Campaign Performance Review",
    description: "Analyze campaign results, ROI, and engagement to refine strategy for future initiatives.",
  },
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
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.12),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(251,191,36,0.10),transparent_40%)]"
      />

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-16 sm:pt-24">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Growth Workspace
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            The command center for{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              marketing operations
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            Plan campaigns, organize content, track SEO, monitor leads, and review performance. 
            Built for marketers who need visibility across the entire growth funnel.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={signInUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110"
            >
              <Lock className="h-4 w-4" />
              Sign In to Workspace
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
            <Target className="h-3 w-3" />
            <span>Protected workspace for marketing teams</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-20 w-full max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          Everything a marketer needs
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
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
              <div>
                <h3 className="text-sm font-semibold">{cap.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          How teams use it
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 transition hover:border-[var(--color-primary)]"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface)]">
                <FileText className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">{useCase.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {useCase.description}
              </p>
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
              Marketing + Content contains sensitive campaign data, content strategies, lead information, 
              and performance analytics. Access is restricted to authorized users to protect competitive 
              intelligence and customer data.
            </p>

            <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h3 className="text-sm font-semibold">Protected Data</h3>
                <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <li>• Campaign roadmaps and strategies</li>
                  <li>• Content calendars and assets</li>
                  <li>• SEO keyword research</li>
                  <li>• Lead and pipeline data</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h3 className="text-sm font-semibold">Available To</h3>
                <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
                  <li>• All authenticated portal users</li>
                  <li>• Marketing team members</li>
                  <li>• Growth operators</li>
                  <li>• Content strategists</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={registerUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110"
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
            <TrendingUp className="h-4 w-4 text-[var(--color-text-secondary)]" />
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
              <Layout className="h-3 w-3" />
              Growth Workspace
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
