import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, notFound, unauthorized } from "@/lib/server/auth";
import { assertFolderOwnership } from "@/lib/server/ownership";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  sanitizeName,
  sanitizeOptionalText,
} from "@/lib/server/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertFolderOwnership(id, user.id);
  if (!owned) return notFound();

  let body: {
    name?: unknown;
    description?: unknown;
    color?: unknown;
    icon?: unknown;
    position?: unknown;
    isArchived?: unknown;
    parentId?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = sanitizeName(body.name, MAX_NAME_LENGTH);
    if (!name) return badRequest("Folder name cannot be empty.");
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description = sanitizeOptionalText(body.description, MAX_DESCRIPTION_LENGTH);
  }
  if (body.color !== undefined) {
    data.color = sanitizeOptionalText(body.color, 32);
  }
  if (body.icon !== undefined) {
    data.icon = sanitizeOptionalText(body.icon, 64);
  }
  if (typeof body.position === "number") {
    data.position = Math.trunc(body.position);
  }
  if (typeof body.isArchived === "boolean") {
    data.isArchived = body.isArchived;
  }
  if (body.parentId !== undefined) {
    if (body.parentId === null || body.parentId === "") {
      data.parentId = null;
    } else if (typeof body.parentId === "string") {
      if (body.parentId === id) return badRequest("Folder cannot be its own parent.");
      const ownedParent = await assertFolderOwnership(body.parentId, user.id);
      if (!ownedParent) return badRequest("Parent folder not found.");
      data.parentId = ownedParent;
    }
  }

  const folder = await prisma.contentProjectFolder.update({
    where: { id: owned },
    data,
  });

  return NextResponse.json({ folder });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertFolderOwnership(id, user.id);
  if (!owned) return notFound();

  await prisma.contentProjectFolder.delete({ where: { id: owned } });
  return NextResponse.json({ ok: true });
}
