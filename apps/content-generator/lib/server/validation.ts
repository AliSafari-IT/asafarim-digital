export const MAX_NAME_LENGTH = 120;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_PROMPT_LENGTH = 20_000;
export const MAX_SYSTEM_PROMPT_LENGTH = 4000;
export const MAX_TAGS = 20;
export const MAX_TAG_LENGTH = 40;
export const MIN_PROMPT_LENGTH = 12;

export const MAX_CONTENT_TYPE_SLUG_LENGTH = 64;
export const MAX_CONTENT_TYPE_LABEL_LENGTH = 80;
export const MAX_CONTENT_TYPE_DESCRIPTION_LENGTH = 500;
export const MAX_CONTENT_TYPE_INSTRUCTIONS_LENGTH = 4000;
export const MAX_CONTENT_TYPE_SYSTEM_PROMPT_LENGTH = MAX_SYSTEM_PROMPT_LENGTH;

const SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

/**
 * Normalize a free-form value into a content-type slug.
 * - Lowercases and trims.
 * - Collapses internal whitespace and converts spaces to hyphens.
 * - Strips characters outside [a-z0-9_-].
 * - Trims leading/trailing separators.
 * - Returns null if the resulting slug is empty or invalid.
 */
export function normalizeContentTypeSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let slug = value.trim().toLowerCase();
  if (!slug) return null;
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/[^a-z0-9_-]/g, "");
  slug = slug.replace(/^[-_]+|[-_]+$/g, "");
  if (!slug) return null;
  if (slug.length > MAX_CONTENT_TYPE_SLUG_LENGTH) {
    slug = slug.slice(0, MAX_CONTENT_TYPE_SLUG_LENGTH).replace(/[-_]+$/g, "");
  }
  if (!SLUG_PATTERN.test(slug)) return null;
  return slug;
}

export function isLikelyContentTypeSlug(value: unknown): value is string {
  return normalizeContentTypeSlug(value) !== null;
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
