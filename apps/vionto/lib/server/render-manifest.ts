import { z } from "zod";

/**
 * Render manifest — shared contract between web UI, mobile app, and the
 * FFmpeg worker.  Every render job deserializes this manifest to build the
 * final command pipeline.
 */

export const subtitleStyleSchema = z.object({
  fontName: z.string().default("Arial"),
  fontSize: z.number().int().min(8).max(128).default(24),
  color: z.string().default("white"),
  outlineColor: z.string().default("black"),
  outlineWidth: z.number().int().min(0).max(8).default(2),
  position: z.enum(["bottom", "top", "center"]).default("bottom"),
  marginV: z.number().int().min(0).default(40),
});

export const motionPresetSchema = z.object({
  name: z.enum(["pan_left", "pan_right", "zoom_in", "zoom_out", "ken_burns", "static"]),
  startScale: z.number().min(1).max(3).default(1),
  endScale: z.number().min(1).max(3).default(1.15),
  startX: z.number().default(0),
  endX: z.number().default(0),
  startY: z.number().default(0),
  endY: z.number().default(0),
  durationSeconds: z.number().positive().default(5),
});

export const transitionPresetSchema = z.object({
  name: z.enum(["fade", "crossfade", "slide_left", "slide_right", "none"]),
  durationSeconds: z.number().min(0).max(2).default(0.5),
});

export const renderAssetSchema = z.object({
  storageKey: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().positive().default(5),
  motion: motionPresetSchema.optional(),
  transition: transitionPresetSchema.optional(),
});

export const audioTrackSchema = z.object({
  storageKey: z.string().min(1),
  type: z.enum(["narration", "music", "sfx"]),
  volume: z.number().min(0).max(2).default(1),
  fadeInSeconds: z.number().min(0).max(5).default(0),
  fadeOutSeconds: z.number().min(0).max(5).default(0),
  startOffsetSeconds: z.number().min(0).default(0),
  duckGainDuringNarration: z.number().min(0).max(1).optional(),
});

export const renderManifestSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
  jobId: z.string().min(1),

  mode: z.enum(["cinematic", "slideshow", "social"]).default("cinematic"),
  targetDurationSeconds: z.number().positive().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3"]).default("16:9"),
  resolution: z.enum(["720p", "1080p", "4k"]).default("1080p"),
  frameRate: z.number().int().positive().default(30),

  assets: z.array(renderAssetSchema).min(1).max(200),
  audioTracks: z.array(audioTrackSchema).max(8).default([]),

  narrationText: z.string().optional(),
  srtStorageKey: z.string().optional(),
  burnSubtitles: z.boolean().default(true),
  subtitleStyle: subtitleStyleSchema.default({}),

  outputFormat: z.enum(["mp4", "mov", "webm"]).default("mp4"),
  videoCodec: z.enum(["libx264", "libx265"]).default("libx264"),
  audioCodec: z.enum(["aac", "libmp3lame"]).default("aac"),
  videoBitrate: z.string().default("5000k"),
  audioBitrate: z.string().default("192k"),

  // Retry / worker metadata
  maxRetries: z.number().int().min(0).max(5).default(3),
  workerTimeoutSeconds: z.number().int().min(30).max(3600).default(600),
});

export type RenderManifest = z.infer<typeof renderManifestSchema>;
export type RenderAsset = z.infer<typeof renderAssetSchema>;
export type AudioTrack = z.infer<typeof audioTrackSchema>;
export type MotionPreset = z.infer<typeof motionPresetSchema>;
export type TransitionPreset = z.infer<typeof transitionPresetSchema>;
export type SubtitleStyle = z.infer<typeof subtitleStyleSchema>;

/** Validate and parse a raw manifest payload. */
export function parseManifest(payload: unknown): RenderManifest {
  return renderManifestSchema.parse(payload);
}

/** Safe parse that returns a result object instead of throwing. */
export function safeParseManifest(payload: unknown):
  | { success: true; data: RenderManifest }
  | { success: false; error: z.ZodError } {
  const result = renderManifestSchema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}
