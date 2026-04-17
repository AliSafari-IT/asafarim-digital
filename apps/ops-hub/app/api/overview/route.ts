import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";

export async function GET() {
  try {
    await requireOps("read");
    const [tenantsByStatus, mrr, planMix, openInvoices, recentEvents] = await Promise.all([
      prisma.tenant.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.tenant.aggregate({ _sum: { mrrCents: true }, where: { status: { in: ["active", "past_due"] } } }),
      prisma.tenant.groupBy({ by: ["plan"], _count: { _all: true }, _sum: { mrrCents: true } }),
      prisma.invoice.aggregate({ _sum: { amountCents: true }, _count: { _all: true }, where: { status: "open" } }),
      prisma.lifecycleEvent.findMany({
        orderBy: { occurredAt: "desc" },
        take: 20,
        include: { tenant: { select: { name: true, slug: true } } },
      }),
    ]);
    return NextResponse.json({
      tenantsByStatus,
      mrrCents: mrr._sum.mrrCents ?? 0,
      planMix,
      openInvoices: { totalCents: openInvoices._sum.amountCents ?? 0, count: openInvoices._count._all },
      recentEvents,
    });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
