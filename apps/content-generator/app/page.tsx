'use client';

import { useCallback, useEffect, useState } from "react";

import { asafarimBrandTokens } from "@asafarim/ui";

import { ContentForm } from "@/components/ContentForm";
import { OutputCard } from "@/components/OutputCard";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
import {
  contentTypesApi,
  generate,
  promptsApi,
  type ContentTypeDefinition,
  type SavedPromptDto,
} from "@/lib/client/api";

type GeneratePayload = {
  type: string;
  input: string;
  folderId: string | null;
  sessionId: string | null;
};

const quickPrompts: Array<{ label: string; type: string; prompt: string }> = [
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
  const [type, setType] = useState<string>("blog");
  const [contentTypes, setContentTypes] = useState<ContentTypeDefinition[]>([]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lastPayload, setLastPayload] = useState<GeneratePayload | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workspaceRefresh, setWorkspaceRefresh] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const runGeneration = async (payload: GeneratePayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await generate({
        type: payload.type,
        input: payload.input,
        folderId: payload.folderId,
        sessionId: payload.sessionId,
      });

      setOutput(data.output);
      setTruncated(data.truncated ?? false);
      setSessionId(data.sessionId);
      setLastPayload({ ...payload, sessionId: data.sessionId });
      setWorkspaceRefresh((value) => value + 1);
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

    await runGeneration({ type, input: trimmed, folderId, sessionId });
  };

  const handleRegenerate = async () => {
    if (!lastPayload) {
      return;
    }

    await runGeneration({ ...lastPayload, sessionId });
  };

  // Ask the model to keep going from where it stopped. We append a short
  // continuation hint to the prior prompt and reuse the existing session so
  // the assistant has full chat history as context.
  const handleContinue = async () => {
    if (!lastPayload || !output) return;
    const continuation =
      "Continue exactly from where you left off in the previous response. Do not repeat anything already written.";
    await runGeneration({
      ...lastPayload,
      input: continuation,
      sessionId,
    });
  };

  const loadContentTypes = useCallback(async () => {
    try {
      const { contentTypes: rows } = await contentTypesApi.list();
      setContentTypes(rows);
      setType((current) => {
        if (current && rows.some((row) => row.slug === current)) return current;
        const blog = rows.find((row) => row.slug === "blog");
        return blog?.slug ?? rows[0]?.slug ?? current;
      });
    } catch {
      // Non-fatal: the user can still type a slug they own; backend will validate.
    }
  }, []);

  useEffect(() => {
    void loadContentTypes();
  }, [loadContentTypes]);

  const handleCreateType = useCallback(
    async (input: { label: string; description?: string; promptInstructions?: string }) => {
      const { contentType: created } = await contentTypesApi.create(input);
      setContentTypes((prev) => {
        const next = prev.filter((row) => row.id !== created.id);
        next.push(created);
        return next.sort((a, b) => a.label.localeCompare(b.label));
      });
      setType(created.slug);
      return created;
    },
    [],
  );

  const handleApplyPrompt = (prompt: SavedPromptDto) => {
    setType(prompt.contentType);
    if (!contentTypes.some((row) => row.slug === prompt.contentType)) {
      // Saved prompt references an unknown type — refresh the list so it appears.
      void loadContentTypes();
    }
    setInput(prompt.prompt);
    if (prompt.folderId) setFolderId(prompt.folderId);
  };

  const handleSavePrompt = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSaveStatus("saving");
    try {
      await promptsApi.create({
        title: trimmed.slice(0, 60),
        contentType: type,
        prompt: trimmed,
        folderId,
        sessionId,
      });
      setSaveStatus("saved");
      setWorkspaceRefresh((value) => value + 1);
      window.setTimeout(() => setSaveStatus("idle"), 1600);
    } catch {
      setSaveStatus("error");
      window.setTimeout(() => setSaveStatus("idle"), 2400);
    }
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
    <div className="relative overflow-x-hidden">
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
        className="mx-auto mt-8 grid w-full max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-[18rem,1fr,1fr] lg:items-start"
      >
        <ProjectWorkspace
          selectedFolderId={folderId}
          selectedSessionId={sessionId}
          onFolderChange={(nextFolderId) => {
            setFolderId(nextFolderId);
            setSessionId(null);
          }}
          onSessionChange={setSessionId}
          onApplyPrompt={handleApplyPrompt}
          refreshKey={workspaceRefresh}
        />

        <div className="flex flex-col gap-3">
          <ContentForm
            input={input}
            type={type}
            types={contentTypes}
            isLoading={isLoading}
            onInputChange={setInput}
            onTypeChange={setType}
            onCreateType={handleCreateType}
            onSubmit={handleSubmit}
          />
          <button
            type="button"
            onClick={handleSavePrompt}
            disabled={!input.trim() || saveStatus === "saving"}
            className="cursor-pointer self-start rounded-full border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
              ? "Saved"
              : saveStatus === "error"
              ? "Save failed"
              : "Save as prompt"}
          </button>
        </div>

        <OutputCard
          output={output}
          isLoading={isLoading}
          isCopied={isCopied}
          truncated={truncated}
          onContinue={handleContinue}
          error={error}
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
        />
      </section>
    </div>
  );
}
