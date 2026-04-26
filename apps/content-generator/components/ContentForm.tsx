import { Button } from "@asafarim/ui";
import type { ChangeEvent } from "react";

import type { ContentTypeDefinition } from "@/lib/client/api";

import { TypeSelector } from "./TypeSelector";

interface ContentFormProps {
  input: string;
  type: string;
  types: ContentTypeDefinition[];
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCreateType?: (input: {
    label: string;
    description?: string;
    promptInstructions?: string;
  }) => Promise<ContentTypeDefinition | null>;
  onSubmit: () => void;
}

export function ContentForm({
  input,
  type,
  types,
  isLoading,
  onInputChange,
  onTypeChange,
  onCreateType,
  onSubmit,
}: ContentFormProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-card)] sm:p-7">
      <h2 className="text-lg font-semibold">Create Content</h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Describe your goal, audience, and tone. The AI will draft structured content aligned to your selected format.
      </p>

      <div className="mt-6 space-y-5">
        <TypeSelector
          value={type}
          types={types}
          onChange={onTypeChange}
          onCreateType={onCreateType}
        />

        <div className="space-y-2">
          <label htmlFor="content-input" className="text-sm font-medium text-[var(--color-text-secondary)]">
            Prompt
          </label>
          <textarea
            id="content-input"
            rows={8}
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onInputChange(event.target.value)}
            placeholder="Example: Write a launch blog post for an AI-powered CRM feature focused on SMB founders. Keep it persuasive and practical, with one CTA."
            className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !input.trim()}
          className="w-full border-none bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          size="lg"
        >
          {isLoading ? "Generating..." : "Generate Content"}
        </Button>
      </div>
    </section>
  );
}
