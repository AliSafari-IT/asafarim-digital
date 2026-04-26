export const VALID_CONTENT_TYPES = new Set([
  "blog",
  "product",
  "email",
  "social",
  "summary",
]);

export const MAX_NAME_LENGTH = 120;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_PROMPT_LENGTH = 20_000;
export const MAX_SYSTEM_PROMPT_LENGTH = 4000;
export const MAX_TAGS = 20;
export const MAX_TAG_LENGTH = 40;
export const MIN_PROMPT_LENGTH = 12;

export function isValidContentType(value: unknown): value is string {
  return typeof value === "string" && VALID_CONTENT_TYPES.has(value);
}

export function sanitizeName(value: unknown, max = MAX_NAME_LENGTH): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function sanitizeOptionalText(value: unknown, max: number): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
