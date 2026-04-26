import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, serverError, unauthorized } from "@/lib/server/auth";
import { assertFolderOwnership } from "@/lib/server/ownership";
import { assertContentTypeAvailable } from "@/lib/server/content-types";
import {
  MAX_TITLE_LENGTH,
  sanitizeName,
} from "@/lib/server/validation";

export async function GET(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const folderId = url.searchParams.get("folderId");
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  try {
    const sessions = await prisma.contentChatSession.findMany({
      where: {
        userId: user.id,
        ...(folderId ? { folderId } : {}),
        ...(includeArchived ? {} : { status: { not: "archived" } }),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        contentType: true,
        status: true,
        folderId: true,
        lastMessageAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    return serverError("chats.GET", error);
  }
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  let body: { title?: unknown; contentType?: unknown; folderId?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const title = sanitizeName(body.title, MAX_TITLE_LENGTH) ?? "Untitled session";

  let contentType: string | null = null;
  if (typeof body.contentType === "string" && body.contentType.length > 0) {
    const def = await assertContentTypeAvailable(body.contentType, user);
    if (!def) return badRequest("Invalid or unavailable content type.");
    contentType = def.slug;
  }

  let folderId: string | null = null;
  if (typeof body.folderId === "string" && body.folderId.length > 0) {
    folderId = await assertFolderOwnership(body.folderId, user.id);
    if (!folderId) return badRequest("Folder not found.");
  }

  try {
    const session = await prisma.contentChatSession.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        folderId,
        title,
        contentType,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return serverError("chats.POST", error);
  }
}
