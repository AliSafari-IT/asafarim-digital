"use client";

import { useState } from "react";
import { asafarimBrandTokens } from "@asafarim/ui";
import { Sparkles, FileText, FolderOpen, MessageSquare, Save, Shield, ArrowRight, CheckCircle } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";
const currentAppUrl = process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL || "http://localhost:3001";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Generate blog posts, product pages, emails, social posts, and summaries with OpenAI and Anthropic fallback.",
    accent: "from-[#3a7bff] to-[#4ff2c9]",
  },
  {
    icon: FolderOpen,
    title: "Project Organization",
    description: "Organize your work by projects and folders. Keep drafts, generations, and prompts structured.",
    accent: "from-[#4ff2c9] to-[#c084fc]",
  },
  {
    icon: MessageSquare,
    title: "Chat Session History",
    description: "Continue conversations across sessions. Keep context and iterate on generated content.",
    accent: "from-[#c084fc] to-[#f472b6]",
  },
  {
    icon: Save,
    title: "Reusable Prompts",
    description: "Save and categorize prompts. Build a library of templates for consistent content.",
    accent: "from-[#f472b6] to-[#3a7bff]",
  },
  {
    icon: FileText,
    title: "Custom Content Types",
    description: "Create your own content types with custom instructions. Adapt the AI to your brand voice.",
    accent: "from-[#3a7bff] to-[#c084fc]",
  },
  {
    icon: Shield,
    title: "Portal-Connected Auth",
    description: "Single sign-on with the ASafariM portal. Secure, centralized, and seamless.",
    accent: "from-[#4ff2c9] to-[#3a7bff]",
  },
];

const useCases = [
  { title: "Blog Posts", description: "SEO-optimized articles with structured outlines" },
  { title: "Product Pages", description: "Landing copy that converts visitors to users" },
  { title: "Email Campaigns", description: "Newsletters, cold outreach, and nurture sequences" },
  { title: "Social Posts", description: "LinkedIn, Twitter/X, and Instagram captions" },
  { title: "Summaries", description: "TL;DRs, executive briefs, and research synopses" },
  { title: "Launch Copy", description: "Product announcements and release notes" },
];

const benefits = [
  "Save generated content permanently",
  "Organize drafts by project",
  "Keep chat/session history",
  "Create reusable prompts",
  "Create custom content types",
  "Access the authenticated workspace securely",
];

export function PublicHomepage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const signInUrl = `${portalUrl}/sign-in?callbackUrl=${encodeURIComponent(currentAppUrl + "/")}`;
  const registerUrl = `${portalUrl}/sign-up?callbackUrl=${encodeURIComponent(currentAppUrl + "/")}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(58,123,255,0.25),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(79,242,201,0.18),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(192,132,252,0.12),transparent_40%)]"
      />
      <img
        src={`${basePath}/brand/mesh-bg.svg`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] w-full object-cover opacity-50"
      />

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-14 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            AI Content Generator
          </span>
          
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Generate{" "}
            <span className="bg-gradient-to-r from-[#3a7bff] via-[#4ff2c9] to-[#c084fc] bg-clip-text text-transparent">
              premium content
            </span>{" "}
            across every format your team ships.
          </h1>
          
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            Blog, product, email, social, and summary drafts — orchestrated by the{" "}
            {asafarimBrandTokens.essence.toLowerCase()} system. Fast ideation now, durable workflows later.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={registerUrl}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(58,123,255,0.8)] transition hover:bg-[var(--color-primary-dark)] hover:shadow-[0_14px_40px_-10px_rgba(58,123,255,0.9)]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={signInUrl}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-6 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Sign In
            </a>
          </div>

          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <a href={signInUrl} className="text-[var(--color-primary)] hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto mt-20 w-full max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          Everything you need for content at scale
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-glass)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div
                className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${feature.accent} opacity-80`}
              />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)]">
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

      {/* Use Cases */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          What you can create
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-glass)] p-4 transition hover:border-[var(--color-primary)]"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" />
              <div>
                <h3 className="text-sm font-semibold">{useCase.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Register Section */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)] p-8 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Why register?
            </h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">
              Free accounts unlock the full workspace. No credit card required.
            </p>
            
            <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href={registerUrl}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(58,123,255,0.8)] transition hover:bg-[var(--color-primary-dark)]"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-6 pb-16">
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Part of the{" "}
            <a
              href={portalUrl}
              className="text-[var(--color-primary)] hover:underline"
            >
              ASafariM Portal
            </a>
            {" "}ecosystem
          </p>
        </div>
      </section>
    </div>
  );
}
