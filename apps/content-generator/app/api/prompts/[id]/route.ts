import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, notFound, unauthorized } from "@/lib/server/auth";
import {
  assertFolderOwnership,
  assertPromptOwnership,
} from "@/lib/server/ownership";
import {
  MAX_PROMPT_LENGTH,
  MAX_SYSTEM_PROMPT_LENGTH,
  MAX_TITLE_LENGTH,
  sanitizeName,
  sanitizeOptionalText,
  sanitizeTags,
} from "@/lib/server/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertPromptOwnership(id, user.id);
  if (!owned) return notFound();

  let body: {
    title?: unknown;
    prompt?: unknown;
    systemPrompt?: unknown;
    tags?: unknown;
    isFavorite?: unknown;
    folderId?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = sanitizeName(body.title, MAX_TITLE_LENGTH);
    if (!title) return badRequest("Title cannot be empty.");
    data.title = title;
  }
  if (body.prompt !== undefined) {
    const promptText = sanitizeOptionalText(body.prompt, MAX_PROMPT_LENGTH);
    if (!promptText) return badRequest("Prompt cannot be empty.");
    data.prompt = promptText;
  }
  if (body.systemPrompt !== undefined) {
    data.systemPrompt = sanitizeOptionalText(body.systemPrompt, MAX_SYSTEM_PROMPT_LENGTH);
  }
  if (body.tags !== undefined) {
    data.tags = sanitizeTags(body.tags);
  }
  if (typeof body.isFavorite === "boolean") {
    data.isFavorite = body.isFavorite;
  }
  if (body.folderId !== undefined) {
    if (body.folderId === null || body.folderId === "") {
      data.folderId = null;
    } else if (typeof body.folderId === "string") {
      const ownedFolder = await assertFolderOwnership(body.folderId, user.id);
      if (!ownedFolder) return badRequest("Folder not found.");
      data.folderId = ownedFolder;
    }
  }

  const prompt = await prisma.savedPrompt.update({
    where: { id: owned },
    data,
  });

  return NextResponse.json({ prompt });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertPromptOwnership(id, user.id);
  if (!owned) return notFound();

  await prisma.savedPrompt.delete({ where: { id: owned } });
  return NextResponse.json({ ok: true });
}
