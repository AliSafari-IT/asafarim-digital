/**
 * FFmpeg command builder for Vionto renders.
 *
 * Generates deterministic pan/zoom Ken Burns presets, transition filters,
 * subtitle burn-in, and audio mixing for cinematic / slideshow / social modes.
 */

import type { RenderManifest, RenderAsset, MotionPreset, TransitionPreset, SubtitleStyle } from "./render-manifest";

export type FFmpegStage =
  | "prepare"
  | "tts"
  | "images"
  | "transitions"
  | "audio_mix"
  | "subtitles"
  | "encode"
  | "upload"
  | "done";

export type FFmpegProgress = {
  stage: FFmpegStage;
  percent: number;
};

/** Resolution map for FFmpeg scale filter. */
const RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 },
};

/** Deterministic motion presets per asset index (cycling). */
export function pickMotionPreset(index: number, mode: RenderManifest["mode"]): MotionPreset {
  const cinematicCycle: MotionPreset["name"][] = ["ken_burns", "pan_left", "zoom_in", "pan_right", "zoom_out"];
  const slideshowCycle: MotionPreset["name"][] = ["static", "static", "static", "static"];
  const socialCycle: MotionPreset["name"][] = ["zoom_in", "zoom_out", "ken_burns"];

  const cycle = mode === "cinematic" ? cinematicCycle : mode === "slideshow" ? slideshowCycle : socialCycle;
  const name = cycle[index % cycle.length];

  if (name === "ken_burns") {
    return { name, startScale: 1, endScale: 1.15, startX: -0.05, endX: 0.05, startY: -0.03, endY: 0.03, durationSeconds: 5 };
  }
  if (name === "pan_left") {
    return { name, startScale: 1.05, endScale: 1.05, startX: 0.05, endX: -0.05, startY: 0, endY: 0, durationSeconds: 5 };
  }
  if (name === "pan_right") {
    return { name, startScale: 1.05, endScale: 1.05, startX: -0.05, endX: 0.05, startY: 0, endY: 0, durationSeconds: 5 };
  }
  if (name === "zoom_in") {
    return { name, startScale: 1, endScale: 1.2, startX: 0, endX: 0, startY: 0, endY: 0, durationSeconds: 5 };
  }
  if (name === "zoom_out") {
    return { name, startScale: 1.2, endScale: 1, startX: 0, endX: 0, startY: 0, endY: 0, durationSeconds: 5 };
  }
  return { name: "static", startScale: 1, endScale: 1, startX: 0, endX: 0, startY: 0, endY: 0, durationSeconds: 5 };
}

/** Deterministic transition preset per pair index. */
export function pickTransitionPreset(index: number, mode: RenderManifest["mode"]): TransitionPreset {
  const cinematic: TransitionPreset["name"][] = ["fade", "crossfade", "fade", "crossfade"];
  const slideshow: TransitionPreset["name"][] = ["fade", "none", "fade", "none"];
  const social: TransitionPreset["name"][] = ["slide_left", "slide_right", "fade"];
  const cycle = mode === "cinematic" ? cinematic : mode === "slideshow" ? slideshow : social;
  return { name: cycle[index % cycle.length], durationSeconds: mode === "social" ? 0.3 : 0.5 };
}

/** Build FFmpeg zoompan expression from a motion preset. */
function buildZoompanExpr(motion: MotionPreset, frameRate: number, totalFrames: number): { zExpr: string; xExpr: string; yExpr: string } {
  const frames = Math.max(1, totalFrames);
  const t = "on";
  const z0 = motion.startScale;
  const z1 = motion.endScale;
  const x0 = motion.startX;
  const x1 = motion.endX;
  const y0 = motion.startY;
  const y1 = motion.endY;

  const zExpr = `${z0}+(${z1}-${z0})*${t}/${frames}`;
  const xExpr = `(iw-iw/${z0}-(iw-iw/${z1})*${t}/${frames})*(${x0}+(${x1}-${x0})*${t}/${frames})`;
  const yExpr = `(ih-ih/${z0}-(ih-ih/${z1})*${t}/${frames})*(${y0}+(${y1}-${y0})*${t}/${frames})`;

  return { zExpr, xExpr, yExpr };
}

/** Build a single image-to-video segment command (no transitions). */
function buildImageSegmentCmd(
  asset: RenderAsset,
  motion: MotionPreset,
  resolution: string,
  frameRate: number,
  outputPath: string
): string[] {
  const res = RESOLUTION_MAP[resolution] ?? RESOLUTION_MAP["1080p"];
  const duration = asset.durationSeconds ?? motion.durationSeconds;
  const totalFrames = Math.max(1, Math.round(duration * frameRate));
  const { zExpr, xExpr, yExpr } = buildZoompanExpr(motion, frameRate, totalFrames);

  // zoompan outputs at 1fps by default; we use fps filter after it
  return [
    "-framerate", String(frameRate),
    "-loop", "1",
    "-i", asset.storageKey,
    "-vf",
    `scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease,pad=${res.width}:${res.height}:(ow-iw)/2:(oh-ih)/2:black,zoompan=z='${zExpr}':x='${xExpr}':y='${yExpr}':d=${totalFrames}:s=${res.width}x${res.height},fps=${frameRate}`,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-t", String(duration),
    "-an",
    "-y",
    outputPath,
  ];
}

/** Build the concat demuxer file list for transitions. */
function buildConcatList(segmentPaths: string[], listPath: string): string {
  const lines = segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  return lines;
}

/** Build subtitle burn-in filter string (ASS style overlay). */
function buildSubtitleFilter(style: SubtitleStyle, srtPath: string): string {
  const font = style.fontName.replace(/:/g, "\\:");
  const color = style.color;
  const outline = style.outlineColor;
  const size = style.fontSize;
  const outlineW = style.outlineWidth;

  const pos = style.position === "top" ? "alignment=8" : style.position === "center" ? "alignment=5" : "alignment=2";
  const marginV = style.marginV;

  return `subtitles=${srtPath.replace(/:/g, "\\:")}:force_style='FontName=${font},FontSize=${size},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=${outlineW},${pos},MarginV=${marginV}'`;
}

/** Build the full FFmpeg pipeline command array for a render manifest. */
export function buildRenderCommand(
  manifest: RenderManifest,
  workDir: string,
  opts: {
    narrationWavPath?: string;
    musicPath?: string;
    srtPath?: string;
    outputPath: string;
  }
): { steps: string[][]; concatListPath?: string } {
  const { mode, resolution, frameRate, assets, aspectRatio } = manifest;
  const res = RESOLUTION_MAP[resolution] ?? RESOLUTION_MAP["1080p"];
  const steps: string[][] = [];
  const segmentPaths: string[] = [];

  // Stage 1: generate per-image segments with motion
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const motion = asset.motion ?? pickMotionPreset(i, mode);
    const segPath = `${workDir}/seg_${String(i).padStart(4, "0")}.mp4`;
    segmentPaths.push(segPath);
    steps.push(buildImageSegmentCmd(asset, motion, resolution, frameRate, segPath));
  }

  // Stage 2: concat segments
  const listPath = `${workDir}/concat_list.txt`;
  // We return the concat list content separately so the caller can write it

  // Stage 3: build final encode with audio and optional subtitles
  const finalArgs: string[] = [
    "-f", "concat",
    "-safe", "0",
    "-i", listPath,
  ];

  // Audio inputs
  if (opts.narrationWavPath) {
    finalArgs.push("-i", opts.narrationWavPath);
  }
  if (opts.musicPath) {
    finalArgs.push("-i", opts.musicPath);
  }

  // Video filter: subtitles burn-in if requested
  let videoFilter = "";
  if (manifest.burnSubtitles && opts.srtPath) {
    videoFilter = buildSubtitleFilter(manifest.subtitleStyle, opts.srtPath);
  }

  // Audio filter
  let audioFilter = "";
  if (opts.narrationWavPath && opts.musicPath) {
    audioFilter = `[${opts.narrationWavPath ? "1" : "0"}:a][${opts.musicPath ? "2" : "1"}:a]amix=inputs=2:duration=first:dropout_transition=3`;
  }

  const vfParts: string[] = [];
  if (videoFilter) vfParts.push(videoFilter);
  // Ensure output aspect ratio
  const [arW, arH] = aspectRatio.split(":").map(Number);
  if (arW && arH) {
    const targetW = res.width;
    const targetH = Math.round(targetW * (arH / arW));
    vfParts.push(`scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:black`);
  }

  if (vfParts.length > 0) {
    finalArgs.push("-vf", vfParts.join(","));
  }

  if (audioFilter) {
    finalArgs.push("-af", audioFilter);
  }

  finalArgs.push(
    "-c:v", manifest.videoCodec,
    "-b:v", manifest.videoBitrate,
    "-c:a", manifest.audioCodec,
    "-b:a", manifest.audioBitrate,
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    "-y",
    opts.outputPath,
  );

  steps.push(finalArgs);

  return { steps, concatListPath: listPath };
}

/** Build concat list file content. */
export function buildConcatListContent(segmentPaths: string[]): string {
  return segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
}
