import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";
import { logOpsAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOps("write");
    const { id } = await params;
    const { isEnabled } = (await req.json()) as { isEnabled?: boolean };
    if (typeof isEnabled !== "boolean") {
      return NextResponse.json({ error: "isEnabled required" }, { status: 400 });
    }

    const before = await prisma.automation.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const automation = await prisma.automation.update({
      where: { id },
      data: { isEnabled },
    });

    await logOpsAudit({
      userId: session.userId,
      action: "automation.toggle",
      entity: "Automation",
      entityId: automation.id,
      changes: { before: { isEnabled: before.isEnabled }, after: { isEnabled } },
    });

    return NextResponse.json(automation);
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
