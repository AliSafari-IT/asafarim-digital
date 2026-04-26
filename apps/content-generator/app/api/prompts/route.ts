import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, serverError, unauthorized } from "@/lib/server/auth";
import {
  assertFolderOwnership,
  assertSessionOwnership,
} from "@/lib/server/ownership";
import {
  MAX_PROMPT_LENGTH,
  MAX_SYSTEM_PROMPT_LENGTH,
  MAX_TITLE_LENGTH,
  VALID_CONTENT_TYPES,
  sanitizeName,
  sanitizeOptionalText,
  sanitizeTags,
} from "@/lib/server/validation";

export async function GET(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const folderId = url.searchParams.get("folderId");
  const onlyFavorites = url.searchParams.get("favorites") === "true";

  try {
    const prompts = await prisma.savedPrompt.findMany({
      where: {
        userId: user.id,
        ...(folderId ? { folderId } : {}),
        ...(onlyFavorites ? { isFavorite: true } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        contentType: true,
        prompt: true,
        systemPrompt: true,
        tags: true,
        isFavorite: true,
        folderId: true,
        sessionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    return serverError("prompts.GET", error);
  }
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  let body: {
    title?: unknown;
    contentType?: unknown;
    prompt?: unknown;
    systemPrompt?: unknown;
    tags?: unknown;
    isFavorite?: unknown;
    folderId?: unknown;
    sessionId?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const title = sanitizeName(body.title, MAX_TITLE_LENGTH);
  if (!title) return badRequest("Prompt title is required.");

  if (typeof body.contentType !== "string") {
    return badRequest("Content type is required.");
  }
  const contentType = body.contentType.trim().toLowerCase();
  if (!VALID_CONTENT_TYPES.has(contentType)) {
    return badRequest("Invalid content type.");
  }

  const promptText = sanitizeOptionalText(body.prompt, MAX_PROMPT_LENGTH);
  if (!promptText) return badRequest("Prompt content is required.");

  const systemPrompt = sanitizeOptionalText(body.systemPrompt, MAX_SYSTEM_PROMPT_LENGTH);
  const tags = sanitizeTags(body.tags);
  const isFavorite = body.isFavorite === true;

  let folderId: string | null = null;
  if (typeof body.folderId === "string" && body.folderId.length > 0) {
    folderId = await assertFolderOwnership(body.folderId, user.id);
    if (!folderId) return badRequest("Folder not found.");
  }

  let sessionId: string | null = null;
  if (typeof body.sessionId === "string" && body.sessionId.length > 0) {
    sessionId = await assertSessionOwnership(body.sessionId, user.id);
    if (!sessionId) return badRequest("Session not found.");
  }

  try {
    const prompt = await prisma.savedPrompt.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        folderId,
        sessionId,
        title,
        contentType,
        prompt: promptText,
        systemPrompt,
        tags,
        isFavorite,
      },
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    return serverError("prompts.POST", error);
  }
}
