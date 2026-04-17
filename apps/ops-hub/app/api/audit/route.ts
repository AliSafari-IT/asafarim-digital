import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await requireOps("read");
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const where: Record<string, unknown> = {};
    if (entity) where.entity = entity;
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ logs });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
