import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function GET() {
  try {
    await requirePermission("roles.list");

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        isSystem: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { userRoles: true, rolePermissions: true } },
        rolePermissions: {
          select: {
            permission: { select: { id: true, name: true, displayName: true, group: true } },
          },
        },
      },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requirePermission("roles.edit");
    const { name, displayName, description, isDefault, permissionIds } = await req.json();

    if (!name || !displayName) {
      return NextResponse.json({ error: "name and displayName are required" }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");

    const existing = await prisma.role.findUnique({ where: { name: slug } });
    if (existing) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.role.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }

    const role = await prisma.role.create({
      data: {
        name: slug,
        displayName: displayName.trim(),
        description: description?.trim() || null,
        isDefault: Boolean(isDefault),
        rolePermissions: permissionIds?.length
          ? { create: permissionIds.map((pid: string) => ({ permissionId: pid })) }
          : undefined,
      },
      include: {
        rolePermissions: { select: { permission: { select: { id: true, name: true } } } },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "role.created",
      entity: "Role",
      entityId: role.id,
      changes: { name: slug, displayName, permissionIds },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Role creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
