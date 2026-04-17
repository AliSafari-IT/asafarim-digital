import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";
import { logOpsAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOps("write");
    const { id } = await params;
    const { defaultEnabled, rolloutPercent } = (await req.json()) as {
      defaultEnabled?: boolean;
      rolloutPercent?: number;
    };

    const before = await prisma.featureFlag.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: {
        defaultEnabled: typeof defaultEnabled === "boolean" ? defaultEnabled : undefined,
        rolloutPercent: typeof rolloutPercent === "number" ? Math.max(0, Math.min(100, rolloutPercent)) : undefined,
      },
    });

    await logOpsAudit({
      userId: session.userId,
      action: "feature_flag.toggle",
      entity: "FeatureFlag",
      entityId: flag.id,
      changes: {
        before: { defaultEnabled: before.defaultEnabled, rolloutPercent: before.rolloutPercent },
        after: { defaultEnabled: flag.defaultEnabled, rolloutPercent: flag.rolloutPercent },
      },
    });

    return NextResponse.json(flag);
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
