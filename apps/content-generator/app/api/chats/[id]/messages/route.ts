import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { getAuthedUser, notFound, unauthorized } from "@/lib/server/auth";
import { assertSessionOwnership } from "@/lib/server/ownership";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const owned = await assertSessionOwnership(id, user.id);
  if (!owned) return notFound();

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "200");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(1, Math.trunc(limitParam)), 500) : 200;

  const messages = await prisma.contentChatMessage.findMany({
    where: { sessionId: owned },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      contentType: true,
      provider: true,
      model: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}
