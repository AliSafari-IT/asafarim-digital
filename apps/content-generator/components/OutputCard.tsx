interface OutputCardProps {
  output: string;
  isLoading: boolean;
  isCopied: boolean;
  error: string | null;
  onCopy: () => void;
  onRegenerate: () => void;
}

export function OutputCard({
  output,
  isLoading,
  isCopied,
  error,
  onCopy,
  onRegenerate,
}: OutputCardProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-card)] sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Generated Output</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!output || isLoading}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              isCopied
                ? "bg-emerald-600 text-white"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isCopied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={!output || isLoading}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="min-h-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        {isLoading ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Generating content...</p>
        ) : error ? (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        ) : output ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">{output}</p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your generated content will appear here. Start with a focused prompt and choose the format you need.
          </p>
        )}
      </div>
    </section>
  );
}
