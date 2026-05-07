import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";

export const runtime = "nodejs";

/**
 * GET /api/audio/tracks?projectId={pid}
 *
 * List audio tracks for a project.
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return badRequest("projectId query parameter is required.");
    }

    const project = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true },
    });
    if (!project) {
      return badRequest("Project not found.");
    }

    const tracks = await prisma.viontoAudioTrack.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: tracks });
  } catch (error) {
    return serverError("audio/tracks", error);
  }
}

/**
 * POST /api/audio/tracks
 *
 * Create an audio track for a project.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const projectId = body.projectId;
    if (typeof projectId !== "string" || !projectId) {
      return badRequest("projectId is required.");
    }

    const project = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true },
    });
    if (!project) {
      return badRequest("Project not found.");
    }

    const track = await prisma.viontoAudioTrack.create({
      data: {
        projectId,
        userId: user.id,
        type: String(body.type ?? "narration"),
        source: String(body.source ?? "upload"),
        storageKey: typeof body.storageKey === "string" ? body.storageKey : null,
        voiceId: typeof body.voiceId === "string" ? body.voiceId : null,
        voiceName: typeof body.voiceName === "string" ? body.voiceName : null,
        durationSeconds: typeof body.durationSeconds === "number" ? body.durationSeconds : null,
        mixSettings: body.mixSettings ?? {},
      },
    });

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    return serverError("audio/tracks", error);
  }
}
