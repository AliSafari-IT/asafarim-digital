import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function GET() {
  try {
    await requirePermission("navigation.list");

    const items = await prisma.navItem.findMany({
      orderBy: [{ group: "asc" }, { position: "asc" }],
      include: { children: { orderBy: { position: "asc" } } },
    });

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requirePermission("navigation.edit");
    const body = await req.json();

    if (!body.label || !body.href) {
      return NextResponse.json({ error: "label and href are required" }, { status: 400 });
    }

    const item = await prisma.navItem.create({
      data: {
        label: body.label.trim(),
        href: body.href.trim(),
        position: body.position ?? 0,
        visibility: body.visibility ?? "public",
        requiredRole: body.requiredRole || null,
        parentId: body.parentId || null,
        isActive: body.isActive ?? true,
        icon: body.icon || null,
        target: body.target ?? "_self",
        group: body.group ?? "main",
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "navigation.created",
      entity: "NavItem",
      entityId: item.id,
      changes: { label: body.label, href: body.href },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Navigation creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
