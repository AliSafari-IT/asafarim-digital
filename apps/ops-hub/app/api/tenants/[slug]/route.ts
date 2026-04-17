import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";
import { logOpsAudit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireOps("read");
    const { slug } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        subscriptions: { include: { plan: true } },
        featureOverrides: { include: { flag: true } },
        lifecycleEvents: { orderBy: { occurredAt: "desc" }, take: 20 },
      },
    });
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tenant);
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireOps("write");
    const { slug } = await params;
    const body = (await req.json()) as { status?: string; plan?: string; seats?: number };
    const before = await prisma.tenant.findUnique({ where: { slug } });
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const tenant = await prisma.tenant.update({
      where: { slug },
      data: {
        status: body.status ?? undefined,
        plan: body.plan ?? undefined,
        seats: typeof body.seats === "number" ? body.seats : undefined,
      },
    });

    await logOpsAudit({
      userId: session.userId,
      action: "tenant.update",
      entity: "Tenant",
      entityId: tenant.id,
      changes: { before: { status: before.status, plan: before.plan, seats: before.seats }, after: body },
    });

    return NextResponse.json(tenant);
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
