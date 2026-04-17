'use client';

import { useState } from "react";

import { asafarimBrandTokens } from "@asafarim/ui";

import { ContentForm } from "@/components/ContentForm";
import { OutputCard } from "@/components/OutputCard";
import { ContentType } from "@/components/TypeSelector";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type GeneratePayload = {
  type: ContentType;
  input: string;
};

const quickPrompts: Array<{ label: string; type: ContentType; prompt: string }> = [
  {
    label: "Product launch email",
    type: "email",
    prompt:
      "Write a launch email for a new AI meeting assistant aimed at startup founders. Keep it concise, outcome-driven, and include a clear CTA.",
  },
  {
    label: "SaaS blog intro",
    type: "blog",
    prompt:
      "Create a compelling intro + outline for a blog post titled 'How AI agents reduce operational drag in SaaS teams'.",
  },
  {
    label: "Social campaign",
    type: "social",
    prompt:
      "Draft 3 social captions for LinkedIn promoting an AI content generator for B2B SaaS teams. Tone: confident, practical, premium.",
  },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function ContentGeneratorPage() {
  const [type, setType] = useState<ContentType>("blog");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lastPayload, setLastPayload] = useState<GeneratePayload | null>(null);

  const runGeneration = async (payload: GeneratePayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${basePath}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { output?: string; error?: string };

      if (!response.ok || !data.output) {
        throw new Error(data.error ?? "Generation failed. Please try again.");
      }

      setOutput(data.output);
      setLastPayload(payload);
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : "Unexpected error while generating content.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a prompt before generating.");
      return;
    }

    await runGeneration({ type, input: trimmed });
  };

  const handleRegenerate = async () => {
    if (!lastPayload) {
      return;
    }

    await runGeneration(lastPayload);
  };

  const handleCopy = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1600);
  };

  const features = [
    {
      title: "Multi-provider fallback",
      description: "OpenAI first, Anthropic as a safety net — zero downtime in drafts.",
      accent: "from-[#3a7bff] to-[#4ff2c9]",
    },
    {
      title: "Format-aware prompts",
      description: "Blog, product, email, social, summary — tuned for each surface.",
      accent: "from-[#4ff2c9] to-[#c084fc]",
    },
    {
      title: "Portal-connected",
      description: "Single sign-on with the ASafariM portal. Secure by default.",
      accent: "from-[#c084fc] to-[#f472b6]",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
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

      <Header />

      <section className="mx-auto w-full max-w-7xl px-6 pt-14 sm:pt-20">
        <div className="flex flex-col items-start gap-6 sm:items-center sm:text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            AI Content Generator · Live
          </span>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Generate{" "}
            <span className="bg-gradient-to-r from-[#3a7bff] via-[#4ff2c9] to-[#c084fc] bg-clip-text text-transparent">
              premium content
            </span>{" "}
            across every format your team ships.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            Blog, product, email, social, and summary drafts — orchestrated by the{" "}
            {asafarimBrandTokens.essence.toLowerCase()} system. Fast ideation now, durable
            workflows later.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href="#generator"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(58,123,255,0.8)] transition hover:bg-[var(--color-primary-dark)]"
            >
              Start generating
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
            >
              Explore capabilities
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto mt-20 grid w-full max-w-7xl gap-4 px-6 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-glass)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
          >
            <div
              className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${feature.accent} opacity-80`}
            />
            <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <section id="prompts" className="mx-auto mt-16 w-full max-w-7xl px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
            Quick-start prompts
          </h2>
          <span className="text-xs text-[var(--color-text-secondary)]">Click to autofill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setType(item.type);
                setInput(item.prompt);
              }}
              className="cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section
        id="generator"
        className="mx-auto mt-8 grid w-full max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-start"
      >
        <ContentForm
          input={input}
          type={type}
          isLoading={isLoading}
          onInputChange={setInput}
          onTypeChange={setType}
          onSubmit={handleSubmit}
        />

        <OutputCard
          output={output}
          isLoading={isLoading}
          isCopied={isCopied}
          error={error}
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
        />
      </section>

      <Footer />
    </main>
  );
}
