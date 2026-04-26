import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, notFound, unauthorized } from "@/lib/server/auth";
import { assertFolderOwnership, assertSessionOwnership } from "@/lib/server/ownership";
import {
  MAX_TITLE_LENGTH,
  sanitizeName,
} from "@/lib/server/validation";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = new Set(["active", "archived", "pinned"]);

export async function GET(_request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const session = await prisma.contentChatSession.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      contentType: true,
      status: true,
      folderId: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      metadata: true,
    },
  });
  if (!session) return notFound();

  return NextResponse.json({ session });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertSessionOwnership(id, user.id);
  if (!owned) return notFound();

  let body: { title?: unknown; status?: unknown; folderId?: unknown };
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

  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !VALID_STATUSES.has(body.status)) {
      return badRequest("Invalid status.");
    }
    data.status = body.status;
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

  const session = await prisma.contentChatSession.update({
    where: { id: owned },
    data,
  });

  return NextResponse.json({ session });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertSessionOwnership(id, user.id);
  if (!owned) return notFound();

  await prisma.contentChatSession.delete({ where: { id: owned } });
  return NextResponse.json({ ok: true });
}
