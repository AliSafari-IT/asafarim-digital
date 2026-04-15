import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, AuthorizationError } from "@/lib/authorization";

export async function GET(request: Request) {
  try {
    await requirePermission("audit.view");

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "30")));
    const entity = url.searchParams.get("entity");
    const action = url.searchParams.get("action");

    const where: Record<string, unknown> = {};
    if (entity) where.entity = entity;
    if (action) where.action = { contains: action, mode: "insensitive" };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          changes: true,
          ipAddress: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
