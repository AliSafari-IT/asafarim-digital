import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("roles.edit");
    const { id } = await params;
    const body = await req.json();

    const role = await prisma.role.findUnique({ where: { id }, select: { id: true, isSystem: true, name: true } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    if (role.isSystem && body.name && body.name !== role.name) {
      return NextResponse.json({ error: "Cannot rename system roles" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.displayName !== undefined) data.displayName = body.displayName.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;

    if (body.isDefault !== undefined) {
      if (body.isDefault) {
        await prisma.role.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
      }
      data.isDefault = Boolean(body.isDefault);
    }

    // Update permissions if provided
    if (Array.isArray(body.permissionIds)) {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (body.permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: body.permissionIds.map((pid: string) => ({ roleId: id, permissionId: pid })),
        });
      }
    }

    const updated = await prisma.role.update({
      where: { id },
      data,
      include: {
        rolePermissions: { select: { permission: { select: { id: true, name: true, displayName: true } } } },
        _count: { select: { userRoles: true } },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "role.updated",
      entity: "Role",
      entityId: id,
      changes: { ...data, permissionIds: body.permissionIds },
    });

    return NextResponse.json({ role: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Role update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("roles.edit");
    const { id } = await params;

    const role = await prisma.role.findUnique({ where: { id }, select: { id: true, isSystem: true, name: true } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    if (role.isSystem) return NextResponse.json({ error: "Cannot delete system roles" }, { status: 400 });

    await prisma.role.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: "role.deleted",
      entity: "Role",
      entityId: id,
      changes: { name: role.name },
    });

    return NextResponse.json({ message: "Role deleted" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
