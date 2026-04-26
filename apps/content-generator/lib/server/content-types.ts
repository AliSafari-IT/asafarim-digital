import { prisma, type ContentTypeDefinition } from "@asafarim/db";

import type { AuthedUser } from "./auth";
import {
  MAX_CONTENT_TYPE_DESCRIPTION_LENGTH,
  MAX_CONTENT_TYPE_INSTRUCTIONS_LENGTH,
  MAX_CONTENT_TYPE_LABEL_LENGTH,
  MAX_CONTENT_TYPE_SYSTEM_PROMPT_LENGTH,
  normalizeContentTypeSlug,
  sanitizeName,
  sanitizeOptionalText,
} from "./validation";

export type ContentTypeDto = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  promptInstructions: string | null;
  systemPrompt: string | null;
  isSystem: boolean;
  isActive: boolean;
};

export function toContentTypeDto(row: ContentTypeDefinition): ContentTypeDto {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    description: row.description,
    promptInstructions: row.promptInstructions,
    systemPrompt: row.systemPrompt,
    isSystem: row.isSystem,
    isActive: row.isActive,
  };
}

/**
 * Build the WHERE filter that captures every content type a given user is
 * allowed to see: active system types + the user's own + their tenant's.
 *
 * If multiple definitions share the same slug we keep the most specific one
 * via getAvailableContentTypes (user > tenant > system).
 */
function buildVisibleWhere(user: AuthedUser) {
  return {
    isActive: true,
    OR: [
      { isSystem: true, userId: null, tenantId: null },
      { userId: user.id },
      ...(user.tenantId ? [{ tenantId: user.tenantId, userId: null }] : []),
    ],
  };
}

/**
 * List all content types available to the user.
 * When two rows share a slug, the more specific scope wins:
 *   user-owned > tenant-owned > system.
 */
export async function getAvailableContentTypes(
  user: AuthedUser,
): Promise<ContentTypeDefinition[]> {
  const rows = await prisma.contentTypeDefinition.findMany({
    where: buildVisibleWhere(user),
    orderBy: [{ isSystem: "desc" }, { label: "asc" }],
  });

  const bySlug = new Map<string, ContentTypeDefinition>();
  const score = (row: ContentTypeDefinition) =>
    row.userId ? 3 : row.tenantId ? 2 : 1;
  for (const row of rows) {
    const existing = bySlug.get(row.slug);
    if (!existing || score(row) > score(existing)) {
      bySlug.set(row.slug, row);
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Resolve a slug to the matching content type definition the user can use.
 * Returns null if not available.
 */
export async function assertContentTypeAvailable(
  slug: string,
  user: AuthedUser,
): Promise<ContentTypeDefinition | null> {
  const normalized = normalizeContentTypeSlug(slug);
  if (!normalized) return null;
  const candidates = await prisma.contentTypeDefinition.findMany({
    where: { slug: normalized, ...buildVisibleWhere(user) },
  });
  if (candidates.length === 0) return null;
  // Prefer most specific scope.
  const score = (row: ContentTypeDefinition) =>
    row.userId ? 3 : row.tenantId ? 2 : 1;
  candidates.sort((a: ContentTypeDefinition, b: ContentTypeDefinition) => score(b) - score(a));
  return candidates[0];
}

export type ContentTypeInput = {
  slug?: unknown;
  label?: unknown;
  description?: unknown;
  promptInstructions?: unknown;
  systemPrompt?: unknown;
  isActive?: unknown;
};

export type ContentTypeValidationError =
  | { ok: false; error: string };
export type ContentTypeCreateResult =
  | { ok: true; row: ContentTypeDefinition }
  | ContentTypeValidationError
  | { ok: false; error: string; status: 409 };

function deriveSlugFromLabel(label: string): string | null {
  return normalizeContentTypeSlug(label);
}

/**
 * Create a user-owned custom content type.
 */
export async function createContentType(
  user: AuthedUser,
  payload: ContentTypeInput,
): Promise<ContentTypeCreateResult> {
  const label = sanitizeName(payload.label, MAX_CONTENT_TYPE_LABEL_LENGTH);
  if (!label) return { ok: false, error: "Label is required." };

  const slugSource =
    typeof payload.slug === "string" && payload.slug.trim().length > 0
      ? payload.slug
      : label;
  const slug = normalizeContentTypeSlug(slugSource) ?? deriveSlugFromLabel(label);
  if (!slug) return { ok: false, error: "Slug is invalid." };

  const description = sanitizeOptionalText(
    payload.description,
    MAX_CONTENT_TYPE_DESCRIPTION_LENGTH,
  );
  const promptInstructions = sanitizeOptionalText(
    payload.promptInstructions,
    MAX_CONTENT_TYPE_INSTRUCTIONS_LENGTH,
  );
  const systemPrompt = sanitizeOptionalText(
    payload.systemPrompt,
    MAX_CONTENT_TYPE_SYSTEM_PROMPT_LENGTH,
  );

  // Disallow shadowing an existing user-owned slug.
  const conflict = await prisma.contentTypeDefinition.findFirst({
    where: { slug, userId: user.id },
    select: { id: true },
  });
  if (conflict) {
    return {
      ok: false,
      status: 409,
      error: "You already have a content type with this slug.",
    };
  }

  const row = await prisma.contentTypeDefinition.create({
    data: {
      slug,
      label,
      description,
      promptInstructions,
      systemPrompt,
      isSystem: false,
      isActive: true,
      userId: user.id,
      tenantId: user.tenantId,
    },
  });
  return { ok: true, row };
}

export type ContentTypeUpdateInput = Partial<{
  label: unknown;
  description: unknown;
  promptInstructions: unknown;
  systemPrompt: unknown;
  isActive: unknown;
}>;

export async function updateContentType(
  user: AuthedUser,
  id: string,
  payload: ContentTypeUpdateInput,
): Promise<ContentTypeDefinition | null> {
  const owned = await prisma.contentTypeDefinition.findFirst({
    where: { id, userId: user.id, isSystem: false },
  });
  if (!owned) return null;

  const data: Record<string, unknown> = {};
  if (payload.label !== undefined) {
    const label = sanitizeName(payload.label, MAX_CONTENT_TYPE_LABEL_LENGTH);
    if (!label) return null;
    data.label = label;
  }
  if (payload.description !== undefined) {
    data.description = sanitizeOptionalText(
      payload.description,
      MAX_CONTENT_TYPE_DESCRIPTION_LENGTH,
    );
  }
  if (payload.promptInstructions !== undefined) {
    data.promptInstructions = sanitizeOptionalText(
      payload.promptInstructions,
      MAX_CONTENT_TYPE_INSTRUCTIONS_LENGTH,
    );
  }
  if (payload.systemPrompt !== undefined) {
    data.systemPrompt = sanitizeOptionalText(
      payload.systemPrompt,
      MAX_CONTENT_TYPE_SYSTEM_PROMPT_LENGTH,
    );
  }
  if (typeof payload.isActive === "boolean") {
    data.isActive = payload.isActive;
  }

  return prisma.contentTypeDefinition.update({
    where: { id: owned.id },
    data,
  });
}

/**
 * Delete (or, when needed, deactivate) a user-owned custom content type.
 * Returns true if the row was removed/deactivated, false otherwise.
 */
export async function deleteContentType(
  user: AuthedUser,
  id: string,
): Promise<boolean> {
  const owned = await prisma.contentTypeDefinition.findFirst({
    where: { id, userId: user.id, isSystem: false },
    select: { id: true },
  });
  if (!owned) return false;
  await prisma.contentTypeDefinition.delete({ where: { id: owned.id } });
  return true;
}
