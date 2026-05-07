import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { updateProjectSchema, formatZodError } from "@/lib/server/validation";

export const runtime = "nodejs";

async function getProject(projectId: string, userId: string) {
  return prisma.viontoProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      mode: true,
      locale: true,
      aspectRatio: true,
      resolution: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { assets: true, scripts: true, exports: true } },
    },
  });
}

/** GET /api/projects/[projectId] — get project detail */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    const project = await getProject(projectId, user.id);
    if (!project) {
      return badRequest("Project not found.");
    }

    return NextResponse.json(project);
  } catch (error) {
    return serverError("projects/[projectId]", error);
  }
}

/** PUT /api/projects/[projectId] — update project */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    const existing = await getProject(projectId, user.id);
    if (!existing) {
      return badRequest("Project not found.");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error));
    }

    const updated = await prisma.viontoProject.update({
      where: { id: projectId },
      data: parsed.data,
      select: {
        id: true,
        title: true,
        description: true,
        mode: true,
        locale: true,
        aspectRatio: true,
        resolution: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return serverError("projects/[projectId]", error);
  }
}

/** DELETE /api/projects/[projectId] — delete project */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    const existing = await getProject(projectId, user.id);
    if (!existing) {
      return badRequest("Project not found.");
    }

    await prisma.viontoProject.delete({ where: { id: projectId } });

    return NextResponse.json({ id: projectId, deleted: true });
  } catch (error) {
    return serverError("projects/[projectId]", error);
  }
}
