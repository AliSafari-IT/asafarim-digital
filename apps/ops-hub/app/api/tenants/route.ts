import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await requireOps("read");
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const plan = url.searchParams.get("plan");
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (plan) where.plan = plan;
    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: { mrrCents: "desc" },
      select: {
        id: true, name: true, slug: true, plan: true, status: true,
        mrrCents: true, seats: true, region: true, industry: true, createdAt: true,
      },
    });
    return NextResponse.json({ tenants });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
