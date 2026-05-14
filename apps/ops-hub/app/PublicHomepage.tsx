"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileClock,
  Flag,
  Gauge,
  GitBranch,
  History,
  KeyRound,
  Layers3,
  Lock,
  Server,
  Shield,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";
const currentAppUrl = process.env.NEXT_PUBLIC_OPS_HUB_URL || "http://localhost:3003";
const currentAppBaseUrl = currentAppUrl.replace(/\/$/, "");

const highlights = [
  { value: "360", label: "Tenant view", detail: "Lifecycle, health, plan, owner, and risk context in one place." },
  { value: "MRR", label: "Revenue signals", detail: "Subscriptions, invoices, plan movement, and payment status." },
  { value: "RBAC", label: "Restricted access", detail: "Operator roles keep billing and customer data private." },
];

const featureGroups = [
  {
    icon: Activity,
    title: "Tenant Operations",
    summary: "Monitor every customer account from trial through renewal, expansion, downgrade, or churn.",
    details: [
      "Tenant status, owner, plan, lifecycle stage, and health score",
      "Churn risk indicators for accounts that need attention",
      "Customer context for support, success, billing, and operations teams",
    ],
  },
  {
    icon: CreditCard,
    title: "Billing And Revenue",
    summary: "Keep revenue operations visible without digging through separate billing dashboards.",
    details: [
      "MRR, ARR, open invoices, failed payments, and past-due accounts",
      "Subscription state tracking across trials, active plans, and renewals",
      "Plan mix visibility for pricing, packaging, and customer segmentation",
    ],
  },
  {
    icon: Users,
    title: "User Lifecycle",
    summary: "Understand user adoption, onboarding progress, access, and account activity.",
    details: [
      "Operator-friendly user lists with tenant and role context",
      "Signals for onboarding gaps, inactive users, and account maturity",
      "A single place to inspect customer access without switching products",
    ],
  },
  {
    icon: Flag,
    title: "Feature Rollouts",
    summary: "Control feature flags, tenant overrides, and kill switches from an operational console.",
    details: [
      "Safer staged rollouts for beta features and production launches",
      "Tenant-specific enablement for pilots, internal accounts, and exceptions",
      "Fast rollback controls when a release needs to be paused",
    ],
  },
  {
    icon: Workflow,
    title: "Lifecycle Automation",
    summary: "Track the operational jobs that keep a SaaS business moving in the background.",
    details: [
      "Automation status, recent runs, skipped jobs, and failures",
      "Renewal, lifecycle, cleanup, and notification workflows",
      "Clear context for what ran, what changed, and what needs review",
    ],
  },
  {
    icon: History,
    title: "Audit And Compliance",
    summary: "Protect sensitive operations with an audit trail for operator activity.",
    details: [
      "Immutable records of important changes across tenants and settings",
      "Visibility into who changed what and when",
      "Compliance-oriented context for billing, access, and configuration updates",
    ],
  },
];

const workflowSteps = [
  {
    icon: Gauge,
    title: "Inspect the business",
    text: "Start from overview metrics, tenant health, revenue movement, and service state.",
  },
  {
    icon: Layers3,
    title: "Open the account context",
    text: "Move from a signal to the tenant, users, invoices, flags, and lifecycle details behind it.",
  },
  {
    icon: GitBranch,
    title: "Act with controls",
    text: "Use role-gated actions for rollout changes, lifecycle updates, and operational follow-up.",
  },
  {
    icon: FileClock,
    title: "Leave a trace",
    text: "Audit entries and status history make decisions inspectable after the fact.",
  },
];

const accessRows = [
  { role: "ops_viewer", description: "Read-only operational visibility for support, success, and leadership." },
  { role: "ops_admin", description: "Console access for approved operators managing tenants, flags, and workflows." },
  { role: "superadmin", description: "Full administrative access across the ASafariM application ecosystem." },
];

const platformCapabilities = [
  "Tenant lifecycle and churn-risk monitoring",
  "Revenue, subscription, and invoice visibility",
  "User activity and onboarding context",
  "Feature flag rollout controls",
  "Automation health and run history",
  "System status and operational alerts",
  "Audit log for sensitive changes",
  "Portal SSO and role-based access control",
];

export function PublicHomepage({
  accessState,
  isSignedIn = false,
}: {
  accessState?: "required" | "requested";
  isSignedIn?: boolean;
}) {
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const overviewCallbackUrl = `${currentAppBaseUrl}/overview`;
  const signInUrl = `${portalUrl}/sign-in?callbackUrl=${encodeURIComponent(overviewCallbackUrl)}`;
  const showAccessRequired = accessState === "required";
  const showAccessRequested = accessState === "requested";
  const signInLabel = isSignedIn ? "Switch account" : "Sign in to Ops Hub";

  async function handleSignIn() {
    if (!isSignedIn) return;

    setIsSwitchingAccount(true);
    await signOut({ callbackUrl: signInUrl });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              <Shield className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
              SaaS operations console
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-normal text-[var(--color-text)] lg:text-4xl">
              Run customer, revenue, rollout, and automation operations from one hub.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              Ops Hub gives ASafariM operators a focused command center for tenant health, billing visibility,
              user lifecycle, feature flags, automations, system status, and audit history. Guest users can
              understand what the console does before requesting access through the Portal.
            </p>

            {(showAccessRequired || showAccessRequested) && (
              <div
                id="access-request"
                className={`mt-5 rounded-lg border p-5 ${
                  showAccessRequested
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    showAccessRequested ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-100"
                  }`}>
                    {showAccessRequested ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Lock className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-base font-semibold ${showAccessRequested ? "text-emerald-100" : "text-amber-100"}`}>
                      {showAccessRequested ? "Ops access request sent" : "Ops access is required"}
                    </h2>
                    <p className={`mt-1 text-sm leading-6 ${showAccessRequested ? "text-emerald-100/85" : "text-amber-100/85"}`}>
                      {showAccessRequested
                        ? "Your request was recorded for admin review. An administrator can find it in the Portal admin audit area and assign ops_viewer, ops_admin, or superadmin when approved."
                        : "You are signed in, but your account does not have an accepted Ops Hub role yet. Request access so an administrator can review your account."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr]">
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSwitchingAccount}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold leading-5 text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  {isSwitchingAccount ? "Signing out..." : signInLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <a
                  href={signInUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold leading-5 text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  {signInLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href="#features"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-center text-sm font-semibold leading-5 text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
              >
                Explore features
              </a>
              <a
                href={portalUrl}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold leading-5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-text)]"
              >
                Return to Portal
              </a>
              {showAccessRequested ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold leading-5 text-emerald-100"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Request sent
                </button>
              ) : (
                <form action="/api/access-requests" method="post">
                  <button
                    type="submit"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-center text-sm font-semibold leading-5 text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
                  >
                    Request Ops access
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Operator access is restricted to approved roles because the console contains sensitive business data.</span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3 shadow-2xl shadow-black/20 lg:p-4">
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Operations Overview</p>
                  <p className="text-xs text-[var(--color-text-subtle)]">Live tenant and revenue posture</p>
                </div>
                <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  Healthy
                </span>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 lg:p-4">
                    <p className="text-2xl font-bold text-[var(--color-text)]">{item.value}</p>
                    <p className="mt-1 text-sm font-semibold">{item.label}</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 border-t border-[var(--color-border)] p-4 md:grid-cols-[1fr_0.8fr]">
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Tenant Risk Queue</p>
                    <BellRing className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  </div>
                  {[
                    ["Initech Holdings", "Expansion delayed", "medium"],
                    ["Fabrikam", "Invoice past due", "high"],
                    ["Northstar Labs", "Usage dropped", "medium"],
                  ].map(([name, reason, risk]) => (
                    <div key={name} className="mb-3 flex items-center justify-between gap-3 rounded-md bg-[var(--color-bg-soft)] px-3 py-2 last:mb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="truncate text-xs text-[var(--color-text-subtle)]">{reason}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${risk === "high" ? "bg-rose-400/12 text-rose-300" : "bg-amber-400/12 text-amber-300"}`}>
                        {risk}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
                  <p className="text-sm font-semibold">Rollout State</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["New checkout", "72%"],
                      ["Usage alerts", "38%"],
                      ["Lifecycle v2", "16%"],
                    ].map(([name, value]) => (
                      <div key={name}>
                        <div className="flex justify-between text-xs">
                          <span>{name}</span>
                          <span className="text-[var(--color-text-subtle)]">{value}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
                          <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: value }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Feature depth</p>
          <h2 className="mt-4 text-3xl font-bold tracking-normal sm:text-4xl">
            Every major SaaS operations surface explained for guests
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
            The public homepage describes the value of Ops Hub without exposing protected data. Once signed in,
            authorized operators can move from these concepts into live account, billing, rollout, and audit views.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {featureGroups.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-accent)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{feature.summary}</p>
                <ul className="mt-5 space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-sm leading-6 text-[var(--color-text-muted)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="border-y border-[var(--color-border)] bg-[var(--color-bg-soft)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Operator workflow</p>
            <h2 className="mt-4 text-3xl font-bold tracking-normal sm:text-4xl">
              Built for daily decisions, not vanity dashboards
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Ops Hub is organized around the actions an operator repeats: spot a signal, inspect the account,
              make a controlled change, and keep a trace for the team.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-accent)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-subtle)]">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="access" className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-rose-300" aria-hidden="true" />
            <h2 className="text-2xl font-semibold">Why sign-in is required</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            Ops Hub contains tenant business records, user data, billing information, feature controls,
            operational automations, and audit history. The public page explains the product, but live data
            stays behind Portal authentication and role checks.
          </p>
          <div className="mt-6 space-y-3">
            {accessRows.map((row) => (
              <div key={row.role} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                <p className="font-mono text-xs font-semibold text-[var(--color-accent)]">{row.role}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{row.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-[var(--color-accent)]" aria-hidden="true" />
            <h2 className="text-2xl font-semibold">Platform capabilities</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {platformCapabilities.map((capability) => (
              <div key={capability} className="flex gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span>{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold sm:text-3xl">Need access to the operations console?</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                Sign in through the ASafariM Portal if you already have access, or request the correct operator role
                so your permissions can be reviewed.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSwitchingAccount}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSwitchingAccount ? "Signing out..." : "Switch account"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <a
                  href={signInUrl}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <form action="/api/access-requests" method="post">
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
                >
                  Request access
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
            <span className="text-sm text-[var(--color-text-secondary)]">Part of the ASafariM Portal ecosystem</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <a href={portalUrl} className="hover:text-[var(--color-text)]">Portal</a>
            <span aria-hidden="true">/</span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" aria-hidden="true" />
              Operator Console
            </span>
            <span aria-hidden="true">/</span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" aria-hidden="true" />
              Daily operations
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
