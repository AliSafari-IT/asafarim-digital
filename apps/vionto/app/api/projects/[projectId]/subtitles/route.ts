import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { subtitleConfigSchema } from "@/lib/server/render-manifest";

export const runtime = "nodejs";

/** GET /api/projects/[projectId]/subtitles — load subtitle settings. */
export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    const project = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { subtitleSettings: true },
    });
    if (!project) return badRequest("Project not found.");

    const parsed = subtitleConfigSchema.safeParse(project.subtitleSettings ?? {});
    return NextResponse.json(parsed.success ? parsed.data : subtitleConfigSchema.parse({}));
  } catch (error) {
    return serverError("get subtitle settings", error);
  }
}

/** PUT /api/projects/[projectId]/subtitles — save subtitle settings. */
export async function PUT(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { projectId } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const parsed = subtitleConfigSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(`Invalid subtitle config: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    }

    const project = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true },
    });
    if (!project) return badRequest("Project not found.");

    await prisma.viontoProject.update({
      where: { id: projectId },
      data: { subtitleSettings: parsed.data as any },
    });

    return NextResponse.json(parsed.data);
  } catch (error) {
    return serverError("save subtitle settings", error);
  }
}
