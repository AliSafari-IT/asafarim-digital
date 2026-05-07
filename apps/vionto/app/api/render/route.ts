import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { renderQueue } from "@/lib/server/queue";
import { safeParseManifest } from "@/lib/server/render-manifest";

export const runtime = "nodejs";

/** POST /api/render — queue a new render job. */
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    // Ensure project ownership
    const projectId = (body as Record<string, unknown>)?.projectId;
    if (typeof projectId !== "string" || !projectId) {
      return badRequest("projectId is required.");
    }

    const project = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true, locale: true, mode: true, aspectRatio: true },
    });
    if (!project) {
      return badRequest("Project not found.");
    }

    // Validate manifest if provided; otherwise build a minimal one
    let manifest = (body as Record<string, unknown>)?.manifest;
    if (manifest) {
      const parsed = safeParseManifest(manifest);
      if (!parsed.success) {
        return badRequest(`Invalid render manifest: ${parsed.error.message}`);
      }
      manifest = parsed.data;
    }

    // Create render job row
    const job = await prisma.viontoRenderJob.create({
      data: {
        projectId: project.id,
        userId: user.id,
        state: "queued",
        progressPercent: 0,
      },
    });

    // Queue in BullMQ
    await renderQueue.add("vionto-render", {
      jobId: job.id,
      manifest: manifest ?? { projectId: project.id, userId: user.id, assets: [] },
    });

    return NextResponse.json({
      jobId: job.id,
      state: job.state,
      queueId: job.id,
    });
  } catch (error) {
    return serverError("render", error);
  }
}
