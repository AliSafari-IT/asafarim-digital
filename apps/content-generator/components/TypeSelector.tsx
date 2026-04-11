import type { ChangeEvent } from "react";

export type ContentType = "blog" | "product" | "email" | "social" | "summary";

const typeOptions: { value: ContentType; label: string; hint: string }[] = [
  { value: "blog", label: "Blog Post", hint: "Long-form, educational, SEO-friendly" },
  { value: "product", label: "Product Description", hint: "Benefit-focused product copy" },
  { value: "email", label: "Email", hint: "Clear and persuasive outreach" },
  { value: "social", label: "Social Caption", hint: "Short, punchy, high-engagement" },
  { value: "summary", label: "Summary", hint: "Concise key points" },
];

interface TypeSelectorProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="content-type" className="text-sm font-medium text-[var(--color-text-secondary)]">
        Content type
      </label>
      <select
        id="content-type"
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as ContentType)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
      >
        {typeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} — {option.hint}
          </option>
        ))}
      </select>
    </div>
  );
}
