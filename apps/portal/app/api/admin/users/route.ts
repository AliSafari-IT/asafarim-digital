import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function GET(request: Request) {
  try {
    const { user } = await requirePermission("users.list");

    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));
    const isActive = url.searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          emailVerified: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          userRoles: { select: { role: { select: { id: true, name: true, displayName: true } } } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
