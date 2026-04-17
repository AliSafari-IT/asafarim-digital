import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";

export async function GET() {
  try {
    await requireOps("read");
    const flags = await prisma.featureFlag.findMany({
      orderBy: [{ category: "asc" }, { code: "asc" }],
      include: { _count: { select: { overrides: true } } },
    });
    return NextResponse.json({ flags });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
