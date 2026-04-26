import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, serverError, unauthorized } from "@/lib/server/auth";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  sanitizeName,
  sanitizeOptionalText,
} from "@/lib/server/validation";
import { assertFolderOwnership } from "@/lib/server/ownership";

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  try {
    const folders = await prisma.contentProjectFolder.findMany({
      where: { userId: user.id },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        parentId: true,
        position: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ folders });
  } catch (error) {
    return serverError("projects.GET", error);
  }
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  let body: {
    name?: unknown;
    description?: unknown;
    color?: unknown;
    icon?: unknown;
    parentId?: unknown;
    position?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const name = sanitizeName(body.name, MAX_NAME_LENGTH);
  if (!name) return badRequest("Folder name is required.");

  const description = sanitizeOptionalText(body.description, MAX_DESCRIPTION_LENGTH);
  const color = sanitizeOptionalText(body.color, 32);
  const icon = sanitizeOptionalText(body.icon, 64);
  const position = typeof body.position === "number" ? Math.trunc(body.position) : 0;

  let parentId: string | null = null;
  if (typeof body.parentId === "string" && body.parentId.length > 0) {
    parentId = await assertFolderOwnership(body.parentId, user.id);
    if (!parentId) return badRequest("Parent folder not found.");
  }

  try {
    const folder = await prisma.contentProjectFolder.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        name,
        description,
        color,
        icon,
        parentId,
        position,
      },
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    return serverError("projects.POST", error);
  }
}
