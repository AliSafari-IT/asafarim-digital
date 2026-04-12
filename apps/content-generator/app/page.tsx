'use client';

import { useState } from "react";

import { asafarimBrandTokens } from "@asafarim/ui";

import { ContentForm } from "@/components/ContentForm";
import { OutputCard } from "@/components/OutputCard";
import { ContentType } from "@/components/TypeSelector";

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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(58,123,255,0.22),transparent_36%),radial-gradient(circle_at_90%_10%,rgba(79,242,201,0.15),transparent_34%)]"
      />
      <img
        src={`${basePath}/brand/mesh-bg.svg`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] w-full object-cover opacity-45"
      />

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-14 sm:pt-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
              AI Content Generator
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Generate premium content across blog, product, email, social, and summary formats.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] sm:text-lg">
              Built for fast ideation now, scalable orchestration later. Powered by the {asafarimBrandTokens.essence.toLowerCase()} system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
            >
              Back to Portal
            </a>
            <a
              href="https://github.com/AliSafari-IT/asafarim-digital"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
            >
              View Monorepo
            </a>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {quickPrompts.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setType(item.type);
                setInput(item.prompt);
              }}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-start">
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
        </div>
      </section>
    </main>
  );
}
