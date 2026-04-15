import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("content.edit");
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.siteContent.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedBy: user.id };
    const fields = ["title", "subtitle", "eyebrow", "body", "metadata", "position", "isPublished"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const updated = await prisma.siteContent.update({ where: { id }, data });

    await createAuditLog({
      userId: user.id,
      action: body.isPublished !== undefined ? "content.publish_toggled" : "content.updated",
      entity: "SiteContent",
      entityId: id,
      changes: data,
    });

    return NextResponse.json({ content: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Content update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("content.delete");
    const { id } = await params;

    const existing = await prisma.siteContent.findUnique({ where: { id }, select: { id: true, section: true } });
    if (!existing) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    await prisma.siteContent.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: "content.deleted",
      entity: "SiteContent",
      entityId: id,
      changes: { section: existing.section },
    });

    return NextResponse.json({ message: "Content deleted" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
