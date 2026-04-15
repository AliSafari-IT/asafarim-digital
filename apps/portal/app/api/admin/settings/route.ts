import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function GET() {
  try {
    await requirePermission("settings.list");

    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await requirePermission("settings.edit");
    const body = await req.json();

    if (!body.key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key: body.key },
      update: {
        value: body.value,
        displayName: body.displayName ?? undefined,
        description: body.description ?? undefined,
        group: body.group ?? undefined,
      },
      create: {
        key: body.key,
        value: body.value,
        displayName: body.displayName || null,
        description: body.description || null,
        group: body.group ?? "general",
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "setting.updated",
      entity: "SiteSetting",
      entityId: setting.id,
      changes: { key: body.key, value: body.value },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
