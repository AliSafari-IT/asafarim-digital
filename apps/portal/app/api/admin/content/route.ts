import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requirePermission, createAuditLog, AuthorizationError } from "@/lib/authorization";

export async function GET() {
  try {
    await requirePermission("content.list");

    const content = await prisma.siteContent.findMany({
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requirePermission("content.create");
    const body = await req.json();

    if (!body.section) {
      return NextResponse.json({ error: "section is required" }, { status: 400 });
    }

    const existing = await prisma.siteContent.findUnique({ where: { section: body.section } });
    if (existing) {
      return NextResponse.json({ error: "A section with this key already exists" }, { status: 409 });
    }

    const content = await prisma.siteContent.create({
      data: {
        section: body.section.trim(),
        title: body.title?.trim() || null,
        subtitle: body.subtitle?.trim() || null,
        eyebrow: body.eyebrow?.trim() || null,
        body: body.body ?? null,
        metadata: body.metadata ?? null,
        position: body.position ?? 0,
        isPublished: body.isPublished ?? false,
        updatedBy: user.id,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "content.created",
      entity: "SiteContent",
      entityId: content.id,
      changes: { section: body.section },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Content creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
