import { NextResponse } from "next/server";
import { Prisma, prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import { renderQueue } from "@/lib/server/queue";
import { safeParseManifest, subtitleConfigSchema, type RenderAsset, type SubtitleStyle, type SubtitleConfig } from "@/lib/server/render-manifest";
import { fetchPixabayMusicByCategory, selectTrackByDuration } from "@/lib/server/pixabay-music";
import { analyzeProjectForPacing, applyPacingToAssets } from "@/lib/server/smart-pacing";
import { DEFAULT_VISUAL_STYLE, normalizeVisualStyle, type VisualStyle } from "@/lib/visual-styles";
import { getSubtitlePresetStyle, DEFAULT_SUBTITLE_PRESET } from "@/lib/subtitle-presets";

export const runtime = "nodejs";

function toRenderMode(mode: string | null): "cinematic" | "slideshow" | "social" {
  if (mode === "slideshow") return "slideshow";
  if (mode === "documentary") return "social";
  return "cinematic";
}

type ProjectMusicTrack = {
  trackId?: string;
  provider?: string;
  downloadUrl?: string;
  storageKey?: string;
  duration?: number;
  [key: string]: unknown;
};

function getProjectMusicTracks(metadata: Prisma.JsonValue | null): ProjectMusicTrack[] {
  if (Array.isArray(metadata)) {
    return metadata
      .filter((track) => !!track && typeof track === "object" && !Array.isArray(track))
      .map((track) => track as ProjectMusicTrack);
  }

  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return [metadata as ProjectMusicTrack];
  }

  return [];
}

function isRenderableMusicTrack(track: ProjectMusicTrack): boolean {
  return typeof track.storageKey === "string" || (
    typeof track.downloadUrl === "string" && /^https?:\/\//i.test(track.downloadUrl)
  );
}

function resolveSubtitleConfig(
  projectSettings: unknown,
  visualStyle: VisualStyle,
  aspectRatio: string
): { style: SubtitleStyle; timing: SubtitleConfig["timing"]; exportOpts: SubtitleConfig["export"]; enabled: boolean } {
  const parsed = subtitleConfigSchema.safeParse(projectSettings ?? {});
  const config = parsed.success ? parsed.data : subtitleConfigSchema.parse({});

  let style = config.style;

  if (!projectSettings) {
    const presetStyle = getSubtitlePresetStyle(config.presetId as any);
    style = { ...presetStyle };

    const isPortrait = aspectRatio === "9:16";
    if (visualStyle === "social_vertical_captions") {
      style.fontSize = isPortrait ? 44 : 34;
      style.outlineWidth = 4;
      style.position = "center";
      style.marginV = isPortrait ? 110 : 70;
    } else if (visualStyle === "wedding_cinematic") {
      style.fontName = "Georgia";
      style.fontSize = 30;
    } else if (visualStyle === "vhs_archive") {
      style.fontName = "Courier New";
      style.fontSize = 26;
    } else if (visualStyle === "polaroid_memory") {
      style.fontName = "Georgia";
      style.fontSize = 28;
    }
  }

  return { style, timing: config.timing, exportOpts: config.export, enabled: config.enabled };
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
      select: { id: true, locale: true, mode: true, aspectRatio: true, resolution: true, visualStyle: true, musicOption: true, musicTrackId: true, musicMetadata: true, musicUploadKey: true, emotionalTone: true, storyMode: true, subtitleSettings: true, targetDurationSeconds: true },
    });
    if (!project) {
      return badRequest("Project not found.");
    }

    console.log("[render] Project fetched:", {
      id: project.id,
      musicOption: project.musicOption,
      musicMetadata: project.musicMetadata,
      musicUploadKey: project.musicUploadKey,
      musicTrackId: project.musicTrackId,
      visualStyle: project.visualStyle,
    });

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
      const [assets, scripts, audioTracks] = await Promise.all([
        prisma.viontoAsset.findMany({
          where: { projectId: project.id, type: "source_image", storageKey: { not: null } },
          orderBy: { orderIndex: "asc" },
          select: { storageKey: true, width: true, height: true },
        }),
        prisma.viontoScript.findMany({
          where: { projectId: project.id, userId: user.id },
          orderBy: { updatedAt: "desc" },
          select: { narrationText: true, srtText: true },
          take: 20,
        }),
        prisma.viontoAudioTrack.findMany({
          where: { projectId: project.id, userId: user.id },
          orderBy: { updatedAt: "desc" },
          select: {
            type: true,
            storageKey: true,
            voiceId: true,
            voiceName: true,
            mixSettings: true,
          },
        }),
      ]);

      if (assets.length === 0) {
        await prisma.viontoRenderJob.delete({ where: { id: job.id } }).catch(() => null);
        return badRequest("Upload at least one project image before rendering.");
      }
      const latestScript = scripts.find((script) => script.narrationText?.trim());
      if (!latestScript) {
        await prisma.viontoRenderJob.delete({ where: { id: job.id } }).catch(() => null);
        return badRequest("Generate or save a narration script before rendering.");
      }
      const narrationTrack = audioTracks.find((track) => track.type === "narration" && (track.voiceId || track.storageKey));
      if (!narrationTrack) {
        await prisma.viontoRenderJob.delete({ where: { id: job.id } }).catch(() => null);
        return badRequest("Select a narration voice before rendering.");
      }

      // Resolve the target duration. Project value is authoritative; fall back to
      // a simple per-asset heuristic only when the field has never been set.
      const DEFAULT_DURATION_SECONDS = 30;
      const projectTargetDuration = project.targetDurationSeconds ?? DEFAULT_DURATION_SECONDS;

      // Run smart pacing analysis
      let pacingAssets: RenderAsset[] = assets.map((asset) => ({
        storageKey: asset.storageKey!,
        width: asset.width ?? undefined,
        height: asset.height ?? undefined,
        durationSeconds: projectTargetDuration / assets.length,
      }));
      let targetDurationSeconds = projectTargetDuration;

      try {
        const pacingResult = await analyzeProjectForPacing(
          project.id,
          project.emotionalTone || "nostalgic",
          project.storyMode || "memory_film",
          {
            targetTotalDurationSeconds: projectTargetDuration,
          }
        );

        console.log("[render] Smart pacing summary:", pacingResult.summary);

        // Apply pacing to assets; keep targetDurationSeconds as the project-level
        // contract even if the pacing plan's sum differs slightly.
        pacingAssets = applyPacingToAssets(
          assets.map((a) => ({ storageKey: a.storageKey!, width: a.width ?? undefined, height: a.height ?? undefined })),
          pacingResult.pacingPlan
        );

        // Honour the project target duration; do not let smart pacing drift it.
        targetDurationSeconds = projectTargetDuration;
      } catch (error) {
        console.error("[render] Smart pacing analysis failed, using defaults:", error);
        // Continue with default pacing if analysis fails
      }

      // Handle music selection
      let musicTracks: Array<Record<string, unknown>> = [];
      console.log("[render] Music option:", project.musicOption);
      console.log("[render] Music metadata:", JSON.stringify(project.musicMetadata));
      console.log("[render] Music upload key:", project.musicUploadKey);

      if (project.musicOption && project.musicOption !== "no_music") {
        const selectedMusicTracks = getProjectMusicTracks(project.musicMetadata);
        console.log("[render] Selected music tracks:", selectedMusicTracks);

        const renderableMusicTracks = selectedMusicTracks.filter(isRenderableMusicTrack);
        console.log("[render] Renderable music tracks:", renderableMusicTracks);

        if (renderableMusicTracks.length > 0) {
          musicTracks = renderableMusicTracks.map((track, index) => ({
            type: "music",
            provider: track.provider,
            storageKey: track.storageKey,
            downloadUrl: track.downloadUrl,
            metadata: track,
            startOffsetSeconds: index === 0
              ? 0
              : renderableMusicTracks
                  .slice(0, index)
                  .reduce((offset, previous) => offset + (typeof previous.duration === "number" ? previous.duration : 0), 0),
          }));
          console.log("[render] Using music tracks from metadata:", musicTracks);
        } else if (project.musicOption === "upload_own" && project.musicUploadKey) {
          // User-uploaded music
          musicTracks = [{
            type: "music",
            storageKey: project.musicUploadKey,
            metadata: project.musicMetadata,
          }];
          console.log("[render] Using music from upload key:", musicTracks);
        } else if (["calm_piano", "cinematic_strings", "travel_upbeat", "family_warm_acoustic"].includes(project.musicOption)) {
          // Fetch from Pixabay based on category
          try {
            const tracks = await fetchPixabayMusicByCategory(project.musicOption, 10);
            const selectedTrack = selectTrackByDuration(tracks, projectTargetDuration);
            if (selectedTrack) {
              musicTracks = [{
                type: "music",
                provider: "pixabay",
                downloadUrl: selectedTrack.downloadUrl,
                metadata: selectedTrack,
              }];
              // Update project with selected track metadata
              await prisma.viontoProject.update({
                where: { id: project.id },
                data: {
                  musicTrackId: selectedTrack.trackId ?? undefined,
                  musicMetadata: [selectedTrack] as Prisma.InputJsonValue,
                },
              }).catch(() => null);
            }
          } catch (error) {
            console.error("[render] Failed to fetch Pixabay music:", error);
            // Continue without music if Pixabay fails
          }
        }
      }

      const subtitleConfig = resolveSubtitleConfig(
        project.subtitleSettings,
        normalizeVisualStyle(project.visualStyle ?? DEFAULT_VISUAL_STYLE),
        project.aspectRatio ?? "16:9"
      );

      const generatedManifest = {
        projectId: project.id,
        userId: user.id,
        jobId: job.id,
        mode: toRenderMode(project.mode),
        visualStyle: normalizeVisualStyle(project.visualStyle ?? DEFAULT_VISUAL_STYLE),
        targetDurationSeconds: targetDurationSeconds,
        aspectRatio: project.aspectRatio ?? "16:9",
        resolution: project.resolution ?? "1080p",
        assets: pacingAssets.map((asset) => ({
          storageKey: asset.storageKey,
          width: asset.width ?? undefined,
          height: asset.height ?? undefined,
          durationSeconds: asset.durationSeconds,
          motion: asset.motion,
          transition: asset.transition,
        })),
        narrationText: latestScript?.narrationText ?? undefined,
        srtText: latestScript?.srtText ?? undefined,
        burnSubtitles: subtitleConfig.enabled && subtitleConfig.exportOpts.burnIn,
        subtitleStyle: subtitleConfig.style,
        subtitleTiming: subtitleConfig.timing,
        subtitleExport: subtitleConfig.exportOpts,
        audioTracks: [
          ...audioTracks
            .filter((track) => track.storageKey || track.voiceId)
            .map((track) => {
              const mixSettings = typeof track.mixSettings === "object" && track.mixSettings !== null && !Array.isArray(track.mixSettings)
                ? track.mixSettings as Record<string, unknown>
                : {};
              return {
                type: track.type,
                storageKey: track.storageKey ?? undefined,
                voiceId: track.voiceId ?? undefined,
                voiceName: track.voiceName ?? undefined,
                volume: typeof mixSettings.volume === "number" ? mixSettings.volume : undefined,
                fadeInSeconds: typeof mixSettings.fadeInSeconds === "number" ? mixSettings.fadeInSeconds : undefined,
                fadeOutSeconds: typeof mixSettings.fadeOutSeconds === "number" ? mixSettings.fadeOutSeconds : undefined,
                startOffsetSeconds: typeof mixSettings.startOffsetSeconds === "number" ? mixSettings.startOffsetSeconds : undefined,
                duckGainDuringNarration: typeof mixSettings.duckGainDuringNarration === "number" ? mixSettings.duckGainDuringNarration : undefined,
              };
            }),
          ...musicTracks,
        ],
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
