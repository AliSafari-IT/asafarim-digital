import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("users.view");
    const { id } = await params;

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        emailVerified: true,
        image: true,
        isActive: true,
        deactivatedAt: true,
        jobTitle: true,
        company: true,
        website: true,
        location: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            id: true,
            assignedAt: true,
            assignedBy: true,
            role: { select: { id: true, name: true, displayName: true } },
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: target });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePermission("users.edit");
    const { id } = await params;
    const body = await req.json();

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, isActive: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allowedFields = ["name", "jobTitle", "company", "website", "location", "bio", "image"];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = typeof body[field] === "string" ? body[field].trim() || null : body[field];
      }
    }

    // Handle activation/deactivation
    if (body.isActive !== undefined) {
      const { permissions } = await requirePermission("users.deactivate");
      data.isActive = Boolean(body.isActive);
      data.deactivatedAt = body.isActive ? null : new Date();
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "user.updated",
      entity: "User",
      entityId: id,
      changes: data,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("User update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
