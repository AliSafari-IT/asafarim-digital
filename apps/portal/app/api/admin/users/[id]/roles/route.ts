import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("roles.assign");
    const { id } = await params;
    const { roleId } = await req.json();

    if (!roleId) {
      return NextResponse.json({ error: "roleId is required" }, { status: 400 });
    }

    const [targetUser, role] = await Promise.all([
      prisma.user.findUnique({ where: { id }, select: { id: true } }),
      prisma.role.findUnique({ where: { id: roleId }, select: { id: true, name: true } }),
    ]);

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: id, roleId } },
    });

    if (existing) {
      return NextResponse.json({ error: "User already has this role" }, { status: 409 });
    }

    await prisma.userRole.create({
      data: { userId: id, roleId, assignedBy: user.id },
    });

    await createAuditLog({
      userId: user.id,
      action: "role.assigned",
      entity: "UserRole",
      entityId: id,
      changes: { roleId, roleName: role.name },
    });

    return NextResponse.json({ message: "Role assigned successfully" }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Role assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("roles.assign");
    const { id } = await params;
    const url = new URL(req.url);
    const roleId = url.searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json({ error: "roleId query parameter is required" }, { status: 400 });
    }

    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: id, roleId } },
      select: { id: true, role: { select: { name: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "User does not have this role" }, { status: 404 });
    }

    await prisma.userRole.delete({
      where: { userId_roleId: { userId: id, roleId } },
    });

    await createAuditLog({
      userId: user.id,
      action: "role.removed",
      entity: "UserRole",
      entityId: id,
      changes: { roleId, roleName: existing.role.name },
    });

    return NextResponse.json({ message: "Role removed successfully" });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Role removal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
