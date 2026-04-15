import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("navigation.edit");
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.navItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Nav item not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    const fields = ["label", "href", "position", "visibility", "requiredRole", "parentId", "isActive", "icon", "target", "group"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const updated = await prisma.navItem.update({ where: { id }, data });

    await createAuditLog({
      userId: user.id,
      action: "navigation.updated",
      entity: "NavItem",
      entityId: id,
      changes: data,
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("navigation.edit");
    const { id } = await params;

    const existing = await prisma.navItem.findUnique({ where: { id }, select: { id: true, label: true } });
    if (!existing) return NextResponse.json({ error: "Nav item not found" }, { status: 404 });

    await prisma.navItem.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: "navigation.deleted",
      entity: "NavItem",
      entityId: id,
      changes: { label: existing.label },
    });

    return NextResponse.json({ message: "Nav item deleted" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
