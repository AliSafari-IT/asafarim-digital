import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, AuthorizationError } from "@/lib/authorization";

export async function GET() {
  try {
    await requirePermission("roles.view");

    const permissions = await prisma.permission.findMany({
      orderBy: [{ group: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        group: true,
      },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
