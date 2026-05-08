import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { renderQueue } from "@/lib/server/queue";
import { safeParseManifest } from "@/lib/server/render-manifest";

export const runtime = "nodejs";

function toRenderMode(mode: string | null): "cinematic" | "slideshow" | "social" {
  if (mode === "slideshow") return "slideshow";
  return "cinematic";
}

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
      select: { id: true, locale: true, mode: true, aspectRatio: true, resolution: true },
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

    if (!manifest) {
      const [assets, latestScript, narrationPreference] = await Promise.all([
        prisma.viontoAsset.findMany({
          where: { projectId: project.id, type: "source_image", storageKey: { not: null } },
          orderBy: { orderIndex: "asc" },
          select: { storageKey: true, width: true, height: true },
        }),
        prisma.viontoScript.findFirst({
          where: { projectId: project.id, userId: user.id },
          orderBy: { updatedAt: "desc" },
          select: { narrationText: true, srtText: true },
        }),
        prisma.viontoAudioTrack.findFirst({
          where: { projectId: project.id, userId: user.id, type: "narration", source: "tts", voiceId: { not: null } },
          orderBy: { updatedAt: "desc" },
          select: { voiceId: true, voiceName: true },
        }),
      ]);

      const generatedManifest = {
        projectId: project.id,
        userId: user.id,
        jobId: job.id,
        mode: toRenderMode(project.mode),
        aspectRatio: project.aspectRatio ?? "16:9",
        resolution: project.resolution ?? "1080p",
        assets: assets.map((asset) => ({
          storageKey: asset.storageKey,
          width: asset.width ?? undefined,
          height: asset.height ?? undefined,
        })),
        narrationText: latestScript?.narrationText ?? undefined,
        srtText: latestScript?.srtText ?? undefined,
        audioTracks: narrationPreference?.voiceId
          ? [{
              type: "narration",
              voiceId: narrationPreference.voiceId,
              voiceName: narrationPreference.voiceName ?? undefined,
            }]
          : [],
      };

      const parsed = safeParseManifest(generatedManifest);
      if (!parsed.success) {
        await prisma.viontoRenderJob.delete({ where: { id: job.id } }).catch(() => null);
        return badRequest(`Project is not ready to render: ${parsed.error.message}`);
      }
      manifest = parsed.data;
    }

    // Queue in BullMQ
    await renderQueue.add("vionto-render", {
      jobId: job.id,
      manifest,
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
