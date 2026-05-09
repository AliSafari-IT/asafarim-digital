"use client";

import { useState, useCallback } from "react";
import { generate } from "@/lib/client/api";

// ─── Simple markdown → HTML renderer ─────────────────────────────────────────
// Handles headings, bold, italic, code, lists, blockquotes without a library.

function renderMarkdown(raw: string): string {
  let html = raw
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Block-level: headings
  html = html
    .replace(/^######\s(.+)$/gm, '<h6 class="md-h6">$1</h6>')
    .replace(/^#####\s(.+)$/gm, '<h5 class="md-h5">$1</h5>')
    .replace(/^####\s(.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^###\s(.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^##\s(.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^#\s(.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Blockquote
  html = html.replace(/^&gt;\s(.+)$/gm, '<blockquote class="md-bq">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="md-hr" />');

  // Code blocks (fenced)
  html = html.replace(/```[\w]*\n([\s\S]*?)```/gm, '<pre class="md-pre"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');

  // Inline: bold + italic
  html = html
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^[-*+]\s(.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="md-ul">${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="md-li">$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener">$1</a>');

  // Paragraphs: double newline → <p>
  html = html
    .split(/\n\n+/)
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      // Don't wrap block elements in <p>
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|hr)/.test(trimmed)) return trimmed;
      return `<p class="md-p">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

function computeStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const readingMins = Math.max(1, Math.round(words / 200));
  return { words, chars, readingMins };
}

// ─── Refine action definitions ────────────────────────────────────────────────

interface RefineAction {
  id: string;
  label: string;
  emoji: string;
  description: string;
  prompt: (content: string) => string;
}

const REFINE_ACTIONS: RefineAction[] = [
  {
    id: "shorten",
    label: "Shorten",
    emoji: "✂️",
    description: "Cut to ~50% length, keep key points",
    prompt: (c) => `Shorten the following content to approximately half its current length. Keep all the key points, core ideas, and tone. Do not add new content — only trim.\n\n---\n${c}`,
  },
  {
    id: "expand",
    label: "Expand",
    emoji: "📝",
    description: "Double the depth with examples",
    prompt: (c) => `Expand the following content to roughly double its current length. Add supporting examples, statistics, and elaborated explanations where appropriate. Maintain the existing tone and structure.\n\n---\n${c}`,
  },
  {
    id: "formal",
    label: "Formalise",
    emoji: "🎩",
    description: "Elevate to professional register",
    prompt: (c) => `Rewrite the following content in a formal, professional tone suitable for executive or B2B audiences. Replace casual phrases with precise language. Keep the same structure and information.\n\n---\n${c}`,
  },
  {
    id: "casual",
    label: "Casual",
    emoji: "😎",
    description: "Relax the tone, feel conversational",
    prompt: (c) => `Rewrite the following content in a friendly, conversational tone. Use contractions, short sentences, and approachable language. Keep the same information and structure.\n\n---\n${c}`,
  },
  {
    id: "seo",
    label: "SEO Boost",
    emoji: "🔍",
    description: "Add headings, keywords & meta hooks",
    prompt: (c) => `Optimise the following content for SEO. Add an H1 title if missing, break into H2/H3 sections, add a strong meta description at the top (labelled 'Meta:'), and naturally weave in relevant keywords. Keep the information accurate.\n\n---\n${c}`,
  },
  {
    id: "bullets",
    label: "Bulletise",
    emoji: "•",
    description: "Convert prose to structured bullets",
    prompt: (c) => `Convert the following content into a clean, scannable bullet-point format. Group related points under bold subheadings. Preserve all key information. Use short, punchy bullets.\n\n---\n${c}`,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface RichOutputCardProps {
  output: string;
  isLoading: boolean;
  isCopied: boolean;
  error: string | null;
  truncated?: boolean;
  type?: string;
  sessionId?: string | null;
  onCopy: () => void;
  onRegenerate: () => void;
  onContinue?: () => void;
  onOutputChange?: (newOutput: string) => void;
}

export function RichOutputCard({
  output,
  isLoading,
  isCopied,
  error,
  truncated,
  type = "blog",
  sessionId,
  onCopy,
  onRegenerate,
  onContinue,
  onOutputChange,
}: RichOutputCardProps) {
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [refining, setRefining] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [activeRefine, setActiveRefine] = useState<string | null>(null);

  const stats = computeStats(output);
  const hasOutput = output.trim().length > 0;

  const handleRefine = useCallback(async (action: RefineAction) => {
    if (!hasOutput || refining) return;
    setRefining(action.id);
    setRefineError(null);
    setActiveRefine(action.id);
    try {
      const result = await generate({
        type,
        input: action.prompt(output),
        sessionId,
      });
      onOutputChange?.(result.output);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Refinement failed.");
    } finally {
      setRefining(null);
    }
  }, [output, type, sessionId, hasOutput, refining, onOutputChange]);

  const handleDownloadMd = useCallback(() => {
    if (!hasOutput) return;
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, hasOutput]);

  const handleDownloadHtml = useCallback(() => {
    if (!hasOutput) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated Content</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1.5rem; color: #1a1a1a; line-height: 1.6; }
    h1,h2,h3 { font-weight: 700; margin-top: 1.5em; }
    h1 { font-size: 2rem; } h2 { font-size: 1.5rem; } h3 { font-size: 1.25rem; }
    p { margin: 0.75em 0; }
    ul,ol { padding-left: 1.5rem; margin: 0.75em 0; }
    blockquote { border-left: 4px solid #3a7bff; padding-left: 1rem; color: #555; font-style: italic; margin: 1em 0; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
    a { color: #3a7bff; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 1.5em 0; }
  </style>
</head>
<body>
${renderMarkdown(output)}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, hasOutput]);

  return (
    <section className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-card)]">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Generated Output</h2>
          {hasOutput && !isLoading && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
                {stats.words.toLocaleString()} words
              </span>
              <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
                ~{stats.readingMins} min read
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          {hasOutput && (
            <div className="flex rounded-lg bg-[var(--color-surface)] p-0.5">
              {(["preview", "raw"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? "bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {mode === "preview" ? "📄 Preview" : "<> Raw"}
                </button>
              ))}
            </div>
          )}

          {/* Download dropdown */}
          {hasOutput && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleDownloadMd}
                title="Download as Markdown"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
              >
                ↓ .md
              </button>
              <button
                type="button"
                onClick={handleDownloadHtml}
                title="Download as HTML"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
              >
                ↓ .html
              </button>
            </div>
          )}

          {/* Copy */}
          <button
            type="button"
            onClick={onCopy}
            disabled={!hasOutput || isLoading}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isCopied
                ? "bg-emerald-600 text-white"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isCopied ? "✓ Copied" : "Copy"}
          </button>

          {/* Regenerate */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={!hasOutput || isLoading || !!refining}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↺ Regen
          </button>
        </div>
      </div>

      {/* ── AI Refine Toolbar ── */}
      {hasOutput && !isLoading && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              AI Refine:
            </span>
            {REFINE_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                title={action.description}
                onClick={() => handleRefine(action)}
                disabled={!!refining}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  refining === action.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : activeRefine === action.id
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {refining === action.id ? (
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" />
                  </svg>
                ) : (
                  <span aria-hidden="true">{action.emoji}</span>
                )}
                {action.label}
              </button>
            ))}
            {refineError && (
              <span className="text-xs text-rose-400">{refineError}</span>
            )}
            {activeRefine && !refining && (
              <span className="text-[11px] text-emerald-400">Refined ✓</span>
            )}
          </div>
        </div>
      )}

      {/* ── Content area ── */}
      <div className="flex-1 px-6 py-5">
        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary)] opacity-20" />
              <svg className="h-6 w-6 animate-spin text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" />
              </svg>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-[var(--color-text)]">Generating content…</p>
              <p className="text-xs text-[var(--color-text-secondary)]">AI is drafting your content</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
            <p className="text-sm font-medium text-rose-300">Generation failed</p>
            <p className="text-xs text-rose-400">{error}</p>
          </div>
        ) : hasOutput ? (
          <>
            {truncated && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                <span>
                  <strong>Output was truncated</strong> by the provider's max-token limit. Click{" "}
                  <em>Continue</em> to append the rest.
                </span>
                {onContinue && (
                  <button
                    type="button"
                    onClick={onContinue}
                    className="shrink-0 rounded-md border border-amber-400/60 bg-amber-500/20 px-2 py-1 font-semibold text-amber-100 hover:bg-amber-500/30"
                  >
                    Continue
                  </button>
                )}
              </div>
            )}

            {viewMode === "preview" ? (
              <>
                <style>{`
                  .md-prose .md-h1 { font-size:1.5rem; font-weight:700; margin:0 0 0.75rem; line-height:1.25; color:var(--color-text); }
                  .md-prose .md-h2 { font-size:1.2rem; font-weight:700; margin:1.25rem 0 0.5rem; color:var(--color-text); }
                  .md-prose .md-h3 { font-size:1.05rem; font-weight:600; margin:1rem 0 0.4rem; color:var(--color-text); }
                  .md-prose .md-h4,.md-prose .md-h5,.md-prose .md-h6 { font-size:0.95rem; font-weight:600; margin:0.75rem 0 0.35rem; color:var(--color-text); }
                  .md-prose .md-p { margin:0 0 0.75rem; font-size:0.875rem; line-height:1.7; color:var(--color-text); }
                  .md-prose .md-ul { margin:0.5rem 0 0.75rem 1.25rem; list-style:disc; }
                  .md-prose .md-li { font-size:0.875rem; line-height:1.6; margin-bottom:0.25rem; color:var(--color-text); }
                  .md-prose .md-bq { border-left:3px solid var(--color-primary); padding:0.25rem 0 0.25rem 0.875rem; font-style:italic; color:var(--color-text-secondary); margin:0.75rem 0; font-size:0.875rem; }
                  .md-prose .md-pre { background:var(--color-surface); border:1px solid var(--color-border); border-radius:0.5rem; padding:0.875rem 1rem; overflow-x:auto; margin:0.75rem 0; }
                  .md-prose .md-pre code { font-family:ui-monospace,monospace; font-size:0.8rem; }
                  .md-prose .md-code { background:var(--color-surface); border:1px solid var(--color-border); border-radius:0.25rem; padding:0.1em 0.3em; font-family:ui-monospace,monospace; font-size:0.82em; color:var(--color-text); }
                  .md-prose .md-link { color:var(--color-primary); text-decoration:underline; }
                  .md-prose .md-hr { border:none; border-top:1px solid var(--color-border); margin:1rem 0; }
                `}</style>
                <div
                  className="md-prose"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                />
              </>
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">
                {output}
              </pre>
            )}
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[var(--color-text-secondary)]" aria-hidden="true">
                <path d="M12 3v3M12 18v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M3 12h3M18 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Generated output appears here</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Choose a content type, write a prompt, and click Generate.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer stats ── */}
      {hasOutput && !isLoading && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/40 px-6 py-2.5">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
            <span>{stats.words.toLocaleString()} words · {stats.chars.toLocaleString()} chars · ~{stats.readingMins} min read</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-generated
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
