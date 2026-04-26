"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import type { ContentTypeDefinition } from "@/lib/client/api";

interface TypeSelectorProps {
  value: string;
  types: ContentTypeDefinition[];
  onChange: (value: string) => void;
  onCreateType?: (input: {
    label: string;
    description?: string;
    promptInstructions?: string;
  }) => Promise<ContentTypeDefinition | null>;
}

export function TypeSelector({ value, types, onChange, onCreateType }: TypeSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setLabel("");
    setDescription("");
    setInstructions("");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onCreateType) return;
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Label is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await onCreateType({
        label: trimmed,
        description: description.trim() || undefined,
        promptInstructions: instructions.trim() || undefined,
      });
      if (created) {
        reset();
        setIsCreating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create content type.");
    } finally {
      setSubmitting(false);
    }
  };

  // If the current value is not in the loaded list (e.g. saved prompt has an
  // unfamiliar slug), show it as a fallback option so we don't silently drop it.
  const knownSlugs = new Set(types.map((t) => t.slug));
  const showFallback = value && !knownSlugs.has(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="content-type" className="text-sm font-medium text-[var(--color-text-secondary)]">
          Content type
        </label>
        {onCreateType && (
          <button
            type="button"
            onClick={() => setIsCreating((prev) => !prev)}
            className="cursor-pointer text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            {isCreating ? "Cancel" : "+ New type"}
          </button>
        )}
      </div>
      <select
        id="content-type"
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
      >
        {showFallback && (
          <option value={value}>
            {value} — (saved with this slug)
          </option>
        )}
        {types.map((option) => (
          <option key={option.id} value={option.slug}>
            {option.label}
            {option.description ? ` — ${option.description}` : ""}
            {option.isSystem ? "" : " (custom)"}
          </option>
        ))}
      </select>

      {isCreating && onCreateType && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Label</label>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={80}
              placeholder="e.g. Press release"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Description (optional)</label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              placeholder="Short hint shown in the dropdown"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              disabled={submitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Prompt instructions (optional)</label>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              maxLength={4000}
              rows={3}
              placeholder="Guidance for the AI when generating this type"
              className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              disabled={submitting}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setIsCreating(false);
              }}
              className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !label.trim()}
              className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create type"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
