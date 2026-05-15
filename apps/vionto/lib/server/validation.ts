import { z } from "zod";

/**
 * Vionto file constraints — kept in sync with the project plan §6.2.1.
 * All entry points (presign, upload, zip import) share the same rules.
 */
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB per image
export const MAX_ZIP_BYTES = 500 * 1024 * 1024; // 500 MB per zip
export const MAX_BATCH_SIZE = 200; // max images per project
export const MIN_FILE_BYTES = 1;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/tiff",
] as const;

export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export const AUDIO_MIME_TYPES = [
  "audio/mp4", // .m4a
  "audio/mpeg", // .mp3
  "audio/wav",
  "audio/webm",
  "audio/ogg",
] as const;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
  "application/zip",
  "application/x-zip-compressed",
] as const;

export type AllowedUploadMime = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];
export type ImageMime = (typeof IMAGE_MIME_TYPES)[number];

/** Reject path traversal and weird unicode early. */
const safeFilename = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[^\\/:*?"<>|\u0000-\u001f]+$/, "filename contains invalid characters");

export const presignRequestSchema = z.object({
  filename: safeFilename,
  contentType: z.enum(ALLOWED_UPLOAD_MIME_TYPES),
  sizeBytes: z.number().int().min(MIN_FILE_BYTES).max(MAX_IMAGE_BYTES),
  sessionId: z.string().min(1).max(128).optional(),
});
export type PresignRequest = z.infer<typeof presignRequestSchema>;

export const uploadCompleteSchema = z.object({
  key: z.string().min(1).max(512),
  sessionId: z.string().min(1).max(128),
  metadata: z.object({
    filename: safeFilename,
    contentType: z.enum(ALLOWED_UPLOAD_MIME_TYPES),
    sizeBytes: z.number().int().min(MIN_FILE_BYTES).max(MAX_IMAGE_BYTES),
    width: z.number().int().min(1).optional(),
    height: z.number().int().min(1).optional(),
    exif: z.record(z.unknown()).optional(),
  }),
});
export type UploadCompletePayload = z.infer<typeof uploadCompleteSchema>;

export const zipImportSchema = z.object({
  key: z.string().min(1).max(512),
  sessionId: z.string().min(1).max(128),
  expectedCount: z.number().int().min(1).max(MAX_BATCH_SIZE).optional(),
});
export type ZipImportPayload = z.infer<typeof zipImportSchema>;

export const promoteSessionSchema = z.object({
  sessionId: z.string().min(1).max(128),
  orderedKeys: z.array(z.string().min(1).max(512)).max(MAX_BATCH_SIZE).optional(),
  clearSession: z.boolean().optional(),
});
export type PromoteSessionPayload = z.infer<typeof promoteSessionSchema>;

/**
 * Flatten a ZodError into a single human-readable string.
 */
export function formatZodError(err: z.ZodError): string {
  return err.issues
    .map((issue: z.ZodIssue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

// ─── Project schemas ──────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  mode: z.enum(["story", "slideshow", "documentary"]).default("story"),
  storyMode: z.string().optional(),
  locale: z.string().min(2).max(10).default("en"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3"]).default("16:9"),
  resolution: z.enum(["720p", "1080p", "4k"]).default("1080p"),
});

export const updateProjectSchema = createProjectSchema.partial();

// ─── Pagination schema ────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
